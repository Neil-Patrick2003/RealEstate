<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{

    public function store(Request $request, $id)
    {

        Message::create([
            'sender_id' => auth()->user()->id,
            'receiver_id' => $id,
            'message' => $request->message,
        ]);
        return redirect()->back();
    }

    public function show($id){
        $messages = Message::with([
            'inquiry' => function ($query) {
                $query->with(['property:id,title']); // 👈 only load id + title from property
            }
        ])
            ->where(function ($query) use ($id) {
                $query->where('sender_id', auth()->id())
                    ->where('receiver_id', $id)
                    ->orWhere(function ($query) use ($id) {
                        $query->where('sender_id', $id)
                            ->where('receiver_id', auth()->id());
                    });
            })
            ->orderBy('created_at')
            ->get();

        $users = User::where('id', '!=', auth()->id())
            ->where(function ($query) {
                $query->whereHas('buyerInquiriesAsAgent')
                    ->orWhereHas('sellerInquiriesAsAgent');
            })
            ->get(['name', 'id', 'email']);


        return Inertia::render('Agent/Inquiry/Inquiries', [
            'messages' => $messages,
            'selectedChatId' => $id,
            'users' => $users, // 👈 include users again
        ]);

    }
}
