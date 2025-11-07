<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportPdfController extends Controller
{
    /** Roles used for attribution */
    private array $ROLE_SET = ['Agent', 'Broker', 'agent', 'broker'];

    /* =========================================================================
     | A) TRANSACTIONS-BASED EXPORT
     * ========================================================================= */

    /** Build base transactions query for last 12 months with sane filters. */
    private function baseTxQuery($from, $to): array
    {
        // best date to represent the transaction: closed_at → created_at
        $dateExpr = "COALESCE(t.closed_at, t.created_at)";

        $q = DB::table('transactions as t')
            ->whereBetween(DB::raw($dateExpr), [$from, $to]);

        // If a status column exists, keep only closed/sold-ish
        if (Schema::hasColumn('transactions', 'status')) {
            $q->whereIn('t.status', ['Closed', 'Closed with Deal', 'Completed', 'Booked', 'Sold']);
        } else {
            $q->whereNotNull('t.closed_at');
        }

        // Contract value: tcp → (base - discount + fees) → downpayment → reservation → 0
        $amountExpr = "
            COALESCE(
              t.tcp,
              (CASE
                 WHEN t.base_price IS NOT NULL
                 THEN (COALESCE(t.base_price,0) - COALESCE(t.discount_amount,0) + COALESCE(t.fees_amount,0))
                 ELSE NULL
               END),
              t.downpayment_amount,
              t.reservation_amount,
              0
            )
        ";

        return [$q, $dateExpr, $amountExpr];
    }

    /** PDF: Monthly Sales – Transactions (last 12 months) */
    public function monthlySalesTransactions()
    {
        abort_unless(Schema::hasTable('transactions'), 404);

        $tz    = 'Asia/Manila';
        $end   = CarbonImmutable::now($tz)->endOfMonth();
        $start = $end->subMonths(11)->startOfMonth();

        [$q, $dateExpr, $amountExpr] = $this->baseTxQuery($start, $end);

        $rows = $q->leftJoin('users as u', 'u.id', '=', 't.primary_agent_id')
            ->leftJoin('properties as p', 'p.id', '=', 't.property_id')
            ->selectRaw("
                DATE_FORMAT($dateExpr, '%Y-%m') as ym,
                t.id as transaction_id,
                t.inquiry_id,
                t.deal_id,
                t.property_id,
                p.title as property_title,
                t.primary_agent_id,
                u.name as primary_agent_name,
                u.role as primary_agent_role,
                t.status,
                $dateExpr as tx_date,
                $amountExpr as amount,
                t.mode_of_payment,
                t.reference_no
            ")
            ->orderBy('tx_date', 'asc')
            ->get();

        $pdf = Pdf::loadView('exports.pdf.monthly-sales-transactions', [
            'title' => 'Monthly Sales – Transactions (Last 12 Months)',
            'rows'  => $rows,
            'range' => [$start->format('M Y'), $end->format('M Y')],
        ])->setPaper('a4', 'portrait');

        return $pdf->download('monthly_sales_transactions_12m.pdf');
    }

    /* =========================================================================
     | B) LISTINGS-BASED UNION (Agent & Broker paths)
     | - property_listings  (agent_id)
     | - broker_listing     (broker_id)
     * ========================================================================= */

    /** status list to treat as “sold” */
    private function soldStatuses(): array
    {
        return [
            'sold', 'closed with deal', 'completed', 'booked', 'closed',
        ];
    }

    /** Build date expression: sold_at → updated_at → created_at */
    private function dateExpr(string $alias): string
    {
        $sa = "{$alias}.sold_at";
        $ua = "{$alias}.updated_at";
        $ca = "{$alias}.created_at";
        return "COALESCE($sa, $ua, $ca)";
    }

    /** Amount expr for listings union: use PROPERTY PRICE only (fixes missing pl.tcp/bl.tcp) */
    private function listingAmountExpr(string $listingAlias, string $propAlias): string
    {
        return "COALESCE({$propAlias}.price, 0)";
    }

    /** Safe table/column checks */
    private function has(string $table, ?string $col = null): bool
    {
        if (! Schema::hasTable($table)) return false;
        return $col ? Schema::hasColumn($table, $col) : true;
    }

    /** UNION of agent-side (property_listings.agent_id) and broker-side (broker_listing.broker_id) */
    private function unionListings(CarbonImmutable $start, CarbonImmutable $end)
    {
        $parts = [];

        // A) property_listings → users (agent_id) → properties
        if ($this->has('property_listings') && $this->has('users', 'id') && $this->has('properties','id')) {
            $pl = 'pl'; $u = 'u'; $p = 'p';
            $date = $this->dateExpr($pl);
            $amt  = $this->listingAmountExpr($pl, $p);

            $q = DB::table("property_listings as $pl")
                ->join("users as $u", "$u.id", '=', "$pl.agent_id")
                ->join("properties as $p", "$p.id", '=', "$pl.property_id")
                ->whereBetween(DB::raw($date), [$start, $end])
                ->selectRaw("
                    DATE_FORMAT($date, '%Y-%m') as ym,
                    $u.id   as user_id,
                    $u.name as user_name,
                    $u.role as user_role,
                    1       as deals,
                    $amt    as amount
                ");

            if ($this->has('property_listings', 'status')) {
                $q->whereIn(DB::raw('LOWER('.$pl.'.status'.')'), array_map('strtolower', $this->soldStatuses()));
            }
            if ($this->has('users', 'role')) {
                $q->whereIn(DB::raw('LOWER('.$u.'.role'.')'), array_map('strtolower', $this->ROLE_SET));
            }

            $parts[] = $q;
        }

        // B) broker_listing → users (broker_id) → properties
        if ($this->has('broker_listing') && $this->has('users', 'id') && $this->has('properties','id')) {
            $bl = 'bl'; $u = 'u'; $p = 'p';
            $date = $this->dateExpr($bl);
            $amt  = $this->listingAmountExpr($bl, $p);

            $q = DB::table("broker_listing as $bl")
                ->join("users as $u", "$u.id", '=', "$bl.broker_id")
                ->join("properties as $p", "$p.id", '=', "$bl.property_id")
                ->whereBetween(DB::raw($date), [$start, $end])
                ->selectRaw("
                    DATE_FORMAT($date, '%Y-%m') as ym,
                    $u.id   as user_id,
                    $u.name as user_name,
                    $u.role as user_role,
                    1       as deals,
                    $amt    as amount
                ");

            if ($this->has('broker_listing', 'status')) {
                $q->whereIn(DB::raw('LOWER('.$bl.'.status'.')'), array_map('strtolower', $this->soldStatuses()));
            }
            if ($this->has('users', 'role')) {
                $q->whereIn(DB::raw('LOWER('.$u.'.role'.')'), array_map('strtolower', $this->ROLE_SET));
            }

            $parts[] = $q;
        }

        // Nothing available → empty
        if (empty($parts)) {
            return DB::query()->fromSub(
                DB::table(DB::raw('(SELECT 1) as dummy'))->whereRaw('0'),
                'x'
            );
        }

        // Chain unionAll across all parts
        $union = array_shift($parts);
        foreach ($parts as $q) {
            $union = $union->unionAll($q);
        }

        return $union;
    }

    /** PDF: Monthly Sales – By Agent/Broker (robust) */
    public function monthlySalesByAgent(Request $req)
    {
        $tz    = 'Asia/Manila';
        $end   = CarbonImmutable::now($tz)->endOfMonth();
        $start = $end->subMonths(11)->startOfMonth();

        $union = $this->unionListings($start, $end);

        $rows = DB::query()->fromSub($union, 'x')
            ->groupBy('x.ym', 'x.user_id', 'x.user_name', 'x.user_role')
            ->selectRaw("
                x.ym,
                x.user_id,
                x.user_name,
                x.user_role,
                SUM(x.deals)  as deals,
                SUM(x.amount) as amount
            ")
            ->orderBy('x.ym')
            ->orderByDesc(DB::raw('SUM(x.amount)'))
            ->get()
            ->map(fn($r) => [
                'ym'        => $r->ym,
                'user_id'   => (int) $r->user_id,
                'user_name' => $r->user_name,
                'user_role' => $r->user_role,
                'deals'     => (int) $r->deals,
                'amount'    => (float) $r->amount,
            ])
            ->all();

        $pdf = Pdf::loadView('exports.pdf.monthly-sales-by-agent', [
            'title' => 'Monthly Sales – By Agent/Broker (Last 12 Months)',
            'mode'  => 'listings_union',
            'rows'  => $rows,
            'range' => [$start->format('M Y'), $end->format('M Y')],
        ])->setPaper('a4', 'portrait');

        return $pdf->download('monthly_sales_by_agent_12m.pdf');
    }

    /* =========================================================================
     | C) LISTINGS-BASED ROLLUP BY ROLE
     * ========================================================================= */

    /** PDF: Monthly Sales – By Role (Agent vs Broker, last 12 months) */
    public function monthlySalesByRole(Request $req)
    {
        $tz    = 'Asia/Manila';
        $end   = Carbon::now($tz)->endOfMonth();
        $start = $end->subMonths(11)->startOfMonth();

        $union = $this->unionListings($start, $end);

        $byRole = DB::query()->fromSub($union, 'x')
            ->groupBy('x.ym', 'x.user_role')
            ->selectRaw("
                x.ym,
                x.user_role,
                COUNT(*)      as deals,
                SUM(x.amount) as amount
            ")
            ->orderBy('x.ym')
            ->orderBy('x.user_role')
            ->get()
            ->map(fn($r) => [
                'ym'     => $r->ym,
                'role'   => $r->user_role,
                'deals'  => (int) $r->deals,
                'amount' => (float) $r->amount,
            ])
            ->all();

        $pdf = Pdf::loadView('exports.pdf.monthly-sales-by-role', [
            'title' => 'Monthly Sales – By Role (Last 12 Months)',
            'mode'  => 'listings_union',
            'rows'  => $byRole,
            'range' => [$start->format('M Y'), $end->format('M Y')],
        ])->setPaper('a4', 'portrait');

        return $pdf->download('monthly_sales_by_role_12m.pdf');
    }
}
