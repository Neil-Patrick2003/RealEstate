<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use Inertia\Inertia;

class PropertyListingController extends Controller
{
    public function index()
    {
        $properties = PropertyListing::with('property')
            ->get();

        return Inertia::render('Agent/PropertyListing/Properties', [
            'properties' => $properties
        ]);
    }
}
