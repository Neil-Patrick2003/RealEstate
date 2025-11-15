<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class PropertiesByStatusChart extends ChartWidget
{
    protected static ?string $heading = 'Property Status Distribution'; // Slightly refined heading
    protected static ?string $pollingInterval = '60s';
    protected static ?int $sort = 12;

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3, '2xl' => 3];
    }

    protected int|string|null $chartHeight = 320;

    protected function getData(): array
    {
        // Define the statuses you want to show and the order
        $labels = ['Assigned', 'Published', 'Unassigned', 'Sold'];

        // Single query: counts grouped by status
        $rows = Property::query()
            ->select('status', DB::raw('COUNT(*) as c'))
            ->whereIn('status', $labels)
            ->groupBy('status')
            ->pluck('c', 'status')
            ->all();

        // Map counts to labels in the desired order
        $counts = array_map(fn ($s) => (int) ($rows[$s] ?? 0), $labels);

        // --- ADJUSTED GREEN THEME COLORS ---
        // Published uses a strong green (Emerald/Success). Others provide visual contrast.
        $colorMap = [
            'Assigned'   => ['rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.9)'], // Info (Blue)
            'Published'  => ['rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.9)'], // Success (Emerald) - Primary Theme Color
            'Unassigned' => ['rgba(234, 179, 8, 0.6)',  'rgba(234, 179, 8, 0.9)'],  // Warning (Amber) - Needs attention
            'Sold'       => ['rgba(107, 114, 128, 0.6)', 'rgba(107, 114, 128, 0.9)'], // Gray - Final status
        ];

        $bg = [];
        $border = [];

        // Map colors to the defined label order
        foreach ($labels as $label) {
            $bg[] = $colorMap[$label][0];
            $border[] = $colorMap[$label][1];
        }

        return [
            'labels' => $labels,
            'datasets' => [[
                'data' => $counts,
                'backgroundColor' => $bg,
                'borderColor' => $border,
                'borderWidth' => 2,
                'hoverOffset' => 6,
            ]],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        // Added tooltip callback to show percentage and increased cutout slightly for aesthetics.
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels' => [
                        'usePointStyle' => true,
                        'padding' => 20,
                    ],
                ],
                'tooltip' => [
                    'callbacks' => [
                        'label' => RawJs::make(<<<JS
                            (context) => {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    let value = context.parsed;
                                    let percentage = (value * 100 / total).toFixed(1) + '%';
                                    label += value.toLocaleString() + ' (' + percentage + ')';
                                }
                                return label;
                            }
                        JS),
                    ],
                ],
            ],
            'cutout' => '65%',
            'animation' => [
                'animateRotate' => true,
                'animateScale' => true,
            ],
        ];
    }
}
