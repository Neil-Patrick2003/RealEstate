<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(){


        $transactions = Deal::with(['property_listing.property', 'property_listing.agent', 'feedback'])
            ->whereHas('property_listing.property', function ($query) {
                $query->where('seller_id', auth()->id());
            })
            ->where('status', 'Sold')
            ->get();


        return Inertia::render('Seller/Transaction/Index', [
            'transactions' => $transactions,
        ]);
    }
}
