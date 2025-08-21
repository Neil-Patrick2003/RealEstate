<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Property;
use Dflydev\DotAccessData\Data;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function show(Property $property )
    {
        $property->load('images', 'features', 'coordinate', 'seller', 'property_listing.agents', 'property_listing.broker' );


        $property->increment('views');

        return Inertia::render('LandingPage/Property/ShowProperty', [
            'property' => $property,
        ]);
    }
}
