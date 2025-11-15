<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PropertiesNewVsPublishedChart extends ChartWidget
{
    protected static ?string $heading = 'New vs Published (last 8 weeks)';
    protected static ?int $sort = 11;

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }


    protected function getContentHeight(): string
    {
        return '800';
    }

    protected function getData(): array
    {
        $end   = Carbon::now()->endOfWeek();
        $start = $end->copy()->subWeeks(7)->startOfWeek();

        $weekKeys = [];
        $labels   = [];
        $cursor   = $start->copy();

        while ($cursor->lte($end)) {
            $weekKeys[] = (int) $cursor->isoFormat('GGGGWW');
            $labels[]   = 'Wk ' . $cursor->isoWeek;
            $cursor->addWeek();
        }

        $newRows = Property::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('YEARWEEK(created_at, 3) as yw, COUNT(*) as c')
            ->groupBy('yw')
            ->pluck('c', 'yw')
            ->toArray();

        $hasPublishedAt = Schema::hasColumn((new Property())->getTable(), 'published_at');
        $pubRows = Property::query()
            ->when(!$hasPublishedAt, fn ($q) => $q->where('status', 'Published'))
            ->whereBetween($hasPublishedAt ? 'published_at' : 'created_at', [$start, $end])
            ->selectRaw(
                $hasPublishedAt
                    ? 'YEARWEEK(published_at, 3) as yw, COUNT(*) as c'
                    : 'YEARWEEK(created_at, 3) as yw, COUNT(*) as c'
            )
            ->groupBy('yw')
            ->pluck('c', 'yw')
            ->toArray();

        $seriesNew = [];
        $seriesPub = [];
        foreach ($weekKeys as $key) {
            $seriesNew[] = (int) ($newRows[$key] ?? 0);
            $seriesPub[] = (int) ($pubRows[$key] ?? 0);
        }

        return [
            'labels'   => $labels,
            'datasets' => [
                [
                    'label' => 'New Properties',
                    'data' => $seriesNew,
                    'tension' => 0.35,
                    'fill' => true,
                    'borderColor' => 'rgba(59, 130, 246, 1)',     // blue-500
                    'backgroundColor' => 'rgba(59, 130, 246, 0.15)', // 15% fill
                    'pointBackgroundColor' => 'rgba(59, 130, 246, 1)',
                    'pointBorderColor' => 'white',
                    'pointRadius' => 3,
                    'pointHoverRadius' => 5,
                ],
                [
                    'label' => 'Published Listings',
                    'data' => $seriesPub,
                    'tension' => 0.35,
                    'fill' => true,
                    'borderColor' => 'rgba(16, 185, 129, 1)',     // emerald-500
                    'backgroundColor' => 'rgba(16, 185, 129, 0.15)', // 15% fill
                    'pointBackgroundColor' => 'rgba(16, 185, 129, 1)',
                    'pointBorderColor' => 'white',
                    'pointRadius' => 3,
                    'pointHoverRadius' => 5,
                ],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'line';
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
                        'padding' => 20,
                    ],
                ],
                'tooltip' => [
                    'mode' => 'index',
                    'intersect' => false,
                    'backgroundColor' => 'rgba(0,0,0,0.7)',
                    'titleFont' => ['weight' => 'bold'],
                ],
            ],
            'interaction' => [
                'mode' => 'index',
                'intersect' => false,
            ],
            'elements' => [
                'line' => [
                    'borderWidth' => 2,
                ],
            ],
            'scales' => [
                'x' => [
                    'grid' => ['display' => false],
                    'ticks' => [
                        'font' => ['size' => 12],
                    ],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'precision' => 0,
                        'font' => ['size' => 12],
                    ],
                    'grid' => [
                        'color' => 'rgba(200,200,200,0.15)',
                    ],
                ],
            ],
        ];
    }
}
