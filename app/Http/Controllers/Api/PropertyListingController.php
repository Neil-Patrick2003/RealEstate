<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyListing;

class PropertyListingController extends Controller
{
    public function index()
    {
        $properties = PropertyListing::with('property', 'seller')
        ->where('agent_id', auth()->id())->get();

        return [
            'data' => $properties,
        ];
    }

        public function show($id)
    {
        $inquiry = PropertyListing::with('property', 'seller', 'property.features', 'property.images', 'property.coordinate')->find($id);

        return [
            'data' => $inquiry,
        ];
    }
}
