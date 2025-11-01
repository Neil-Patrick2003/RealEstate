<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\PropertyListing;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());
        $dateFrom = $request->date('date_from');
        $dateTo = $request->date('date_to');
        $perPage = (int)$request->integer('items_per_page', 10);

        $q = Transaction::query()
            ->where('buyer_id', $user->id)
            ->with([
                'property:id,title,address,price',
                'buyer:id,name,email,contact_number,address',
                'deal:id,amount,status',
                'agent:id,name',
            ]);

        if ($status) {
            $q->where('status', $status);
        }

        if ($search) {
            $q->where(function ($qq) use ($search) {
                $qq->whereHas('property', function ($qp) use ($search) {
                    $qp->where('title', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                })->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        if ($dateFrom) {
            $q->whereDate('created_at', '>=', $dateFrom->format('Y-m-d'));
        }
        if ($dateTo) {
            $q->whereDate('created_at', '<=', $dateTo->format('Y-m-d'));
        }

        $q->latest('created_at');

        $transactions = $q->paginate($perPage)->withQueryString();

        // Totals for header stats
        $totals = [
            'all' => Transaction::where('buyer_id', $user->id)->count(),
            'draft' => Transaction::where('buyer_id', $user->id)->where('status', 'DRAFT')->count(),
            'reserved' => Transaction::where('buyer_id', $user->id)->where('status', 'RESERVED')->count(),
            'booked' => Transaction::where('buyer_id', $user->id)->where('status', 'BOOKED')->count(),
            'tcp_sum' => (float)Transaction::where('buyer_id', $user->id)->sum('tcp'),
        ];

        return Inertia::render('Buyer/Transactions/Transactions', [
            'transactions' => $transactions,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'date_from' => optional($dateFrom)->format('Y-m-d'),
                'date_to' => optional($dateTo)->format('Y-m-d'),
                'items_per_page' => $perPage,
            ],
            'totals' => $totals,
        ]);
    }

}
