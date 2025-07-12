<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\User;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(){

        $user = auth()->user();

        $properties = PropertyListing::where('agent_id', $user->id)->get();

        $totalListing = $properties->count();



        return Inertia::render('Agent/AgentDashboard', [
            'properties' => $properties,
            'totalListing' => $totalListing
        ]);
    }

    public function loadAgents() {
        $agents = User::where('role', 'agent')->select('id', 'name', 'email')->get();

        return Inertia::render('Seller/ListProperty', [
            'agents' => $agents
        ]);


    }


}
