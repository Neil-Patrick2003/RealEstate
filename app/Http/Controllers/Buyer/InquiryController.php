<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Seller\TrippingController;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use App\Models\PropertyTripping;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $inquiries = Inquiry::where('buyer_id', auth()->id())
            ->with('property', 'agent', 'messages')
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->status($request->status);
            })
        ->latest()->paginate(10);

        $allCount = Inquiry::where('buyer_id', auth()->id())->count();
        $pendingCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Pending')->count();
        $scheduledCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Follow-Up Scheduled')->count();
        $cancelledCount = Inquiry::where('buyer_id', auth()->id())
            ->where('status', 'like', '%Cancelled%')
            ->count();
        $closeCount = Inquiry::where('buyer_id', auth()->id())
            ->where('status', 'like', '%Close%')
            ->count();
        $rejectCount = Inquiry::where('buyer_id', auth()->id())->where('status', 'Rejected')->count();


        return Inertia::render('Buyer/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
            'allCount' => $allCount,
            'pendingCount' => $pendingCount,
            'scheduledCount' => $scheduledCount,
            'cancelledCount' => $cancelledCount,
            'closeCount' => $closeCount,
            'rejectCount' => $rejectCount,
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

    public  function cancel($id){


    //find inquiry
        $inquiry = Inquiry::findOrFail($id);

        //check if inquiry

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
}
