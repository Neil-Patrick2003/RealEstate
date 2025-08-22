<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use App\Models\PropertyTripping;
use App\Notifications\InquiryResponse;
use App\Notifications\NewInquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request){

        $inquiries = Inquiry::with('seller', 'agent', 'property', 'buyer')
            ->where('agent_id', auth()->id())
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('type') && $request->type === 'my', function ($q) {
                $q->whereNotNull('seller_id');
            })
            ->when($request->filled('type') && $request->type === 'buyer', function ($q) {
                $q->whereNotNull('buyer_id');
            })
            ->orderByDesc('created_at')
            ->paginate($request->get('items_per_page', 10));



        $buyerInquiryCount = Inquiry::whereNotNull('buyer_id')->count();
        $sellerInquiryCount = Inquiry::whereNotNull('seller_id')->count();

        $inquiryCount = Inquiry::where('agent_id', auth()->id())->count();

        $rejectedCount = Inquiry::where('agent_id', auth()->id())
            ->where('status', 'rejected')
            ->count();

        $acceptedCount = Inquiry::where('agent_id', auth()->id())
            ->where('status', 'accepted')
            ->count();

        $pendingCount = Inquiry::where('agent_id', auth()->id())
            ->where('status', 'pending')
            ->count();

        $cancelledCount = Inquiry::where('agent_id', auth()->id())
            ->where('status', 'cancelled')
            ->count();

        return Inertia::render('Agent/Inquiry/Inquiries' , [
            'inquiries' => $inquiries,
            'inquiryCount' => $inquiryCount,
            'rejectedCount' => $rejectedCount,
            'acceptedCount' => $acceptedCount,
            'pendingCount' => $pendingCount,
            'cancelledCount' => $cancelledCount,
            'buyerInquiryCount' => $buyerInquiryCount,
            'sellerInquiryCount' => $sellerInquiryCount,
        ]);
    }

    public function store($id)
    {
        $property = Property::findOrFail($id);
        $seller = $property->seller;

        if (!$seller) {
            return redirect()->back()->with('error', 'Seller not found for this property.');
        }

        // Prevent duplicate inquiries
        $existing = Inquiry::where('agent_id', auth()->id())
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'You have already inquired about this property.');
        }

        $message = 'I\'m interested in this property.';

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

        return redirect()->route('agent.properties')->with('success', 'Inquiry submitted successfully.');
    }


    public function show($id)
    {

    }

//    public function update(Request $request, $id){
//        $inquiry = Inquiry::findOrFail($id);
//        $inquiry->update([
//            'status' => "Cancelled"
//        ]);
//
//        return redirect()->back()->with('success', 'Inquiry has been Cancelled.');
//    }

    // Accept inquiry (Buyer side)
    public function accept(Inquiry $inquiry)
    {

        $inquiry->update([
            'status' => 'Accepted',
        ]);

        $inquiry->load(['property', 'buyer', 'agent']);

        $buyer = $inquiry->buyer;

        $buyer->notify(new InquiryResponse([
            'status' => 'Accepted',
            'seller_name' => $inquiry->agent->name,
            'property_title' => $inquiry->property->title,
            'link' => '/inquiries'
        ]));

        return back()->with('success', 'Inquiry accepted successfully.');
    }

    // Reject inquiry (Buyer side)
    public function reject(Inquiry $inquiry)
    {
        if ($inquiry->status !== 'pending') {
            return back()->withErrors(['message' => 'Only pending inquiries can be rejected.']);
        }

        $inquiry->update([
            'status' => 'rejected',
        ]);

        return back()->with('success', 'Inquiry rejected successfully.');
    }

    // Cancel inquiry (Seller side)
    public function cancel(Inquiry $inquiry)
    {
        if ($inquiry->status !== 'pending') {
            return back()->withErrors(['message' => 'Only pending inquiries can be cancelled.']);
        }

        $inquiry->update(['status' => 'cancelled']);

        // Update related PropertyTripping if exists
        $propertyTripping = PropertyTripping::find($inquiry->id);

        if ($propertyTripping) {
            $propertyTripping->update(['status' => 'Cancelled']);
        }

        return back()->with('success', 'Inquiry cancelled successfully.');
    }


}
