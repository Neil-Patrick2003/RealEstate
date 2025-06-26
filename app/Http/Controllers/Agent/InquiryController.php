<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Message;
use App\Models\Property;
use App\Models\User;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index() {
        $users = User::where('id', '!=', auth()->id())
            ->where(function ($query) {
                $query->whereHas('buyerInquiriesAsAgent')
                    ->orWhereHas('sellerInquiriesAsAgent');
            })
            ->get(['name', 'id', 'email']);


        return Inertia::render('Agent/Inquiry/Inquiries', [
            'users' => $users
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


}
