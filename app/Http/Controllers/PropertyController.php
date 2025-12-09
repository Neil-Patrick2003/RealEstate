<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\User;
use Dflydev\DotAccessData\Data;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function show(Property $property)
    {


        $allAgents = User::where('role', 'agent')
            ->withCount('property_listings')
            ->with('feedbackReceived.characteristics')
            ->get();

        $property->load(
            'images',
            'features',
            'coordinate',
            'seller',
            'property_listing',
            'property_listing.agents',
            'property_listing.broker'
        );




        $property->increment('views');

        return Inertia::render('LandingPage/Property/ShowProperty', [
            'property' => $property,
            'allAgents' => $allAgents,
        ]);
    }

}

