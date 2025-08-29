<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\PropertyListing;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Deal::with([
            'property_listing.property',
            'property_listing.agents',
            'feedback', // Many feedbacks per deal (per agent)
        ])->where('buyer_id', auth()->id())
            ->where('status', 'Sold')
            ->get();

        return Inertia::render('Buyer/Transactions/Transactions', [
            'transactions' => $transactions,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

}
