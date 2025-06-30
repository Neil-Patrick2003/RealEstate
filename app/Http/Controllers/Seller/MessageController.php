<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
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

        return Inertia::render('Seller/Message/Index', [
            'users' => $users,
            'messages' => $messages,
            'auth' => $authUser,
            'selectedUserId' => $request->selectedUserId, // ✅ Pass selected user ID
        ]);
    }

    public function send(Request $request, $receiverId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $receiverId,
            'message' => $request->message,
        ]);

        return redirect()->back();
    }
}
