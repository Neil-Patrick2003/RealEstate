<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $agentId = $request->user()->id;



        $filters = [
            'status'   => $request->string('status')->toString() ?: null,
            'search'   => $request->string('search')->toString() ?: null,
            'date_from'=> $request->string('date_from')->toString() ?: null,
            'date_to'  => $request->string('date_to')->toString() ?: null,
        ];

        $query = Transaction::query()
            ->with(['buyer:id,name,email,contact_number', 'property:id,title,address,price', 'deal:id,status,amount', 'agent'])
            ->where('primary_agent_id', $agentId);

        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }

        if ($filters['search']) {
            $q = $filters['search'];
            $query->where(function ($sub) use ($q) {
                $sub->whereHas('buyer', fn($b)=>$b->where('name','like',"%{$q}%")
                    ->orWhere('email','like',"%{$q}%"))
                    ->orWhereHas('property', fn($p)=>$p->where('title','like',"%{$q}%")
                        ->orWhere('address','like',"%{$q}%"))
                    ->orWhere('reference_no','like',"%{$q}%")
                    ->orWhere('remarks','like',"%{$q}%");
            });
        }

        if ($filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if ($filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $transactions = $query
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        // Simple totals by status + sum of TCP
        $baseAgg = Transaction::where('primary_agent_id', $agentId);
        $totals = [
            'all'      => (clone $baseAgg)->count(),
            'draft'    => (clone $baseAgg)->where('status','DRAFT')->count(),
            'reserved' => (clone $baseAgg)->where('status','RESERVED')->count(),
            'booked'   => (clone $baseAgg)->where('status','BOOKED')->count(),
            'sold'     => (clone $baseAgg)->where('status','SOLD')->count(),
            'tcp_sum'  => (clone $baseAgg)->sum('tcp'),
        ];

        return Inertia::render('Agent/Transaction/Transaction', [
            'transactions' => $transactions,
            'filters'      => $filters,
            'totals'       => $totals,
        ]);
    }

}
