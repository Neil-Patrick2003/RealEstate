<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\PropertyListing;
use App\Notifications\DealCounter;
use App\Notifications\NewDeal;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealController extends Controller
{
    public function index()
    {
        $propertyListings = PropertyListing::with([
            'deal' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'deal.buyer',
            'property:id,image_url,title,address,price',
            'seller:id,photo_url,name',
            'agents'
        ])
            ->whereHas('agents', function ($query) {
                $query->where('id', auth()->id());
            })

            ->latest()
            ->paginate(15);


        return Inertia::render('Agent/Deal/Deal', [
            'property_listings' => $propertyListings,
        ]);
    }





    public function update(Request $request, Deal $deal)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:999999999.99',
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
            'agent_name' => auth()->user()->name,
            'property_title' => $property->title,
            'amount' => $deal->amount,
            'url' => '/deal'
        ]));



        return redirect()->back()->with('success', 'Deal updated successfully');

    }
}
