<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\PropertyListing;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function store(Request $request, PropertyListing $propertyListing)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        Deal::create([
            'property_listing_id' => $propertyListing->id,
            'amount' => $request->amount,
            'buyer_id' => auth()->id(),
            'status' => 'Pending',
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Deal created successfully');
    }

    public function update(Request $request, PropertyListing $propertyListing, Deal $deal)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Deal updated successfully');
    }
}
