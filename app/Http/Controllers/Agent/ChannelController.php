<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Inertia\Inertia;

class ChannelController extends Controller
{
    public function show(ChatChannel $channel)
    {
        // 1) Get current user id
        $userId = auth()->id();

        // 2) Mark all messages in THIS channel, sent by OTHER users, as read
        $channel->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $userId)
            ->update([
                'read_at' => now(),
            ]);

        // 3) Load relationships for the selected channel
        $channel->load('members', 'messages.sender', 'subject');

        // 4) Build the sidebar channels list with unread_count
        $channels = ChatChannel::whereHas('members', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
            ->with('members', 'subject')
            ->withCount([
                // total messages (optional, gives messages_count)
                'messages',

                // unread messages for this user (gives unread_count)
                'messages as unread_count' => function ($q) use ($userId) {
                    $q->whereNull('read_at')
                        ->where('sender_id', '!=', $userId);
                },
            ])
            ->orderBy('last_activity_at', 'desc')
            ->get();

        // 5) Render Inertia page
        return Inertia::render('Agent/Chat/Chat', [
            'channels' => $channels,
            'channel'  => $channel,
        ]);
    }


}
