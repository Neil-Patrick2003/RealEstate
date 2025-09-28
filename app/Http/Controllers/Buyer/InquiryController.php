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
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $inquiries = Inquiry::where('buyer_id', auth()->id())
            ->with('property', 'agent', 'messages', 'trippings', 'broker')
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

    public function show(Property $property)
    {
        $deal = null;
        $inquiry = null;

        $property->load('images', 'features', 'coordinate', 'seller', 'property_listing.agent', );

        if ($property->property_listing) {
            $deal = Deal::where('property_listing_id', $property->property_listing->id)
                ->where('buyer_id', auth()->user()->id)
                ->first();
        }

        if ($property->property_listing) {
            $inquiry = Inquiry::where('property_id', $property->property_listing->property_id)
                ->where('buyer_id', auth()->user()->id)
                ->first();

        }


        return Inertia::render('Buyer/Inquiries/ShowInquiry', [
            'property' => $property,
            'deal' => $deal,
            'inquiry' => $inquiry,
        ]);





    }
}
