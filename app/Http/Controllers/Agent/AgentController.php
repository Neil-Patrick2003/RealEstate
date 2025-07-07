<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(){

        $user = auth()->user();
        $notifications = $user->unreadNotifications; // collection of unread notifications

        return Inertia::render('Agent/AgentDashboard');
    }

}
