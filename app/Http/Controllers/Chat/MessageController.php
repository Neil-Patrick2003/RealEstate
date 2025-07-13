<?php

namespace App\Http\Controllers\Chat;

use App\Events\ChatChannelNewMessage;
use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, ChatChannel $channel)
    {
        $request->validate([
            'content' => 'required'
        ]);

        $message = $channel->messages()->create([
            'content' => $request->input('content'),
            'sender_id' => auth()->user()->id,
        ]);

        ChatChannelNewMessage::dispatch($message);

        return response()->noContent();
    }
}
