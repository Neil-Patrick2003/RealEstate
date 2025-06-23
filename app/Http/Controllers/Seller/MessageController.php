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
    public function index()
    {
        $authUser = Auth::user();

        $users = User::where('id', '!=', $authUser->id)->get(['id', 'name']);

        $messages = Message::where('sender_id', $authUser->id)
                    ->orWhere('receiver_id', $authUser->id)
                    ->orderBy('created_at', 'asc')
                    ->get();

        return Inertia::render('Seller/Message/Index', [
            'users' => $users,
            'messages' => $messages,
            'auth' => $authUser,
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
