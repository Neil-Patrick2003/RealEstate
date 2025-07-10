<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Favourite;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavouriteController extends Controller
{

    public function index(){

//        $properties = Favourite::with('property')
//            ->where('user_id', auth()->id())
//            ->latest()->get();

        $properties = Property::with('favourites')
            ->whereHas('favourites', function ($query) {
                $query->where('user_id', auth()->id());
        })->get();



        return Inertia::render('Buyer/Favourite/Favourites', [
            'properties' => $properties,

        ]);
    }
    public function store(Request $request){
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
        ]);

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Check if this property is already a favourite
        $existing = Favourite::where('user_id', $user->id)
            ->where('property_id', $validated['property_id'])
            ->first();

        if ($existing) {
            // Remove from favourites
            $existing->delete();
            return back()->with('success', 'Removed from favourites.');
        }

        // Add to favourites
        Favourite::create([
            'user_id' => $user->id,
            'property_id' => $validated['property_id'],
        ]);

        return back()->with('success', 'Added to favourites!');



    }
}
