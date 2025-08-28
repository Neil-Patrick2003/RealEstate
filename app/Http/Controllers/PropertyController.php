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

        $deal = null;

        $property->load('images', 'features', 'coordinate', 'seller', 'property_listing',  'property_listing.agents', 'property_listing.broker' );


        if ($property->property_listing) {
            $deal = Deal::where('property_listing_id', $property->property_listing->id)
                ->where('buyer_id', auth()->user()->id)
                ->first();
        }

        $property->increment('views');


        return Inertia::render('LandingPage/Property/ShowProperty', [
            'property' => $property,
            'deal' => $deal,
        ]);
    }
}

