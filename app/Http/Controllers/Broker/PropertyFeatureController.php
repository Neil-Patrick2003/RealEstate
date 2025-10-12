<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\PropertyFeature;

class PropertyFeatureController extends Controller
{
    public function delete(PropertyFeature $propertyFeature){
        $propertyFeature->delete();

        return redirect()->back()->with('success', 'Removed Successfully');
    }
}
