<?php

namespace App\Http\Controllers\Property;

use App\Http\Controllers\Controller;
use App\Models\Favourite;
use App\Models\Property;
use App\Models\PropertyListing;
use Illuminate\Auth\Events\Authenticated;
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

    public function favourite(\Request $request, $id)
    {
        $property = Property::find($id);

        if (auth()->check()) {
            $favourite = Favourite::where('user_id', auth()->id())
                ->where('property_id', $property->id)
                ->first();

            if ($favourite) {
                $favourite->delete();
                return redirect()->back()->with('success', 'Removed from favourites.');
            } else {
                Favourite::create([
                    'user_id' => auth()->id(),
                    'property_id' => $property->id,
                ]);
                return redirect()->back()->with('success', 'Added to favourites.');
            }
        }

        return redirect('/login')->with('error', 'Please login to add to favourites.');


    }
}
