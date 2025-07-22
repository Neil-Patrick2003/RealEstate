<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;

class ChatController extends Controller
{
    public function index()
    {
        $channels = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->with(['members' => function ($q) {
                $q->where('users.id', '!=', auth()->id()); // Only the chatmate
            }])
            ->orderBy('last_activity_at', 'desc')
            ->get();

        $chatmates = $channels->map(function ($channel) {
            $chatmate = $channel->members->first(); // The other user in the 1-on-1 chat

            return [
                'channel_id'     => $channel->id,
                'chatmate_id'    => $chatmate->id,
                'chatmate_name'  => $chatmate->name,
                'chatmate_email' => $chatmate->email ?? null, // Optional
                'chatmate_avatar'=> $chatmate->avatar ?? null, // Optional
                'last_activity'  => $channel->last_activity_at,
            ];
        });

        return ['data' => $chatmates];

    }

    public function show(ChatChannel $channel)
    {

        $channel->load('members', 'messages.sender', 'subject');

        $channels = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->with('members', 'subject')
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return response()->json([
            'current_channel' => $channel,
            'all_channels' => $channels,
        ]);
    }

}
