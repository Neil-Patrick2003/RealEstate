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
            ->with('property', 'agent', 'messages', 'trippings', 'broker', 'agent.agent_trippings')
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->status($request->status);
            })
            ->latest()
            ->paginate(10);


//        dd($inquiries->toArray());


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
        $tz = 'Asia/Manila';
        $now = Carbon::now($tz);


        $property = Property::findOrFail($inquiry->property_id);

        $property->load([
            'images',
            'features',
            'coordinate',
            'seller',
            'property_listing.deals' => fn ($q) => $q->where('buyer_id', $userId)->latest()->limit(1),
            // Load only the buyer's latest inquiry, with agent & broker
            'inquiries' => fn ($q) => $q
                ->where('buyer_id', $userId)
                ->with(['agent', 'broker'])
                ->latest()
                ->limit(1),
        ]);



        // May be null if the buyer has not inquired yet
        $inquiry = optional($property->inquiries)->first(); // will be null or model
        unset($property->inquiries);
        $deal    = optional(optional($property->property_listing)->deals)->first();

        // Null-safe enums with sensible defaults
        $iStatus = strtolower($inquiry->status ?? 'pending');                  // pending|accepted|rejected
        $appt    = strtolower($inquiry->appointment_status ?? 'none');         // none|requested|scheduled|done|cancelled
        $dStatus = strtolower($deal->status ?? 'draft');                       // draft|sent|countered|accepted|rejected|expired

        // Null-safe visit window
        $visitStart = $inquiry?->appointment_at
            ? Carbon::parse($inquiry->appointment_at, $tz)
            : null;

        $visitEnd = $inquiry?->appointment_end
            ? Carbon::parse($inquiry->appointment_end, $tz)
            : null;

        // Offer unlock rule: after visit START (or change to 'end')
        $unlockOfferOn   = 'start'; // or 'end'
        $visitStarted    = $visitStart && $now->gte($visitStart);
        $visitFinished   = $visitEnd ? $now->gte($visitEnd) : $visitStarted; // if no end, treat start as finish
        $canUnlockByTime = $unlockOfferOn === 'end' ? $visitFinished : $visitStarted;

        $canUnlockOffer =
            $iStatus === 'accepted'
            && !in_array($appt, ['none','cancelled'], true)
            && $canUnlockByTime;

        // Build steps defensively (works even when $inquiry is null)
        $steps = [
            'inquiry' => match ($iStatus) {
                'accepted' => 'complete',
                'rejected' => 'locked',
                default    => 'current', // no inquiry yet or pending → current
            },

            'appointment' => $iStatus !== 'accepted'
                ? 'locked'
                : (in_array($appt, ['done'], true)
                    ? 'complete'
                    : (in_array($appt, ['scheduled','requested'], true)
                        ? 'current'
                        : 'upcoming')),

            'offer' => $iStatus !== 'accepted'
                ? 'locked'
                : ($canUnlockOffer
                    ? ($dStatus === 'accepted' ? 'complete' : 'upcoming')
                    : 'locked'),

            'payment' => $dStatus === 'accepted' ? 'upcoming' : 'locked',
        ];

        // Clean payload
        unset($property->inquiries);
        if (isset($property->property_listing)) {
            unset($property->property_listing->deals);
        }

        return Inertia::render('Buyer/Inquiries/ShowInquiry', [
            'property'  => $property,
            'inquiry'   => $inquiry, // may be null — frontend uses optional chaining
            'deal'      => $deal,
            'steps'     => $steps,
            'visitGate' => [
                'unlockOn'   => $unlockOfferOn,
                'visitStart' => $visitStart?->toIso8601String(),
                'visitEnd'   => $visitEnd?->toIso8601String(),
                'now'        => $now->toIso8601String(),
                'isStarted'  => (bool) $visitStarted,
                'isFinished' => (bool) $visitFinished,
            ],
        ]);
    }
}
