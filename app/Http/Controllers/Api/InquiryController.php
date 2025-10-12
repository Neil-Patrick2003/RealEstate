<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use App\Models\Inquiry;
use App\Models\Property;
use App\Notifications\NewInquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index()
            {
                $inquiries = Inquiry::with('seller', 'buyer', 'property', 'messages', 'buyer')
                    ->where('agent_id', auth()->id())
                    ->orderByDesc('created_at')
                        ->get();

                return [
                    'data' => $inquiries,
                ];

    }

    public function store(Request $request, $id){

        $request->validate([
            'message' => 'required|max:255',
        ]);

        $property = Property::findOrFail($id);
        $seller = $property->seller;

        if (!$seller) {
            return [
                'error' => 'Seller not found for this property.'
            ];
        }

        // Prevent duplicate inquiries
        $existing = Inquiry::where('agent_id', auth()->id())
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            return [
                'error' => 'You have already inquired about this property.'
            ];
        }

        $message = $request->message;

        $inquiry = Inquiry::create([
            'agent_id' => auth()->id(),
            'seller_id' => $seller->id,
            'property_id' => $property->id,
            'message' => $message,
            'status' => 'Pending',
        ]);

        $seller->notify(new NewInquiry($inquiry));

        $channel = ChatChannel::create([
            'subject_id' => $property->id,
            'subject_type' => get_class($property),
            'title' => 'Inquiry',
        ]);

        $channel->members()->attach(auth()->id());
        $channel->members()->attach($seller->id);

        $channel->messages()->create([
            'content' => $message,
            'sender_id' => auth()->id(),
        ]);

        return [
            'success' => 'Inquiry submitted successfully.'
        ];
    }

    public function update(Request $request, $id, $action){

        if($action === 'accept'){
            $status = 'Accepted';
        }
        else if($action === 'decline'){
            $status = 'Declined';
        }
        else{
            $status = 'Cancelled';
        }

        $inquiry = Inquiry::findOrFail($id);
        $inquiry->update([
            'status' => $status
        ]);

        return response()->json([
            'success' => 'Inquiry has been updated.',
            'data' => $inquiry->fresh(['buyer', 'seller', 'property']),
        ]);
    }
}
