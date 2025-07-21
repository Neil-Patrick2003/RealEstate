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


}
