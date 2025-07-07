<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyListing;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(){

        $user = auth()->user();
        $notifications = $user->unreadNotifications;

        $properties = PropertyListing::where('agent_id', $user->id)->get();


//        dd($properties->toArray());


        return Inertia::render('Agent/AgentDashboard');
    }

}
