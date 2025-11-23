<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Favourite;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuyerController extends Controller
{
    public function index()
    {

        $properties = \App\Models\Property::with('coordinate')
            ->where('status', 'Published')
            ->latest()
            ->get();

        $inquiries = \App\Models\Inquiry::with('property', 'agent:id,name,email', 'broker:id,name,email')
            ->where('buyer_id', auth()->id())
            ->latest() // defaults to 'created_at' in descending order
            ->take(10) // limit to 10 results
            ->get();

        $saveCount = Favourite::where('user_id', auth()->id())->count();

        return Inertia::render('Buyer/Dashboard', [
            'properties' => $properties,
            'inquiries' => $inquiries,
            'saveCount' => $saveCount
        ]);
    }

    public function allProperties(Request $request){

        $filters = [
            'search'         => $request->input('search'),
            'category'       => (array) $request->input('category', []), // array of main categories
            'subcategory'    => (array) $request->input('subcategory', []), // array of subcategories
            'is_presell'     => $request->has('is_presell') ?
                ($request->input('is_presell') === 'true' ? true :
                    ($request->input('is_presell') === 'false' ? false : null)) : null,
            'with_photos'    => $request->boolean('with_photos', false),

            'price_min'      => $request->input('price_min'),
            'price_max'      => $request->input('price_max'),

            'floor_min'      => $request->input('floor_min'),
            'floor_max'      => $request->input('floor_max'),

            'lot_min'        => $request->input('lot_min'),
            'lot_max'        => $request->input('lot_max'),

            'bedrooms_min'   => $request->input('bedrooms_min'),
            'bedrooms_max'   => $request->input('bedrooms_max'),
            'bathrooms_min'  => $request->input('bathrooms_min'),
            'bathrooms_max'  => $request->input('bathrooms_max'),
            'car_slots_min'  => $request->input('car_slots_min'),
            'car_slots_max'  => $request->input('car_slots_max'),
            'year_built_min' => $request->input('year_built_min'),
            'year_built_max' => $request->input('year_built_max'),

            'location'       => $request->input('location'),
            'sort'           => $request->input('sort', 'newest'),
        ];

        $query = Property::query()
            ->where('status', 'Published');

        // Availability: For Sale / Pre-selling
        if ($filters['is_presell'] !== null) {
            $query->where('isPresell', $filters['is_presell']);
        }

        // Search
        if ($filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('address', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        // Location search
        if ($filters['location']) {
            $query->where(function ($q) use ($filters) {
                $q->where('address', 'like', "%{$filters['location']}%")
                    ->orWhere('city', 'like', "%{$filters['location']}%")
                    ->orWhere('province', 'like', "%{$filters['location']}%");
            });
        }

        // Property categories (array)
        if (!empty($filters['category'])) {
            $query->whereIn('property_type', $filters['category']);
        }

        // Property subcategories (array)
        if (!empty($filters['subcategory'])) {
            $query->whereIn('sub_type', $filters['subcategory']);
        }

        // With photos only
        if ($filters['with_photos']) {
            $query->where(function ($q) {
                $q->whereNotNull('image_url')
                    ->where('image_url', '!=', '')
                    ->orWhereHas('images');
            });
        }

        // Price range
        if ($filters['price_min']) {
            $query->where('price', '>=', (int) $filters['price_min']);
        }
        if ($filters['price_max']) {
            $query->where('price', '<=', (int) $filters['price_max']);
        }

        // Floor area
        if ($filters['floor_min']) {
            $query->where('floor_area', '>=', (float) $filters['floor_min']);
        }
        if ($filters['floor_max']) {
            $query->where('floor_area', '<=', (float) $filters['floor_max']);
        }

        // Lot area
        if ($filters['lot_min']) {
            $query->where('lot_area', '>=', (float) $filters['lot_min']);
        }
        if ($filters['lot_max']) {
            $query->where('lot_area', '<=', (float) $filters['lot_max']);
        }

        // Bedrooms
        if ($filters['bedrooms_min']) {
            $query->where('bedrooms', '>=', (int) $filters['bedrooms_min']);
        }
        if ($filters['bedrooms_max']) {
            $query->where('bedrooms', '<=', (int) $filters['bedrooms_max']);
        }

        // Bathrooms
        if ($filters['bathrooms_min']) {
            $query->where('bathrooms', '>=', (int) $filters['bathrooms_min']);
        }
        if ($filters['bathrooms_max']) {
            $query->where('bathrooms', '<=', (int) $filters['bathrooms_max']);
        }

        // Car slots
        if ($filters['car_slots_min']) {
            $query->where('car_slots', '>=', (int) $filters['car_slots_min']);
        }
        if ($filters['car_slots_max']) {
            $query->where('car_slots', '<=', (int) $filters['car_slots_max']);
        }

        // Year built
        if ($filters['year_built_min']) {
            $query->where('year_built', '>=', (int) $filters['year_built_min']);
        }
        if ($filters['year_built_max']) {
            $query->where('year_built', '<=', (int) $filters['year_built_max']);
        }

        // Sorting
        switch ($filters['sort']) {
            case 'low-to-high':
                $query->orderBy('price', 'asc');
                break;
            case 'high-to-low':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'largest':
                $query->orderBy('floor_area', 'desc');
                break;
            case 'name':
                $query->orderBy('title', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Paginate
        $properties = $query
            ->with('project')
            ->paginate(12)
            ->withQueryString();

        // Map data
        $propertiesWithMap = Property::whereIn('id', $properties->pluck('id'))
            ->with('coordinate')
            ->get();

        return Inertia::render('Buyer/Properties/Properties', [
            'properties'        => $properties,
            'propertiesWithMap' => $propertiesWithMap,
            'filters'           => $filters,
        ]);

    }
}
