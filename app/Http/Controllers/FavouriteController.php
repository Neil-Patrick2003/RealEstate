<?php

namespace App\Http\Controllers;

use App\Models\Favourite;
use Illuminate\Http\Request;

class FavouriteController extends Controller
{
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
