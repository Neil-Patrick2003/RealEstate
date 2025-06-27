<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request){


        $inquiries = Inquiry::with('buyer', 'seller', 'agent', 'property')
            ->where('agent_id', auth()->id())
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->where('status', '=', $request->status);
            })
            ->orderByDesc('created_at') // ✅ sort before paginate
            ->paginate($request->get('items_per_page', 10));

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
        ]);
    }

    public function store($id)
    {

        $property = Property::findOrFail($id);


        $message = 'Im interested in this property.';
        $inquiry = Inquiry::create([
            'agent_id' => auth()->user()->id,
            'seller_id' => $property->seller()->first()->id,
            'property_id' => $property->id,
            'message' => $message,
            'status' => 'Pending'
        ]);

        Message::create([
            'sender_id' => auth()->user()->id,
            'receiver_id' => $property->seller()->first()->id,
            'property_id' => $property->id,
            'message' => $message,
            'inquiry_id' => $inquiry->id

        ]);

        return redirect()->back();
    }

    public function show($id)
    {

    }

    public function update(Request $request, $id){
        $inquiry = Inquiry::findOrFail($id);
        $inquiry->update([
            'status' => "Cancelled"
        ]);

        return redirect()->back();
    }


}
