<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{

    public function index() {
        $authUser = Auth::user();

        $users = User::where('id', '!=', $authUser->id)->get(['id', 'name']);
        



        $messages = Message::with([
            'inquiry.property:id,title,image_url,property_type,sub_type,price,address',
            'inquiry.agent:id,name'
        ])
            ->where('sender_id', $authUser->id)
            ->orWhere('receiver_id', $authUser->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Agent/Messages/Messages', [
            'users' => $users,
            'messages' => $messages,
            'auth' => $authUser,
        ]);

    }

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
                $query->with(['property:id,title,image_url']); // 👈 only load id + title from property
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



        return Inertia::render('Agent/Messages/Messages', [
            'messages' => $messages,
            'selectedChatId' => $id,
            'users' => $users, // 👈 include users again
        ]);

    }
}
