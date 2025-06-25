<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Inertia\Inertia;

class AgentPropertyController extends Controller
{
    public function index()
    {
        $properties = Property::select('id', 'title', 'price', 'address', 'property_type', 'sub_type', 'floor_area', 'lot_area',  'seller_id') // choose columns from Property
        ->with(['seller:id,name,email']) // choose columns from Seller
        ->get();


        return Inertia::render('Agent/Properties/SellerPostProperty', [
            'properties' => $properties
        ]);

    }
}
