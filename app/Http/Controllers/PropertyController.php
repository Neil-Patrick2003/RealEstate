<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function show(Property $property )
    {
        $deal = null;
        $property->load('images', 'features', 'coordinate', 'seller', 'property_listing');

        if ($property->property_listing) {
            $deal = Deal::where('property_listing_id', $property->property_listing->id)
                ->where('buyer_id', auth()->user()->id)
                ->first();
        }

        return Inertia::render('Property/PropertyDetails', [
            'property' => $property,
            'deal' => $deal,
        ]);
    }
}
