<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyListing;

class PropertyListingController extends Controller
{
    public function index()
    {
        $properties = PropertyListing::where('agent_id', auth()->id())->get();

        return [
            'data' => $properties,
        ];
    }
}
