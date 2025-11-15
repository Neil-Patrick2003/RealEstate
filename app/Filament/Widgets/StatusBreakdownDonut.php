<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Widgets\ChartWidget;

class StatusBreakdownDonut extends ChartWidget
{
    protected static ?string $heading = 'Status Breakdown';
    protected static ?int $sort = -38;
    protected function getType(): string { return 'doughnut'; }

    protected function getData(): array
    {
        // Map your real statuses here
        $map = [
            'Active'  => ['Active','Published','Live'],
            'Pending' => ['Pending','Draft','Review'],
            'Sold'    => ['Sold','Closed'],
        ];

        $counts = [];
        foreach ($map as $label => $statuses) {
            $counts[$label] = Property::whereIn('status', $statuses)->count();
        }

        return [
            'labels' => array_keys($counts),
            'datasets' => [[
                'data' => array_values($counts),
                'backgroundColor' => [
                    'rgb(16,185,129)',   // 🟩 Active
                    'rgb(234,179,8)',    // 🟨 Pending
                    'rgb(59,130,246)',   // 🟦 Sold
                ],
                'borderWidth' => 0,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => ['display' => true, 'position' => 'bottom'],
                'tooltip' => ['enabled' => true],
            ],
            'cutout' => '60%',
        ];
    }
}
