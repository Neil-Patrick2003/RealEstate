<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyCoordinate;
use App\Models\PropertyFeature;
use App\Models\PropertyImage;
use App\Models\PropertyListing;
use App\Models\User;
use App\Notifications\Seller\PropertyPostedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{
    public function index(Request $request){

        $allCount = Property::where('seller_id', '=', Auth::id())->count();

        $publishedCount = Property::where('seller_id', '=', Auth::id())
            ->where('status', 'Published')
            ->count();

        $unassignedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'Unassigned')
        ->count();

        $assignedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'Assigned')
        ->count();

        $rejectedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'rejected')
        ->count();

        $properties = Property::where('seller_id', '=', Auth::id())
        ->when($request->search, function ($q) use ($request) {
            return $q->where('title', 'like', '%' . $request->search . '%');
        })
        ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
            return $q->where('status', '=', $request->status );
        })
            ->latest()
            ->paginate($request->items_per_page, ['*'], 'page', $request->input('page', 1));

        return Inertia::render('Seller/Properties/Index', [
            'properties' => $properties,
            'all' => $allCount,
            'unassigned' => $unassignedCount,
            'assigned' => $assignedCount,
            'rejected' => $rejectedCount,
            'published' => $publishedCount,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:3000',
            'property_type' => 'required|string',
            'property_sub_type' => 'required|string',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string|max:255',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'total_rooms' => 'nullable|integer|min:0',
            'total_bedrooms' => 'nullable|integer|min:0',
            'total_bathrooms' => 'nullable|integer|min:0',
            'car_slots' => 'nullable|integer|min:0',
            'image_url' => 'required|file|image',
            'image_urls.*' => 'nullable|file|image',
            'feature_name' => 'nullable|array',
            'feature_name.*' => 'string|max:255',
            'boundary' => 'required|array',
            'pin' => 'nullable|array',
            'isPresell' => 'boolean',
            'allowMultipleAgent' => 'nullable|boolean',
            'agent_ids' => 'nullable|array',
            'agent_ids.*' => 'exists:users,id',
        ]);

        // Handle primary image upload
        $propertyImageUrl = null;
        if ($request->hasFile('image_url')) {
            $file = $request->file('image_url');
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $propertyImageUrl = $file->storeAs('images', $filename, 'public');
        }

        //check if there assign agent so status will be Assigned
        $status = !empty($validated['agent_ids']) ? 'Assigned' : 'Unassigned';

        // Create property
        $property = Property::create([
            'seller_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'property_type' => $validated['property_type'],
            'sub_type' => $validated['property_sub_type'],
            'price' => $validated['price'],
            'address' => $validated['address'],
            'status' => $status,
            'lot_area' => $validated['lot_area'],
            'floor_area' => $validated['floor_area'],
            'total_rooms' => $validated['total_rooms'],
            'bedrooms' => $validated['total_bedrooms'],
            'bathrooms' => $validated['total_bathrooms'],
            'car_slots' => $validated['car_slots'],
            'isPresell' => $validated['isPresell'] ?? false,
            'image_url' => $propertyImageUrl,
            'allow_multi_agents' => $validated['allowMultipleAgent'],
        ]);

        // Multiple images upload
        if ($request->hasFile('image_urls')) {
            foreach ($request->file('image_urls') as $file) {
                $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $storedPath = $file->storeAs('images', $filename, 'public');

                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url' => $storedPath,
                ]);
            }
        }

        // Features
        if (!empty($validated['feature_name'])) {
            foreach ($validated['feature_name'] as $feature) {
                PropertyFeature::create([
                    'property_id' => $property->id,
                    'name' => $feature,
                ]);
            }
        }

        // Boundary coordinates
        PropertyCoordinate::create([
            'property_id' => $property->id,
            'coordinates' => $validated['boundary'],
            'type' => 'polygon',
        ]);

        // Pin coordinates
        if (!empty($validated['pin'])) {
            PropertyCoordinate::create([
                'property_id' => $property->id,
                'coordinates' => [
                    'lat' => $validated['pin']['lat'],
                    'lng' => $validated['pin']['lng'],
                ],
                'type' => 'marker',
            ]);
        }

        // Assign agents & notify
        if (!empty($validated['agent_ids'])) {
            foreach ($validated['agent_ids'] as $agentId) {
                PropertyListing::create([
                    'property_id' => $property->id,
                    'agent_id' => $agentId,
                    'seller_id' => auth()->id(),
                    'status' => 'Assigned',
                ]);

//                $agent = User::find($agentId);
//                if ($agent) {
//                    $agent->notify(new PropertyPostedNotification($property));
//                }
            }
        }

        $agents = User::where('role', 'Seller')
        ->get();

        foreach ($agents as $agent) {
            $agent->notify(new PropertyPostedNotification($property));
        }


        return redirect()->back()->with('success', 'Property has been created.');
    }


    public function show(Property $property){

        $property = $property->load('images', 'coordinate', 'features');

        return Inertia::render('Seller/Properties/ShowProperty', [
            'property' => $property
        ]);
    }

    public function edit(Property $property){
        $property = $property->load('images', 'coordinate', 'features');

        return Inertia::render('Seller/Properties/EditProperty', [
            'property' => $property

        ]);
    }

    public function update(Request $request, $id)
    {



        $property = Property::findOrFail($id);

        //  Validate request data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'property_type' => 'required|string',
            'property_sub_type' => 'required|string',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string|max:255',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'total_rooms' => 'required|integer|min:0',
            'total_bedrooms' => 'required|integer|min:0',
            'total_bathrooms' => 'required|integer|min:0',
            'car_slots' => 'required|integer|min:0',
            'image_url' => 'nullable', // up to 5MB
            'image_urls' => 'nullable',
            'boundary' => 'nullable|array',
            'pin' => 'nullable|array',
            'isPresell' => 'nullable|boolean',
        ]);


        //  Main image upload
        $property_image_url = $property->image_url;
        if ($request->hasFile('image_url')) {
            $image = $request->file('image_url');
            $photo_name = $image->getClientOriginalName();
            $property_image_url = $image->storeAs('images', $photo_name, 'public');
        }

        //  Update main property data
        $property->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'property_type' => $validated['property_type'],
            'sub_type' => $validated['property_sub_type'],
            'price' => $validated['price'],
            'address' => $validated['address'],
            'status' => 'pending',
            'lot_area' => $validated['lot_area'],
            'floor_area' => $validated['floor_area'],
            'total_rooms' => $validated['total_rooms'],
            'bedrooms' => $validated['total_bedrooms'],
            'bathrooms' => $validated['total_bathrooms'],
            'car_slots' => $validated['car_slots'],
            'isPresell' => $validated['isPresell'],
            'image_url' => $property_image_url,
        ]);



        // (Optional) dump for testing
        // dd($request->toArray());

        return redirect()->back()->with('success', 'Property updated successfully.');
    }

    public function destroy($id){
        $property = Property::findOrFail($id);

        $property->delete();

        return redirect()->back()->with('sucess', 'Deleted propety sucessfully!');
    }




}
