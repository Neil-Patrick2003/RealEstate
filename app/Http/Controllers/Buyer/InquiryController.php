<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index()
    {
        $inquiries = Inquiry::where('buyer_id', auth()->id())
            ->with('property', 'agent', 'messages')
        ->latest()->paginate(10);

//        dd($inquiries->toArray());

        return Inertia::render('Buyer/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
        ]);
    }

    public function store(Request $request, $id)
    {

        //validate
        $validated = $request->validate([
            'message' => 'required|max:255',
        ]);

        //get property
        $property = Property::findOrFail($id);

        // Prevent duplicate inquiries
        $existing = Inquiry::where('buyer_id', auth()->id())
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'You have already inquired about this property.');
        }

        //create inquiry

        $agent_id = $property->property_listing->agent_id;

        $inquiry = Inquiry::create([
            'buyer_id' => auth()->id(),
            'agent_id' => $agent_id,
            'property_id' => $property->id,
            'status' => 'pending',
        ]);

        //create message
        Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $agent_id,
            'property_id' => $property->id,
            'message' => $validated['message'],
            'inquiry_id' => $inquiry->id,
        ]);

        return redirect()->back()->with('success', 'Inquiry submitted successfully.');
    }
}
