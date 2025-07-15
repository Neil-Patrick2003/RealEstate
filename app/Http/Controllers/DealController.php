<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\PropertyListing;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(){

        $deals = Deal::with([
            'property_listing.property:id,title,price,image_url,address',
            'property_listing.agent:id,name',
            'property_listing.seller:id,name',
        ])
            ->where('buyer_id', auth()->id())
            ->latest()
            ->get();


        return inertia('Buyer/Deal/Deal', [
            'deals' => $deals,
        ]);
    }

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
            'amount' => 'required|numeric|min:1|max:999999.99',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Deal updated successfully');
    }

    public function accept(Request $request, $id)
    {
        $deal = Deal::find($id);

        $deal->update([
            'status' => 'Accepted',
        ]);

        return redirect()->back()->with('success', 'Offer accepted, now you can proceed to finalize the paperwork.');
    }

    public function handleUpdate(Request $request, $id, $status){
        $deal = Deal::find($id);

        $deal->update([
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Deal {$status} successfully");
    }
}
