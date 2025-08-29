<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Property;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        // Get all property listing IDs where the authenticated agent is involved
        $propertyListingIds = PropertyListing::whereHas('agents', function ($query) {
            $query->where('id', auth()->id());
        })->pluck('id');

        $transactions = Deal::with([
            'property_listing.property',
            'buyer',
            'property_listing.seller'
        ])
            ->whereIn('property_listing_id', $propertyListingIds)
            ->where('status', 'Sold')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query
                        ->whereHas('buyer', fn($sub) =>
                        $sub->where('name', 'like', '%' . $search . '%')
                        )
                        ->orWhereHas('property_listing.property', fn($sub) =>
                        $sub->where('title', 'like', '%' . $search . '%')
                        )
                        ->orWhereHas('property_listing.seller', fn($sub) =>
                        $sub->where('name', 'like', '%' . $search . '%')
                        );
                });
            })
            ->latest()
            ->paginate(10)
            ->appends(['search' => $search]);

        return Inertia::render('Agent/Transaction/Transaction', [
            'transactions' => $transactions,
            'search' => $search,
        ]);
    }

}
