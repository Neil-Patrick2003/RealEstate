<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index() {
        $channel = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->orderBy('last_activity_at', 'desc')
            ->first();

        if ($channel) {
            return redirect(route('buyer.chat.channels.show', $channel->id));
        }

        return Inertia::render('Buyer/Chat/Chat', [
            'channels' => [],
            'channel' => $channel
        ]);
    }
}
