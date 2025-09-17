<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\PropertyListing;
use App\Notifications\DealCounter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            'property',
            'seller:id,photo_url,name',
            'agents'
        ])
            ->whereHas('broker', function ($query) {
                $query->where('id', auth()->id());
            })
            ->latest()
            ->get();
        
        // Flatten all deals across listings
        $allDeals = $propertyListings->flatMap(fn($listing) => $listing->deal)->filter()->values();

        // Normalize status for counting
        $statusCounts = $allDeals->groupBy(fn($deal) => strtolower($deal->status))->map(fn($deals) => $deals->count());

        return Inertia::render('Broker/Deal/Index', [
            'property_listings'    => $propertyListings,
            'all_deals_count'      => $allDeals->count(),
            'pending_deals_count'  => $statusCounts->get('pending', 0),
            'cancelled_deals_count'=> $statusCounts->get('cancelled', 0),
            'closed_deals_count'   => $statusCounts->get('sold', 0),
        ]);
    }




    public function update(Deal $deal, $action, Request $request)
    {

        $allowedStatuses = ['Accepted', 'Declined', 'Pending', 'Cancelled', 'Sold'];


        $status = ucfirst(strtolower($action));

        if (!in_array($status, $allowedStatuses)) {
            return response()->json(['error' => 'Invalid status.'], 400);
        }

        $deal->update([
            'status' => $status
        ]);

        return redirect()->back()->with('success', 'Deal status updated successfully.');
    }

    public function counter(Deal $deal, Request $request){


        $request->validate([
            'counterAmount' => 'required|numeric|min:1|max:99999999.99',
        ]);

        $deal->update([
            'amount' => $request->counterAmount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        $buyer = $deal->buyer;

        $buyer->notify( new DealCounter([
            'agent_name' => auth()->user()->name,
            'property_title' => $deal->property_listing->property->title,
            'amount' => $deal->amount,
            'url' => '/deal/{$deal->id}'


        ]));

        return redirect()->back()->with('success', 'Deal counter updated successfully.');

    }

}
