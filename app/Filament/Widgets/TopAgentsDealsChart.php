<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class TopAgentsDealsChart extends ChartWidget
{
    protected static ?string $heading = 'Top Agents (Deals)';
    protected static ?int $sort = -50;

    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        $rows = DB::table('deals as d')
            ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
            ->join('property_listing_agents as pla', 'pla.property_listing_id', '=', 'pl.id')
            ->join('users as u', 'u.id', '=', 'pla.agent_id')
            ->selectRaw('pla.agent_id, u.name, COUNT(*) as deals')
            ->groupBy('pla.agent_id', 'u.name')
            ->orderByDesc('deals')
            ->limit(10)
            ->get();

        $labels = $rows->pluck('name')->all();
        $data   = $rows->pluck('deals')->map(fn($v) => (int)$v)->all();

        return [
            'labels' => $labels,
            'datasets' => [[ 'label' => 'Deals', 'data' => $data ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y', // horizontal bars
            'plugins' => ['legend' => ['display' => false]],
            'scales'  => ['x' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]]],
            'responsive' => true,
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
