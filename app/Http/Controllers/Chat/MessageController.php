<?php

namespace App\Http\Controllers\Chat;

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

        $channel->messages()->create([
            'content' => $request->input('content'),
            'sender_id' => auth()->user()->id,
        ]);

        return response()->noContent();
    }
}
