<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index() {
        $channel = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->orderBy('last_activity_at', 'desc')
            ->first();

        if ($channel) {
            return redirect(route('agents.chat.channels.show', $channel->id));
        }

        dd($channel->toArray());
    }
}
