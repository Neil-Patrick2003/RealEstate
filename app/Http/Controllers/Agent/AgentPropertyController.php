<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Inertia\Inertia;

class AgentPropertyController extends Controller
{
    public function index()
    {
        $properties = Property::select('id', 'title', 'price', 'address', 'property_type', 'sub_type', 'image_url',  'floor_area', 'lot_area',  'seller_id', 'total_rooms', 'bedrooms', 'bathrooms') // choose columns from Property
        ->with(['seller:id,name,email']) // choose columns from Seller
        ->get();


        return Inertia::render('Agent/Properties/SellerPostProperty', [
            'properties' => $properties
        ]);

    }
}
