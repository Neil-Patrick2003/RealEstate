<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportPdfController extends Controller
{
    /* ===============================
     |  CONSTANTS & HELPERS
     |=============================== */

    /** statuses considered "sold" (case-insensitive) */
    private array $SOLD_STATUSES = ['sold','closed with deal','completed','booked','closed'];

    /** roles we attribute revenue to (case-insensitive) */
    private array $ROLE_SET = ['agent','broker'];

    /** Parse ?from=YYYY-MM-DD & ?to=YYYY-MM-DD; default to last 12 full months */
    private function resolveRange(?string $from, ?string $to): array
    {
        $tz = 'Asia/Manila';

        if ($from && $to) {
            $start = CarbonImmutable::parse($from, $tz)->startOfDay();
            $end   = CarbonImmutable::parse($to, $tz)->endOfDay();
            if ($end->lt($start)) {
                [$start, $end] = [$end, $start];
            }
            return [$start, $end];
        }

        $end   = CarbonImmutable::now($tz)->endOfMonth();
        $start = $end->subMonths(11)->startOfMonth();
        return [$start, $end];
    }

    private function printableRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return [$start->format('M Y'), $end->format('M Y')];
    }

    private function generatePdf(string $view, array $data, string $filename)
    {
        return Pdf::loadView($view, $data)
            ->setPaper('a4', 'portrait')
            ->download($filename);
    }

    private function tableExists(string $table, ?string $col = null): bool
    {
        if (! Schema::hasTable($table)) return false;
        return $col ? Schema::hasColumn($table, $col) : true;
    }

    /* ===============================
     |  A) TRANSACTIONS REPORT
     |=============================== */

    /** PDF: Monthly Sales – Transactions */
    public function monthlySalesTransactions(Request $request)
    {
        abort_unless($this->tableExists('transactions'), 404, 'Transactions table not found.');

        [$start, $end] = $this->resolveRange($request->query('from'), $request->query('to'));

        // Report date: prefer closed_at → created_at
        $dateExpr = "COALESCE(t.closed_at, t.created_at)";

        // Amount: tcp → (base - discount + fees) → downpayment → reservation → 0
        $amountExpr = "
            COALESCE(
                t.tcp,
                CASE
                  WHEN t.base_price IS NOT NULL
                  THEN (COALESCE(t.base_price,0) - COALESCE(t.discount_amount,0) + COALESCE(t.fees_amount,0))
                  ELSE NULL
                END,
                t.downpayment_amount,
                t.reservation_amount,
                0
            )
        ";

        $q = DB::table('transactions as t')
            ->whereBetween(DB::raw($dateExpr), [$start, $end]);

        // keep only closed/sold-ish (fallback: closed_at not null)
        if ($this->tableExists('transactions', 'status')) {
            $q->whereIn('t.status', ['Closed','Closed with Deal','Completed','Booked','Sold']);
        } else {
            $q->whereNotNull('t.closed_at');
        }

        $rows = $q->leftJoin('users as u', 'u.id', '=', 't.primary_agent_id')
            ->leftJoin('properties as p', 'p.id', '=', 't.property_id')
            ->selectRaw("
                DATE_FORMAT($dateExpr, '%Y-%m') as ym,
                t.id as transaction_id,
                t.status,
                $dateExpr as tx_date,
                $amountExpr as amount,
                t.mode_of_payment,
                t.reference_no,
                p.title as property_title,

                -- preferred aliases
                u.name as primary_agent_name,
                u.role as primary_agent_role,

                -- legacy aliases (if a blade still uses these)
                u.name as agent_name,
                u.role as agent_role
            ")
            ->orderBy('tx_date','asc')
            ->get();

        return $this->generatePdf(
            'exports.pdf.monthly-sales-transactions',
            [
                'title' => 'Monthly Sales – Transactions',
                'rows'  => $rows,
                'range' => $this->printableRange($start, $end),
            ],
            'monthly_sales_transactions.pdf'
        );
    }

    /* ===============================
     |  B) LISTINGS UNION HELPERS
     |=============================== */

    /**
     * Agent-attributed listings (via pivot property_listing_agents).
     * Credits EACH attached agent for a sold listing within the range.
     */
    private function getAgentListings(CarbonImmutable $start, CarbonImmutable $end)
    {
        if (! ($this->tableExists('property_listing_agents')
            && $this->tableExists('property_listings')
            && $this->tableExists('users')
            && $this->tableExists('properties'))) {
            return null;
        }

        $dateExpr   = "COALESCE(pl.sold_at, pl.updated_at, pl.created_at)"; // report month
        $amountExpr = "COALESCE(p.price, 0)";

        $q = DB::table('property_listing_agents as pla')
            ->join('property_listings as pl', 'pl.id', '=', 'pla.property_listing_id')
            ->join('users as u', 'u.id', '=', 'pla.agent_id')
            ->join('properties as p', 'p.id', '=', 'pl.property_id')
            ->whereBetween(DB::raw($dateExpr), [$start, $end]);

        // count only sold-ish listings
        if ($this->tableExists('property_listings', 'status')) {
            $q->whereIn(DB::raw('LOWER(pl.status)'), $this->SOLD_STATUSES);
        } else {
            $q->whereNotNull('pl.sold_at');
        }

        // role guard (case-insensitive)
        if ($this->tableExists('users','role')) {
            $q->whereIn(DB::raw('LOWER(u.role)'), $this->ROLE_SET);
        }

        return $q->selectRaw("
            DATE_FORMAT($dateExpr, '%Y-%m') as ym,
            u.id   as user_id,
            u.name as user_name,
            u.role as user_role,
            1      as deals,
            $amountExpr as amount
        ");
    }

    /**
     * Broker-attributed listings (property_listings).
     */
    private function getBrokerListings(CarbonImmutable $start, CarbonImmutable $end)
    {
        if (! ($this->tableExists('property_listings')
            && $this->tableExists('users')
            && $this->tableExists('properties'))) {
            return null;
        }

        $dateExpr   = "COALESCE(bl.sold_at, bl.updated_at, bl.created_at)";
        $amountExpr = "COALESCE(p.price, 0)";

        $q = DB::table('property_listings as bl')
            ->join('users as u', 'u.id', '=', 'bl.broker_id')
            ->join('properties as p', 'p.id', '=', 'bl.property_id')
            ->whereBetween(DB::raw($dateExpr), [$start, $end]);

        if ($this->tableExists('property_listings', 'status')) {
            $q->whereIn(DB::raw('LOWER(bl.status)'), $this->SOLD_STATUSES);
        } else {
            $q->whereNotNull('bl.sold_at');
        }

        if ($this->tableExists('users','role')) {
            $q->whereIn(DB::raw('LOWER(u.role)'), $this->ROLE_SET);
        }

        return $q->selectRaw("
            DATE_FORMAT($dateExpr, '%Y-%m') as ym,
            u.id   as user_id,
            u.name as user_name,
            u.role as user_role,
            1      as deals,
            $amountExpr as amount
        ");
    }

    /* ===============================
     |  C) SALES BY AGENT/BROKER PDF
     |=============================== */

    public function monthlySalesByAgent(Request $request)
    {
        [$start, $end] = $this->resolveRange($request->query('from'), $request->query('to'));

        $agentQ  = $this->getAgentListings($start, $end);
        $brokerQ = $this->getBrokerListings($start, $end);

        if ($agentQ && $brokerQ) {
            $union = $agentQ->unionAll($brokerQ);
        } elseif ($agentQ) {
            $union = $agentQ;
        } elseif ($brokerQ) {
            $union = $brokerQ;
        } else {
            abort(404, 'No listings found.');
        }

        $rows = DB::query()
            ->fromSub($union, 'z')
            ->groupBy('z.ym', 'z.user_id', 'z.user_name', 'z.user_role')
            ->selectRaw("
                z.ym,
                z.user_id,
                z.user_name,
                z.user_role,
                SUM(z.deals)  as deals,
                SUM(z.amount) as amount
            ")
            ->orderBy('z.ym')
            ->orderByDesc(DB::raw('SUM(z.amount)'))
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


        return $this->generatePdf(
            'exports.pdf.monthly-sales-by-agent',
            [
                'title' => 'Monthly Sales – By Agent/Broker',
                'rows'  => $rows,
                'range' => $this->printableRange($start, $end),
            ],
            'monthly_sales_by_agent.pdf'
        );
    }

    /* ===============================
     |  D) SALES BY ROLE PDF
     |=============================== */

    public function monthlySalesByRole(Request $request)
    {
        [$start, $end] = $this->resolveRange($request->query('from'), $request->query('to'));

        $agentQ  = $this->getAgentListings($start, $end);
        $brokerQ = $this->getBrokerListings($start, $end);

        if ($agentQ && $brokerQ) {
            $union = $agentQ->unionAll($brokerQ);
        } elseif ($agentQ) {
            $union = $agentQ;
        } elseif ($brokerQ) {
            $union = $brokerQ;
        } else {
            abort(404, 'No data found.');
        }

        $rows = DB::query()
            ->fromSub($union, 'z')
            ->groupBy('z.ym', 'z.user_role')
            ->selectRaw("
                z.ym as ym,
                z.user_role as role,
                COUNT(*)      as deals,
                SUM(z.amount) as amount
            ")
            ->orderBy('ym')
            ->orderBy('role')
            ->get();

        return $this->generatePdf(
            'exports.pdf.monthly-sales-by-role',
            [
                'title' => 'Monthly Sales – By Role',
                'rows'  => $rows,
                'range' => $this->printableRange($start, $end),
                'mode'  => 'role', // ✅ add this line

            ],
            'monthly_sales_by_role.pdf'
        );
    }

    /* ===============================
     |  E) HANDLED vs SOLD (Agents & Brokers)
     |=============================== */

    public function monthlyHandledVsSoldByUser(Request $request)
    {
        [$start, $end] = $this->resolveRange($request->query('from'), $request->query('to'));

        $parts = [];

        // A1) AGENTS — Handled: when attached in pivot (prefer pla.created_at; fallback pl.created_at)
        if ($this->tableExists('property_listing_agents') && $this->tableExists('property_listings') && $this->tableExists('users')) {
            $handledDateExpr = "COALESCE( pl.created_at)";
            $agentHandled = DB::table('property_listing_agents as pla')
                ->join('property_listings as pl', 'pl.id', '=', 'pla.property_listing_id')
                ->join('users as u', 'u.id', '=', 'pla.agent_id')
                ->whereBetween(DB::raw($handledDateExpr), [$start, $end])
                ->when($this->tableExists('users','role'),
                    fn($q) => $q->whereRaw("LOWER(u.role) = 'agent'")
                )
                ->selectRaw("
                    DATE_FORMAT($handledDateExpr, '%Y-%m') as ym,
                    u.id   as user_id,
                    u.name as user_name,
                    u.role as user_role,
                    1      as handled,
                    0      as sold
                ");
            $parts[] = $agentHandled;
        }

        // A2) AGENTS — Sold: listing sold date (sold_at → updated_at); credit each attached agent
        if ($this->tableExists('property_listing_agents') && $this->tableExists('property_listings') && $this->tableExists('users')) {
            $soldDateExpr = "COALESCE(pl.sold_at, pl.updated_at)";
            $agentSold = DB::table('property_listing_agents as pla')
                ->join('property_listings as pl', 'pl.id', '=', 'pla.property_listing_id')
                ->join('users as u', 'u.id', '=', 'pla.agent_id')
                ->whereBetween(DB::raw($soldDateExpr), [$start, $end])
                ->when($this->tableExists('property_listings','status'),
                    fn($q) => $q->whereIn(DB::raw('LOWER(pl.status)'), $this->SOLD_STATUSES),
                    fn($q) => $q->whereNotNull('pl.sold_at')
                )
                ->when($this->tableExists('users','role'),
                    fn($q) => $q->whereRaw("LOWER(u.role) = 'agent'")
                )
                ->selectRaw("
                    DATE_FORMAT($soldDateExpr, '%Y-%m') as ym,
                    u.id   as user_id,
                    u.name as user_name,
                    u.role as user_role,
                    0      as handled,
                    1      as sold
                ");
            $parts[] = $agentSold;
        }

        // B1) BROKERS — Handled: property_listings.created_at
        if ($this->tableExists('property_listings') && $this->tableExists('users')) {
            $brokerHandled = DB::table('property_listings as bl')
                ->join('users as u', 'u.id', '=', 'bl.broker_id')
                ->whereBetween('bl.created_at', [$start, $end])
                ->when($this->tableExists('users','role'),
                    fn($q) => $q->whereRaw("LOWER(u.role) = 'broker'")
                )
                ->selectRaw("
                    DATE_FORMAT(bl.created_at, '%Y-%m') as ym,
                    u.id   as user_id,
                    u.name as user_name,
                    u.role as user_role,
                    1      as handled,
                    0      as sold
                ");
            $parts[] = $brokerHandled;
        }

        // B2) BROKERS — Sold: sold_at → updated_at
        if ($this->tableExists('property_listings') && $this->tableExists('users')) {
            $blSoldDateExpr = "COALESCE(bl.sold_at, bl.updated_at)";
            $brokerSold = DB::table('property_listings as bl')
                ->join('users as u', 'u.id', '=', 'bl.broker_id')
                ->whereBetween(DB::raw($blSoldDateExpr), [$start, $end])
                ->when($this->tableExists('property_listings','status'),
                    fn($q) => $q->whereIn(DB::raw('LOWER(bl.status)'), $this->SOLD_STATUSES),
                    fn($q) => $q->whereNotNull('bl.sold_at')
                )
                ->when($this->tableExists('users','role'),
                    fn($q) => $q->whereRaw("LOWER(u.role) = 'broker'")
                )
                ->selectRaw("
                    DATE_FORMAT($blSoldDateExpr, '%Y-%m') as ym,
                    u.id   as user_id,
                    u.name as user_name,
                    u.role as user_role,
                    0      as handled,
                    1      as sold
                ");
            $parts[] = $brokerSold;
        }

        if (empty($parts)) {
            abort(404, 'No data available for handled/sold report.');
        }

        $union = array_shift($parts);
        foreach ($parts as $p) {
            $union = $union->unionAll($p);
        }

        $rows = DB::query()
            ->fromSub($union, 'z')
            ->groupBy('z.ym', 'z.user_id', 'z.user_name', 'z.user_role')
            ->selectRaw("
                z.ym,
                z.user_id,
                z.user_name,
                z.user_role,
                SUM(z.handled) as handled,
                SUM(z.sold)    as sold
            ")
            ->orderBy('z.ym')
            ->orderBy('z.user_name')
            ->get();

        return $this->generatePdf(
            'exports.pdf.monthly-handled-vs-sold-by-user',
            [
                'title' => 'Monthly Handled vs Sold — Agents & Brokers',
                'rows'  => $rows,
                'range' => $this->printableRange($start, $end),
            ],
            'monthly_handled_vs_sold_by_user.pdf'
        );
    }
}
