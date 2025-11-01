<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Seller\TrippingController;
use App\Models\ChatChannel;
use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use App\Models\PropertyTripping;
use App\Models\User;
use App\Notifications\NewInquiry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $inquiries = Inquiry::where('buyer_id', auth()->id())
            ->with('property', 'agent', 'messages', 'trippings', 'broker', 'agent.agent_trippings', 'agent.feedbackReceived' )
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->status($request->status);
            })
            ->latest()
            ->paginate(10);





        $allCount = Inquiry::where('buyer_id', auth()->id())->count();
        $pendingCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Pending')->count();
        $acceptedCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Accepted')->count();
        $cancelledCount = Inquiry::where('buyer_id', auth()->id())
            ->where('status', 'like', '%Cancelled%')
            ->count();
        $rejectCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Rejected')->count();

        return Inertia::render('Buyer/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
            'allCount' => $allCount,
            'pendingCount' => $pendingCount,
            'cancelledCount' => $cancelledCount,
            'acceptedCount' => $acceptedCount,
            'rejectCount' => $rejectCount,
        ]);
    }



    public function store(Request $request, $id)
    {

        // Only buyers can inquire
        if (auth()->user()->role !== 'Buyer') {
            return redirect()->back()->with('error', 'You are not authorized to inquire about this property.');
        }

        // Validate input
        $validated = $request->validate([
            'message' => 'required|max:255',
            'person' => 'required',
        ]);


        // Fetch recipient user (agent or broker)
        $recipient = User::select('id', 'role')->findOrFail($request->person);


        // Fetch property
        $property = Property::findOrFail($id);


        // Prevent duplicate inquiries
        $existing = Inquiry::where('buyer_id', auth()->id())
            ->where('property_id', $property->id)
            ->where('status', 'Pending')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'You have already inquired about this property.');
        }

        $key = $recipient->role === 'Agent' ? 'agent_id' : 'broker_id';

        $inquiry = Inquiry::create([
            'buyer_id'    => auth()->id(),
            'property_id' => $property->id,
            'status'      => 'pending',
            'notes'       => $validated['message'],
            $key          => $recipient->id,
        ]);

        $recipient->notify(new NewInquiry($inquiry));

        $channel = ChatChannel::create([
            'subject_id' => $property->id,
            'subject_type' => get_class($property),
            'title' => 'Inquiry',
        ]);

        $channel->load('members');

        if (!$channel->members->contains('id', auth()->id())) {
            $channel->members()->attach(auth()->id());
        }

        if (!$channel->members->contains('id', $recipient->id)) {
            $channel->members()->attach($recipient->id);
        }




        $channel->messages()->create([
            'content' => $validated['message'],
            'sender_id' => auth()->id(),
        ]);


        return redirect()->back()->with('success', 'Inquiry submitted successfully.');
    }

    public  function cancel($id){

        $inquiry = Inquiry::findOrFail($id);

        $existingTripping = PropertyTripping::where('inquiry_id', $inquiry->id)->first();



        if ($existingTripping) {
            $existingTripping->update([
                'status' => 'Cancelled',
            ]);
        }

        $inquiry->update([
            'status' => 'Cancelled by Buyer',
        ]);

        return redirect()->back()->with('success', 'Inquiry cancelled successfully.');
    }

    public function show(Inquiry $inquiry)
    {
        $userId = auth()->id();
        $tz     = 'Asia/Manila';
        $now    = Carbon::now($tz);

        // Load inquiry-side relations (scoped trippings for this buyer)
        $inquiry->load([
            'agent',
            'trippings' => fn ($q) => $q->where('buyer_id', $userId)->latest()->limit(1),
        ]);





        // Load property + latest buyer-scoped relations (NO buyer inquiries)
        $property = Property::findOrFail($inquiry->property_id);

        $chatChannel = ChatChannel::where('subject_id', $property->id)
            ->with('members', 'messages')
            ->whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->first();

        dd($chatChannel->toArray());

        $property->load([
            'images',
            'features',
            'coordinate',
            'seller',

            // latest deal for this buyer
            'property_listing.deals' => fn ($q) =>
            $q->where('buyer_id', $userId)->latest()->limit(1),

            // latest tripping (visit) for this buyer
            'trippings' => fn ($q) =>
            $q->where('buyer_id', $userId)->latest()->limit(1),
        ]);

        // Collapse collections → single models (may be null)
        $latestTripping = optional($property->trippings)->first();
        $deal           = optional(optional($property->property_listing)->deals)->first();

        // Shrink payload for frontend
        unset($property->trippings);
        if (isset($property->property_listing)) {
            unset($property->property_listing->deals);
        }

        /* -------------------- Normalize statuses -------------------- */

        // Inquiry status (normalize)
        $iStatusRaw = strtolower($inquiry->status ?? 'pending');
        $iStatusKey = str_replace(' ', '_', trim(preg_replace('/\s+/', ' ', $iStatusRaw)));
        $iStatus = match ($iStatusKey) {
            'closed_with_deal', 'closed_w_deal', 'closed_w/_deal'      => 'closed_with_deal',
            'closed_no_deal', 'closed_without_deal', 'closed_w/o_deal' => 'closed_no_deal',
            'under_negotiation', 'negotiation', 'in_negotiation'       => 'under_negotiation',
            'accepted', 'pending', 'rejected'                           => $iStatusKey,
            default                                                     => $iStatusKey,
        };

        // Appointment / tripping status (prefer tripping; fallback to inquiry.appointment_status)
        $apptRaw = strtolower(
            $latestTripping->status
            ?? ($inquiry->appointment_status ?? 'none')
        );
        $appt = match ($apptRaw) {
            'completed','complete','done','finished' => 'done',
            'sched','scheduled','approved'           => 'scheduled',
            'request','requested','pending_approval' => 'requested',
            'cancel','cancelled','canceled'          => 'cancelled',
            default                                  => $apptRaw, // 'none' or passthrough
        };

        // Deal status → normalized phase
        $dStatusRaw = strtolower($deal->status ?? 'draft');
        $dStatusKey = str_replace(' ', '_', trim(preg_replace('/\s+/', ' ', $dStatusRaw)));
        $dPhase = match ($dStatusKey) {
            // offer accepted → payment can open
            'accepted','seller_accepted','buyer_accepted','countered_accepted' => 'accepted',
            // payment / escrow in progress
            'paid','processing','in_escrow','in_progress','funding','awaiting_payment' => 'processing',
            // fully finished / closed (includes "sold")
            'closed','completed','settled','finalized','done','sold' => 'closed',
            // explicitly not going forward
            'rejected','declined','expired','canceled','cancelled','cancellation' => 'terminated',
            // draft/sent/countered/etc.
            default => $dStatusKey,
        };
        $dealTerminated = ($dPhase === 'terminated');

        /* -------------------- Visit window (UI hint) -------------------- */

        $visitStart = null;
        if (!empty($latestTripping?->visit_date)) {
            $vt = $latestTripping->visit_time ?: '00:00:00';
            $visitStart = Carbon::createFromFormat('Y-m-d H:i:s', "{$latestTripping->visit_date} {$vt}", $tz);
        } elseif (!empty($inquiry?->appointment_at)) {
            $visitStart = Carbon::parse($inquiry->appointment_at, $tz);
        }

        $visitEnd = null;
        if (!empty($inquiry?->appointment_end)) {
            $visitEnd = Carbon::parse($inquiry->appointment_end, $tz);
        } elseif ($visitStart) {
            $visitEnd = $visitStart; // simple hint if you don't track end
        }

        /* -------------------- Gates & derived statuses -------------------- */

        // Accepted or beyond (accepted → under_negotiation → closed_with_deal)
        $acceptedOrBeyond = in_array($iStatus, ['accepted','under_negotiation','closed_with_deal'], true);

        // Offer unlocks only after visit is done (strict rule)
        $unlockOfferOn  = 'done';
        $canUnlockOffer = $acceptedOrBeyond && ($appt === 'done');

        // Derived UI inquiry status (based on deal)
        $uiInquiryStatus = $iStatus;
        if (!in_array($iStatus, ['closed_with_deal','closed_no_deal'], true)) {
            if ($dPhase === 'closed') {
                $uiInquiryStatus = 'closed_with_deal';
            } elseif (in_array($dPhase, ['accepted','processing'], true)) {
                $uiInquiryStatus = 'under_negotiation';
            } elseif ($dealTerminated) {
                // fall back to accepted if negotiation ended (unless already closed_*)
                $uiInquiryStatus = 'accepted';
            }
        }

        /* -------------------- Steps mapping -------------------- */

        $steps = [
            // Inquiry
            'inquiry' => match (true) {
                in_array($uiInquiryStatus, ['under_negotiation','closed_with_deal','closed_no_deal','accepted'], true) => 'complete',
                $iStatus === 'rejected' => 'locked',
                default => 'current',
            },

            // Appointment
            'appointment' => !$acceptedOrBeyond
                ? 'locked'
                : (in_array($appt, ['done'], true)
                    ? 'complete'
                    : (in_array($appt, ['scheduled','requested','cancelled'], true)
                        ? 'current'
                        : 'upcoming')),

            // Offer
            'offer' => !$acceptedOrBeyond
                ? 'locked'
                : ($canUnlockOffer
                    ? ( $dealTerminated
                        ? 'upcoming'
                        : (in_array($dPhase, ['accepted','processing','closed'], true) ? 'complete' : 'upcoming')
                    )
                    : 'locked'),

            // Payment
            'payment' => match (true) {
                $dealTerminated        => 'locked',
                $dPhase === 'closed'   => 'complete',
                in_array($dPhase, ['accepted','processing'], true) => 'current',
                default                => 'locked',
            },

            // Close
            'close' => $uiInquiryStatus === 'closed_with_deal' ? 'complete' : 'locked',
        ];

        /* -------------------- Force completion for closed inquiries -------------------- */
        if (in_array($uiInquiryStatus, ['closed_with_deal', 'closed_no_deal'], true)) {
            $steps['appointment'] = 'complete';
            $steps['offer']       = 'complete';
            if ($uiInquiryStatus === 'closed_with_deal') {
                $steps['payment'] = 'complete';
            }
        }

        /* -------------------- UI notes (banners) -------------------- */

        $notes = [
            'inquiry' => match (true) {
                $iStatus === 'pending' => 'Waiting for agent approval before proceeding to the next step.',
                $uiInquiryStatus === 'under_negotiation' => 'Offer accepted by agent — you are now under negotiation.',
                default => null,
            },
            'appointment' => match (true) {
                !$acceptedOrBeyond => null,
                $appt === 'scheduled' => 'You can reschedule or cancel your visit.',
                $appt === 'cancelled' => 'Visit was cancelled. You may schedule a new visit.',
                default => null,
            },
            'offer' => match (true) {
                $dealTerminated => 'Your previous offer was canceled/rejected. You can submit a new offer.',
                $canUnlockOffer => null,
                $acceptedOrBeyond && $appt !== 'done' => 'Offer will unlock after your appointment is completed.',
                default => null,
            },
            'payment' => match (true) {
                $dealTerminated => 'Payment is not required because the deal was canceled/rejected.',
                in_array($dPhase, ['accepted','processing'], true) => 'Payment is in progress (processing).',
                $uiInquiryStatus === 'closed_with_deal' => 'Payment completed.',
                default => null,
            },
            'close' => match (true) {
                $uiInquiryStatus === 'closed_with_deal' => 'Closed with deal.',
                $uiInquiryStatus === 'closed_no_deal'   => 'Closed — no deal.',
                default => null,
            },
        ];


        /* -------------------- Render -------------------- */

        return Inertia::render('Buyer/Inquiries/ShowInquiry', [
            'property'        => $property,
            'inquiry'         => $inquiry,   // ← use the one passed from the route
            'deal'            => $deal,
            'steps'           => $steps,
            'notes'           => $notes,
            'uiInquiryStatus' => $uiInquiryStatus,
            'dealPhase'       => $dPhase,
            'visitGate'       => [
                'unlockOn'   => $unlockOfferOn, // 'done'
                'visitStart' => $visitStart?->toIso8601String(),
                'visitEnd'   => $visitEnd?->toIso8601String(),
                'now'        => $now->toIso8601String(),
                'isStarted'  => (bool) ($visitStart && $now->gte($visitStart)),
                'isFinished' => (bool) ($visitEnd ? $now->gte($visitEnd) : ($visitStart && $now->gte($visitStart))),
            ],
        ]);
    }



}
