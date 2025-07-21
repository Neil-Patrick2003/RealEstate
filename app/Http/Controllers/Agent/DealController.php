<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\PropertyListing;
use App\Notifications\DealCounter;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealController extends Controller
{
    public function index()
    {
        $property_Listing = PropertyListing::with([
            'deal' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'deal.buyer',
            'property:id,image_url,title,address,price',
            'seller:id,photo_url,name',
        ])
            ->where('agent_id', auth()->id())
            ->latest()
            ->paginate(15);


        return Inertia::render('Agent/Deal/Deal', [
            'property_listing' => $property_Listing,
        ]);
    }

    public function update(Request $request, Deal $deal)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:999999.99',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        $agent = $deal->property_listing->agent;

        $buyer = $deal->buyer;
        $property = $deal->property_listing->property;

        $buyer->notify( new DealCounter([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'deal_id' => $deal->id,
        ]));



        return redirect()->back()->with('success', 'Deal updated successfully');

    }
}
