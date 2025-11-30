<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Inertia\Inertia;

class ChannelController extends Controller
{
    public function index()
    {
        public function show(ChatChannel $channel)
    {
        $userId = auth()->id();

        // Mark messages in THIS channel from others as read
        $channel->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $userId)
            ->update([
                'read_at' => now(),
            ]);

        $channel->load('members', 'messages.sender', 'subject');

        $channels = ChatChannel::whereHas('members', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
            ->with('members', 'subject')
            ->withCount([
                'messages',
                'messages as unread_count' => function ($q) use ($userId) {
                    $q->whereNull('read_at')
                        ->where('sender_id', '!=', $userId);
                },
            ])
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return Inertia::render('Broker/Chat/Index', [
            'channels' => $channels,
            'channel'  => $channel,
        ]);
    }
    }
}
