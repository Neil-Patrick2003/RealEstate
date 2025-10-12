<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Deal::with('property_listing', 'property_listing.property', 'buyer')
            ->whereHas('property_listing', function ($query) {
                $query->where('broker_id', auth()->id());
            })
            ->when(request()->filled('status'), function ($query) {
                $query->where('status', request('status'));
            })
            ->when(request()->filled('search'), function ($query) {
                $search = request('search');

                $query->where(function ($query) use ($search) {
                    // Search in property title
                    $query->whereHas('property_listing.property', function ($q) use ($search) {
                        $q->where('title', 'like', '%' . $search . '%');
                    });

                    // Or search in buyer name
                    $query->orWhereHas('buyer', function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%');
                    });

                    // Or search in created_at (deal date)
                    $query->orWhere('created_at', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString(); //retain filters in pagination links


//        dd($transactions->toArray());






        return Inertia::render('Broker/Transaction/index', [
            'transactions' => $transactions,
        ]);
    }
}
