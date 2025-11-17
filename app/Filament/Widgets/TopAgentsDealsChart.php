<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Number;

class TopAgentsDealsChart extends ChartWidget
{
    protected static ?string $heading = '🏆 Top Performing Agents (Deals)';
    protected static ?int $sort = -50;
    protected static ?string $pollingInterval = '120s';
    protected static ?string $maxHeight = '500px';

    protected function getType(): string
    {
        return 'bar';
    }

    public function getHeight(): string
    {
        return '500px';
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2, '2xl' => 2];
    }

    protected function getData(): array
    {
        if (!Schema::hasTable('deals') || !Schema::hasTable('users')) {
            return $this->getEmptyData();
        }

        $rows = DB::table('deals as d')
            ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
            ->join('property_listing_agents as pla', 'pla.property_listing_id', '=', 'pl.id')
            ->join('users as u', 'u.id', '=', 'pla.agent_id')
            ->selectRaw('pla.agent_id, u.name, u.role, COUNT(*) as deals')
            ->groupBy('pla.agent_id', 'u.name', 'u.role')
            ->orderByDesc('deals')
            ->limit(10)
            ->get();

        if ($rows->isEmpty()) {
            return $this->getEmptyData();
        }

        $labels = $rows->map(function ($row) {
            $roleIcon = $row->role === 'broker' ? '👔' : '🎯';
            $shortName = strlen($row->name) > 20 ? substr($row->name, 0, 20) . '...' : $row->name;
            return "{$roleIcon} {$shortName}";
        })->all();

        $data = $rows->pluck('deals')->map(fn($v) => (int)$v)->all();

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Deals Closed',
                'data' => $data,
                'backgroundColor' => '#10B981', // emerald-500
                'borderColor' => '#059669', // emerald-600
                'borderWidth' => 2,
                'borderRadius' => 6,
                'barPercentage' => 0.7,
                'categoryPercentage' => 0.8,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => true,
            'indexAxis' => 'y', // horizontal bars for better name display
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                // Using default tooltip - no custom configuration
            ],
            'scales' => [
                'x' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'precision' => 0,
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                        ],
                    ],
                    'grid' => [
                        'color' => 'rgba(5, 150, 105, 0.1)',
                    ],
                    'title' => [
                        'display' => true,
                        'text' => 'Number of Deals',
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                            'weight' => '600',
                        ],
                    ],
                ],
                'y' => [
                    'ticks' => [
                        'color' => '#374151',
                        'font' => [
                            'size' => 11,
                        ],
                        'maxTicksLimit' => 10,
                    ],
                    'grid' => [
                        'display' => false,
                    ],
                ],
            ],
            'layout' => [
                'padding' => [
                    'top' => 20,
                    'right' => 20,
                    'bottom' => 20,
                    'left' => 20,
                ],
            ],
        ];
    }

    /** ========== CHART DESCRIPTION ========== */
    public function getDescription(): ?string
    {
        if (!Schema::hasTable('deals') || !Schema::hasTable('users')) {
            return 'No agent performance data available';
        }

        $data = $this->getData();
        $deals = $data['datasets'][0]['data'] ?? [];

        if (empty($deals) || array_sum($deals) === 0) {
            return 'No deals recorded for agents';
        }

        $totalDeals = array_sum($deals);
        $topAgentDeals = max($deals);
        $averageDeals = round($totalDeals / count($deals), 1);

        return "Total: {$totalDeals} deals • Top Agent: {$topAgentDeals} deals • Avg: {$averageDeals}";
    }

    private function getEmptyData(): array
    {
        return [
            'labels' => ['No Data Available'],
            'datasets' => [[
                'label' => 'Deals Closed',
                'data' => [0],
                'backgroundColor' => 'rgba(16, 185, 129, 0.3)',
                'borderColor' => '#10B981',
                'borderWidth' => 2,
                'borderRadius' => 6,
            ]],
        ];
    }
}
