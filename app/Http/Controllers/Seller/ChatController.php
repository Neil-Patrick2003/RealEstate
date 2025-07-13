<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index() {
        $channels = ChatChannel::whereHas('members', function ($q) {
            $q->where('users.id', auth()->id());
        })
            ->with('members')
            ->orderBy('last_activity_at', 'desc')
            ->get();

        if ($channels->count() > 0) {
        }

        dd($channels->toArray());
    }
}
