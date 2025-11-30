<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $channels = ChatChannel::with(['members', 'subject'])
            ->withCount([
                // optional: total messages (gives messages_count)
                'messages',

                // unread messages for this user (gives unread_count)
                'messages as unread_count' => function ($q) use ($userId) {
                    $q->whereNull('read_at')
                        ->where('sender_id', '!=', $userId);
                },
            ])
            ->whereHas('members', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            })
            ->orderByDesc('last_activity_at')
            ->get();



        // pick first channel as selected (or null if none)
        $currentChannel = $channels->first();

        if ($currentChannel) {
            return redirect(route('broker.chat.channels.show', $currentChannel->id));
        }

        return Inertia::render('Broker/Chat/Index', [
            'channels' => $channels,
            'channel'  => $currentChannel,
        ]);
    }
}
