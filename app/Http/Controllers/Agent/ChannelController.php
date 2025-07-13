<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Inertia\Inertia;

class ChannelController extends Controller
{
    public function show(ChatChannel $channel)
    {
        $channel->load('members', 'messages.sender', 'subject');

        $channels = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->with('members', 'subject')
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return Inertia::render('Seller/Chat/Chat', [
            'channels' => $channels,
            'channel' => $channel
        ]);
    }
}
