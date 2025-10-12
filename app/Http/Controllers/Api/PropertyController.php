<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::with('seller:id,name,email,photo_url,contact_number')
        ->where('status', 'Unassigned')->get();

        return [
            'data' => $properties,
        ];
    }

//    bago to pag pinindot properties

    public function show($id){
        $property = Property::with(['seller:id,name,email,photo_url,contact_number', 'images', 'features', 'coordinate'])->find($id);

        return [
            'data' => $property,
        ];
    }


}
