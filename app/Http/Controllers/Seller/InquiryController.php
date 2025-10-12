<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\User;
use App\Notifications\InquiryResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $sellerId = auth()->id();

        $allCount = Inquiry::where('seller_id', $sellerId)->count();
        $acceptedCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Accepted')->count();
        $pendingCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Pending')->count();
        $rejectedCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Rejected')->count();
        $cancelledCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Cancelled')->count();

        $inquiries = Inquiry::with('property', 'agent', 'messages')
            ->where('seller_id', $sellerId)
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('agent', function ($q2) use ($request) {
                    $q2->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                $q->where('status', $request->status); // fixed typo: ->status() to ->where()
            })
            ->latest()
            ->paginate(10);

        //  Attach chat channel + first message
        $inquiries->getCollection()->transform(function ($inquiry) {
            $property = $inquiry->property;

            if ($property) {
                $chatChannel = \App\Models\ChatChannel::where('subject_type', \App\Models\Property::class)
                    ->where('subject_id', $property->id)
                    ->first();

                if ($chatChannel) {
                    $firstMessage = $chatChannel->messages()->oldest('created_at')->first();

                    $inquiry->chat_channel = [
                        'id' => $chatChannel->id,
                        'created_at' => $chatChannel->created_at,
                    ];

                    $inquiry->first_message = $firstMessage ? [
                        'id' => $firstMessage->id,
                        'message' => $firstMessage->content,
                        'created_at' => $firstMessage->created_at,
                    ] : null;
                } else {
                    $inquiry->chat_channel = null;
                    $inquiry->first_message = null;
                }
            } else {
                $inquiry->chat_channel = null;
                $inquiry->first_message = null;
            }

            return $inquiry;
        });

        return Inertia::render('Seller/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
            'allCount' => $allCount,
            'acceptedCount' => $acceptedCount,
            'pendingCount' => $pendingCount,
            'rejectedCount' => $rejectedCount,
            'cancelledCount' => $cancelledCount,
        ]);
    }





    public function updateStatus(Request $request, Inquiry $inquiry, $action)
    {


        if (!in_array($action, ['accept', 'reject'])) {
            abort(400, 'Invalid action');
        }

        $status = $action === 'accept' ? 'Accepted' : 'Rejected';
        $property = $inquiry->property;

        if ($status === 'Accepted') {

            // Count how many agents have already been accepted for this property
            $acceptedCount = Inquiry::where('property_id', $property->id)
                ->where('status', 'Accepted')
                ->count();

            if ($acceptedCount >= 3) {
                return back()->with('error', 'Maximum number of accepted agents (3) already reached.');
            }

            // Reject other inquiries if multiple agents are not allowed
            if (!$property->allow_multi_agents) {
                Inquiry::where('property_id', $property->id)
                    ->where('id', '!=', $inquiry->id)
                    ->where('status', 'Pending')
                    ->update(['status' => 'Rejected']);
            }

            // Check or create property listing
            $listing = PropertyListing::where('property_id', $property->id)->first();

            if (!$listing) {
                $listing = PropertyListing::create([
                    'property_id' => $property->id,
                    'seller_id'   => $inquiry->seller_id,
                    'status'      => 'Assigned',
                ]);
            }

            // Attach agent if not already attached
            if (!$listing->agents->contains($inquiry->agent_id)) {
                $listing->agents()->attach($inquiry->agent_id);
            }

            // If 3 agents have now been accepted, update property status
            if ($acceptedCount + 1 === 3) {
                $property->update(['status' => 'Assigned']);
            }
        }

        // Update the inquiry status
        $inquiry->update(['status' => $status]);

        $agent = $inquiry->agent;
        $seller = auth()->user();

        // Prepare notification data
        $notificationData = [
            'seller_name' => $seller->name,
            'status' => $status,
            'property_title' => $property->title,
        ];

        // Add listing URL if accepted
        if ($status === 'Accepted') {
            $notificationData['link'] = "/agents/my-listings/{$listing->id}";
        }

        // Send notification to the agent
        $agent->notify(new InquiryResponse($notificationData));

        return back()->with('success', "Inquiry successfully {$status}.");
    }


    public function show(User $agent){
        $agent = $agent->with('listing.property', 'feedbackAsReceiver.characteristics')->find($agent->id);

        return Inertia::render('Seller/Inquiries/ViewAgent', [
            'agent' => $agent,
        ]);
    }


}
