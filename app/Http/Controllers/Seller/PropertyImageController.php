<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;

class PropertyImageController extends Controller
{
    public function store(Request $request, $propertyId)
    
    {
        // Validate the request
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        //create property image
        if ($request->hasFile('image_urls')) {
            foreach ($request->file('image_urls') as $file) {
                $destination_path = 'images';
                $photo_name = $file->getClientOriginalName();
                $stored_path = $file->storeAs($destination_path, $photo_name, 'public');

                PropertyImage::create(attributes: [
                    'property_id' => $propertyId,
                    'image_url' => $stored_path, 
                ]);
            }   
        }



        return redirect()->back()->with('success', 'Images uploaded successfully.');
    }
    
    public function destroy( Property $property, $id){
        $property_image = PropertyImage::findOrFail($id);
        if ($property_image) {
            $property_image->delete();
            return redirect()->back()->with('success', 'Property image deleted successfully.');
        } else {
            return redirect()->back()->with('error', 'Property image not found.');
        }


    }
}
