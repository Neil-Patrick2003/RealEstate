<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(){


        $transactions = Transaction::query()
            ->with(['buyer:id,name,email,contact_number', 'property:id,title,address,price', 'deal:id,status,amount', 'agent'])
            ->whereHas('property.seller', function ($query) {
                $query->where('id', auth()->id());
            })
            ->latest()
            ->paginate(15)
        ;


        return Inertia::render('Seller/Transaction/Index', [
            'transactions' => $transactions,
        ]);
    }
}
