<?php

namespace App\Http\Controllers\Property;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyListing;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function map()
    {
        $properties = PropertyListing::with('property.coordinate', 'property.images', 'agent:id,name,email,photo_url,contact_number')
            ->where('status', 'Published')
            ->get();

        return Inertia::render('Buyer/Properties/AllProperties', [
            'property_listing' => $properties,
        ]);
    }

    public function map_show($id){
        $property = Property::with('images', 'features', 'coordinate')->find($id);


        return Inertia::render('Buyer/Properties/PropertyInMapShow', [
            'property' => $property,
        ]);
    }
}
