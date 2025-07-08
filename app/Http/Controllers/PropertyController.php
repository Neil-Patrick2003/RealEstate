<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function show(Property $property )
    {
        $property->load('images', 'features', 'coordinate');

        return Inertia::render('Property/PropertyDetails', [
            'property' => $property,
        ]);
    }
}
