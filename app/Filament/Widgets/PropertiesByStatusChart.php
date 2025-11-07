<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
    use Illuminate\Support\Facades\DB;

    class PropertiesByStatusChart extends ChartWidget
    {protected static ?string $heading = 'Property by Status';
    protected static ?string $pollingInterval = '60s';
    protected static ?int $sort = 12;

        public function getColumnSpan(): int|string|array
        {
            return ['default'=>1,'md'=>2,'xl'=>2,'2xl'=>2];
        }



    protected int|string|null $chartHeight = 320;

    protected function getData(): array
    {
        // Define the statuses you want to show and the order to show them in
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

        // Pretty colors (Tailwind-like palette)
        $bg = [
            'rgba(59, 130, 246, 0.25)',  // Assigned - blue 500 @ 25%
            'rgba(16, 185, 129, 0.25)',  // Published - emerald 500
            'rgba(234, 179, 8, 0.25)',   // Unassigned - amber 500
            'rgba(107, 114, 128, 0.25)', // Sold - gray 500
        ];
        $border = [
            'rgba(59, 130, 246, 0.9)',
            'rgba(16, 185, 129, 0.9)',
            'rgba(234, 179, 8, 0.9)',
            'rgba(107, 114, 128, 0.9)',
        ];

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
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels' => [
                        'usePointStyle' => true,
                        'padding' => 18,
                    ],
                ],
            ],
            'cutout' => '60%',
            'animation' => [
                'animateRotate' => true,
                'animateScale' => true,
            ],
        ];
    }

}
