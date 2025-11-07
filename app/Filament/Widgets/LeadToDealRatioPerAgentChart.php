<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class LeadToDealRatioPerAgentChart extends ChartWidget
{
    protected static ?string $heading = 'Lead → Deal Ratio per Agent';
    protected static ?int $sort = -49;

    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        // (optional) limit to last 90d
        $to   = CarbonImmutable::now('Asia/Manila')->endOfDay();
        $from = $to->subDays(89)->startOfDay();

        // 1) Deals per agent (ONLY users.role='agent')
        $deals = DB::table('deals as d')
            ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
            ->join('property_listing_agents as pla', 'pla.property_listing_id', '=', 'pl.id')
            ->join('users as ua', 'ua.id', '=', 'pla.agent_id')
            ->where('ua.role', 'agent')
            ->when(Schema::hasColumn('deals', 'created_at'), fn($q) => $q->whereBetween('d.created_at', [$from, $to]))
            ->selectRaw('pla.agent_id, COUNT(*) as deals')
            ->groupBy('pla.agent_id')
            ->pluck('deals', 'agent_id');

        // 2) Leads per agent (ONLY users.role='agent')
        $leads = collect();
        if (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'agent_id')) {
            $leads = DB::table('inquiries as iq')
                ->join('users as ul', 'ul.id', '=', 'iq.agent_id')
                ->where('ul.role', 'agent')
                ->whereNotNull('iq.agent_id')
                ->when(Schema::hasColumn('inquiries', 'created_at'), fn($q) => $q->whereBetween('iq.created_at', [$from, $to]))
                ->selectRaw('iq.agent_id, COUNT(*) as leads')
                ->groupBy('iq.agent_id')
                ->pluck('leads', 'agent_id');
        }

        // 3) Only include real agent user IDs
        $agentIds = DB::table('users')->where('role', 'agent')
            ->whereIn('id', $leads->keys()->merge($deals->keys())->unique()->values())
            ->pluck('id')->values();

        if ($agentIds->isEmpty()) {
            return ['labels' => [], 'datasets' => [['label' => 'Conversion %', 'data' => []]]];
        }

        $names = DB::table('users')->whereIn('id', $agentIds)->pluck('name', 'id');

        // 4) Build % list
        $pairs = [];
        foreach ($agentIds as $aid) {
            $l = (int) ($leads[$aid] ?? 0);
            $d = (int) ($deals[$aid] ?? 0);
            $pct = $l > 0 ? round(($d / $l) * 100, 1) : 0;
            $pairs[] = [$names[$aid] ?? ("Agent #$aid"), $pct];
        }

        // Top 10 by %
        $pairs = collect($pairs)->sortByDesc(fn($x) => $x[1])->take(10)->values();
        $labels = $pairs->pluck(0)->all();
        $data   = $pairs->pluck(1)->all();

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Conversion %',
                'data' => $data,
                'borderRadius' => 6,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y',
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => ['callbacks' => ['label' => fn($ctx) => $ctx.parsed.x . '%']],
            ],
            'scales' => [
                'x' => ['suggestedMin' => 0, 'suggestedMax' => 100, 'ticks' => ['callback' => 'value => value + "%"']],
            ],
            'responsive' => true,
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
