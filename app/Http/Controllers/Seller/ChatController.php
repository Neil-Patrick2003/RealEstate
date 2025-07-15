<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
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
            return redirect(route('seller.chat.channels.show', $channel->id));
        }

        return Inertia::render('Seller/Chat/Chat', [
            'channels' => [],
            'channel' => $channel
        ]);
    }
}
