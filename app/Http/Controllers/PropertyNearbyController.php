<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PropertyNearbyController extends Controller
{
    public function index(Property $property, Request $request)
    {
        // make sure loaded yung relation
        $property->loadMissing('coordinate');

        // 1. Hanapin yung "marker" type sa coordinates
        $marker = collect($property->coordinate)->firstWhere('type', 'marker');


        if (! $marker) {
            return response()->json([
                'features' => [],
                'error'    => 'This property has no marker coordinates.',
            ], 422);
        }

        // 2. Extract lat / lng from JSON field
        $lat = data_get($marker, 'coordinates.lat');
        $lon = data_get($marker, 'coordinates.lng');

        if (! $lat || ! $lon) {
            return response()->json([
                'features' => [],
                'error'    => 'Invalid marker coordinates.',
            ], 422);
        }

        // Optional: cast to float
        $lat = (float) $lat;
        $lon = (float) $lon;

        // 3. Default categories & radius
        $categories = $request->get('categories') ??
            implode(',', [
                'commercial.shopping_mall',   // malls
                'commercial.supermarket',     // groceries
                'commercial.marketplace',     // palengke / marketplace
                'catering.cafe',              // cafes
                'catering.restaurant',        // restos
                'education.school',           // schools
                'healthcare.hospital',        // hospitals/clinics
                'leisure.park',               // parks (often may court)
                'sport.pitch',                // generic playing fields
                'sport.sports_centre',        // sports centers/gyms
            ]);

        $radius = (int) $request->get('radius', 2000); // 2km

        // 4. Call Geoapify
        $response = Http::get('https://api.geoapify.com/v2/places', [
            'categories' => $categories,
            'filter'     => "circle:$lon,$lat,$radius",
            'limit'      => 30,
            'apiKey'     => config('services.geoapify.key'),
        ]);

        if ($response->failed()) {
            // TEMPORARY DEBUG
            return response()->json([
                'status'  => $response->status(),
                'geoapify_body' => $response->json(), // or ->body()
            ], $response->status());
        }

        return $response->json(); // FeatureCollection
    }
}
