<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Property;
use Inertia\Inertia;

class SearchController extends Controller
{

    public function index(Request $request)
    {
        $query = $request->get('q');

        if (!$query) {
            return redirect('/all-properties');
        }

        $results = Property::where('title', 'like', "%{$query}%")
            ->orWhere('address', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('property_type', 'like', "%{$query}%")
            ->where('status', 'Published') // only show active properties
            ->with('images')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'type' => $property->property_type,
                    'location' => $property->address,
                    'price' => $property->price,
                    'image' => $property->image_url
                ];
            });



        return Inertia::render('SearchResults', [
            'q' => $query,
            'results' => $results
        ]);
    }
    public function show(Request $request)
    {
        $query = $request->get('q');

        if (!$query) {
            return redirect('/all-properties');
        }

        $results = Property::where('title', 'like', "%{$query}%")
            ->orWhere('address', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('property_type', 'like', "%{$query}%")
            ->where('status', 'Published') // only show active properties
            ->with('images')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'type' => $property->property_type,
                    'location' => $property->address,
                    'price' => $property->price,
                    'image' => $property->image_url
                ];
            });



        return Inertia::render('SearchResults', [
            'q' => $query,
            'results' => $results
        ]);
    }
}
