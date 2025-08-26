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
            ->with(['seller:id,name,contact_number,email,photo_url'])   // Eager load seller with limited fields
            ->get();

        return Inertia::render('Agent/Properties/SellerPostProperty', [
            'properties' => $properties
        ]);
    }

    public function show(Property $property)
    {
        $property = $property->with(['seller:id,name,contact_number,email,photo_url', 'images', 'coordinate', 'features', 'coordinate'])->find($property->id);

        return Inertia::render('Agent/Properties/PropertyDetails', [
            'property' => $property
        ]);
    }
}
