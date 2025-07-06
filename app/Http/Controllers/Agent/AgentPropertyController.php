<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Inertia\Inertia;

class AgentPropertyController extends Controller
{
    public function index()
    {
        $properties = Property::select(
            'id', 'title', 'status', 'price', 'address', 'property_type',
            'sub_type', 'image_url', 'floor_area', 'lot_area',
            'seller_id', 'total_rooms', 'bedrooms', 'bathrooms'
        )
            ->where('status', '=', 'Unassigned') // Only properties with status 'pending'
            ->with(['seller:id,name,email'])   // Eager load seller with limited fields
            ->get();

        return Inertia::render('Agent/Properties/SellerPostProperty', [
            'properties' => $properties
        ]);

    }
}
