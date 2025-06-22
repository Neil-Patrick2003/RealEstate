<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyCoordinate;
use App\Models\PropertyFeature;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{   
    public function index(Request $request){
        
        $allCount = Property::where('seller_id', '=', Auth::id())->count();
        $pendingCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'pending')
        ->count();

        $approvedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'approved')
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
            'pending' => $pendingCount,
            'approved' => $approvedCount,
            'rejected' => $rejectedCount
        ]);
    }
    
    public function store(Request $request){
        //validate request
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
            'image_url' => 'required',
            'feature_name' => 'nullable|array',
            'feature_name.*' => 'string|max:255',
            'boundary' => 'required|array',
            'pin' => 'nullable|array',
            'isPresell' => 'nullable|boolean',           
        ]);


        //save image and generate image url to save in database
        $property_image_url = null;
        if ($request->hasFile('image_url')) {
            $destination_path = 'images';
            $image_url = $request->file('image_url');
            $photo_name = $image_url->getClientOriginalName();
            $property_image_url = $image_url->storeAs($destination_path, $photo_name, 'public');
            
        }

        //create property
        $property = Property::create([
            'seller_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'property_type' => $validated['property_type'],
            'sub_type' => $validated['property_sub_type'],
            'price' => $validated['price'],
            'address' => $validated['address'],
            'status' => "pending",
            'lot_area' => $validated['lot_area'],
            'floor_area' => $validated['lot_area'],
            'total_rooms' => $validated['total_rooms'],
            'bedrooms' => $validated['total_bedrooms'],
            'bathrooms' => $validated['total_bathrooms'],
            'car_slots' => $validated['car_slots'],
            'isPresell' => $validated['isPresell'],
            'image_url' => $property_image_url
        ]);

        // //create property feature
        // foreach ($request->feature_name as $feature) {
        //     PropertyFeature::create([
        //         'property_id' => $property->id,
        //         'name' => $feature,
        //     ]);
        // }


        //save property boundery
        // PropertyCoordinate::create([
        //     'property_id' => $property->id,
        //     'coordinates' => $request->boundary,
        //     'type' => 'polygon',
        // ]);

        //save property pin location
        // PropertyCoordinate::create([
        //     'property_id' => $property->id,
        //     'coordinates' => [
        //         'lat' => $request->pin['lat'],
        //         'lng' => $request->pin['lng'],
        //     ],
        //     'type' => 'marker',
        // ]);

        return redirect()->back();
  
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
