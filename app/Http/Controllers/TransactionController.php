<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

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
            ->with(['buyer:id,name,email,contact_number', 'property:id,title,address,price', 'deal:id,status,amount'])
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

        return Inertia::render('Agent/Transactions/Index', [
            'transactions' => $transactions,
            'filters'      => $filters,
            'totals'       => $totals,
        ]);
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'inquiry_id'         => ['nullable', 'exists:inquiries,id'],
            'property_id'        => ['nullable', 'exists:properties,id'],
            'deal_id'            => ['nullable', 'exists:deals,id'],
            'buyer_id'           => ['nullable', 'exists:users,id'],
            'primary_agent_id'   => ['nullable', 'exists:users,id'],

            'status'             => ['required', Rule::in([
                'DRAFT', 'RESERVED', 'BOOKED', 'SOLD', 'CANCELLED', 'EXPIRED', 'REFUNDED'
            ])],
            'reserved_at'        => ['nullable', 'date'],
            'booked_at'          => ['nullable', 'date'],
            'closed_at'          => ['nullable', 'date'],
            'cancelled_at'       => ['nullable', 'date'],
            'cancel_reason'      => ['nullable', 'string', 'max:255'],
            'expires_at'         => ['nullable', 'date'],

            // 💰 Commercials
            'base_price'         => ['nullable', 'numeric', 'min:0'],
            'discount_amount'    => ['nullable', 'numeric', 'min:0'],
            'fees_amount'        => ['nullable', 'numeric', 'min:0'],
            'tcp'                => ['nullable', 'numeric', 'min:0'],
            'reservation_amount' => ['nullable', 'numeric', 'min:0'],
            'balance_amount'     => ['nullable', 'numeric', 'min:0'],

            // 🏦 Terms
            'financing'          => ['required', Rule::in(['cash', 'bank', 'in_house', 'other'])],
            'payment_terms_json' => ['nullable', 'string'],
            'reference_no'       => ['nullable', 'string', 'max:100'],
            'mode_of_payment'    => ['required', 'string'],

            // 🗒️ Notes
            'remarks'            => ['nullable', 'string'],
        ]);

        $data['primary_agent_id'] = auth()->id();


        // Compute amounts
        $base    = (float) ($data['base_price'] ?? 0);
        $disc    = (float) ($data['discount_amount'] ?? 0);
        $fees    = (float) ($data['fees_amount'] ?? 0);
        $tcp     = (float) ($data['tcp'] ?? ($base - $disc + $fees));
        $res     = (float) ($data['reservation_amount'] ?? 0);
        $balance = (float) ($data['balance_amount'] ?? max($tcp - $res, 0)); // removed undefined $dp

        $data['tcp'] = $tcp;
        $data['balance_amount'] = $balance;

        // Auto-set date fields based on status (uses app timezone)
        $now = Carbon::now(); // honors config('app.timezone'), e.g. Asia/Manila
        $statusDates = [
            'RESERVED'  => 'reserved_at',
            'BOOKED'    => 'booked_at',
            'SOLD'      => 'closed_at',
            'CANCELLED' => 'cancelled_at',
            'EXPIRED'   => 'expires_at',
            // 'REFUNDED' => 'refunded_at', // add if you create this column later
        ];

        if (isset($statusDates[$data['status']])) {
            $dateField = $statusDates[$data['status']];
            if (empty($data[$dateField])) {
                $data[$dateField] = $now;
            }
        }

        DB::transaction(function () use (&$data) {
            $transaction = Transaction::create($data);

            // 🏁 Auto actions
            if ($transaction->status === 'SOLD') {
                // Deal → Sold + close related inquiry
                if ($transaction->deal_id) {
                    $deal = Deal::find($transaction->deal_id);
                    if ($deal) {
                        $deal->update(['status' => 'Sold']);
                        $deal->load(['property_listing', 'property_listing.seller', 'buyer', 'property_listing.agents', 'property_listing.property']);

                        $inquiry = Inquiry::where('property_id', optional($deal->property_listing->property)->id)
                            ->where('buyer_id', optional($deal->buyer)->id)
                            ->first();

                        if ($inquiry) {
                            $inquiry->update(['status' => 'Closed with Deal']);
                        }
                    }
                }

                // Property → Sold (+ listing)
                if ($transaction->property_id) {
                    $property = Property::find($transaction->property_id);
                    if ($property) {
                        $property->update(['status' => 'Sold']);
                        $property->load('property_listing');
                        if ($property->property_listing) {
                            $property->property_listing->update([
                                'status' => 'Sold',
                                'sold_at' => $transaction->closed_at,
                            ]);
                        }
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Transaction saved successfully.');
    }

}
