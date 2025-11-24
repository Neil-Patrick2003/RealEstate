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
        $query = $request->get('q', '');

        if (empty($query)) {
            return redirect()->back();
        }

        $results = [
            'properties' => [],
            'agents' => [],
            'users' => []
        ];

        // Search properties
        $results['properties'] = Property::where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('address', 'like', "%{$query}%");

            })
            ->with('images')
            ->limit(10)
            ->get();

        // Search agents/brokers
        $results['agents'] = User::whereIn('role', ['agent', 'broker'])
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->where('status', 'active')
            ->limit(10)
            ->get();

        return inertia('Search/Index', [
            'query' => $query,
            'results' => $results,
            'totalResults' => collect($results)->sum(fn($item) => count($item))
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
