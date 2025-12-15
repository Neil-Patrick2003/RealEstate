<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class MostSoldLocations extends ChartWidget
{
    protected static ?string $heading = 'Most Sold Property Locations';
    protected static ?string $description = 'Top 10 locations by number of sold properties';

    protected int|string|array $columnSpan = 'full';
    protected static ?string $maxHeight = '420px';

    protected function getData(): array
    {
        $query = Property::query()
            ->select('address', DB::raw('COUNT(*) as sold_count'))
            ->where('status', 'sold')
            ->whereNotNull('address')
            ->where('address', '!=', '');

        // Optional: if you still want to keep your filters UI
        if (! empty($this->filter)) {
            $from = match ($this->filter) {
                'month'   => now()->subMonth(),
                'quarter' => now()->subMonths(3),
                'year'    => now()->subYear(),
                default   => null,
            };

            if ($from) {
                // Use the column that best represents “sold date” in your app:
                // sold_at, updated_at, or created_at. Here we use updated_at.
                $query->where('updated_at', '>=', $from);
            }
        }

        $rows = $query
            ->groupBy('address')
            ->orderByDesc('sold_count')
            ->limit(10)
            ->get();

        $labels = $rows->pluck('address')->all();
        $values = $rows->pluck('sold_count')->all();

        // Teal gradient (darker at top, lighter down the list)
        $background = [];
        $border = [];

        foreach ($values as $i => $v) {
            $alpha = max(0.35, 0.90 - ($i * 0.06));
            $background[] = "rgba(20, 184, 166, {$alpha})"; // teal
            $border[]     = "rgba(13, 148, 136, 1)";        // darker teal
        }

        return [
            'datasets' => [
                [
                    'label' => 'Sold',
                    'data' => $values,
                    'backgroundColor' => $background,
                    'borderColor' => $border,
                    'borderWidth' => 1,
                    'borderRadius' => 10,
                    'barThickness' => 18,
                    'maxBarThickness' => 22,
                    'hoverBorderWidth' => 2,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y', // horizontal bars
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => [
                    'enabled' => true,
                    'displayColors' => false,
                    'padding' => 12,
                    'cornerRadius' => 10,
                    'backgroundColor' => 'rgba(15, 23, 42, 0.92)', // slate-900-ish
                    'titleColor' => '#E2E8F0',
                    'bodyColor' => '#F1F5F9',
                    'callbacks' => [
                        // Show “Sold: 1,234”
                        'label' => RawJs::make(<<<'JS'
function (ctx) {
  const n = ctx.parsed.x ?? 0;
  return 'Sold: ' + new Intl.NumberFormat().format(n);
}
JS),
                    ],
                ],
            ],
            'scales' => [
                'y' => [
                    'grid' => ['display' => false],
                    'ticks' => [
                        'color' => '#64748B',
                        'font' => ['size' => 12],
                        // Truncate long addresses ONLY on the axis
                        'callback' => RawJs::make(<<<'JS'
function(value) {
  const label = this.getLabelForValue(value) || '';
  return label.length > 34 ? label.slice(0, 34) + '…' : label;
}
JS),
                    ],
                ],
                'x' => [
                    'beginAtZero' => true,
                    'grid' => ['color' => 'rgba(148, 163, 184, 0.15)'],
                    'ticks' => [
                        'color' => '#64748B',
                        'precision' => 0,
                        'font' => ['size' => 12],
                        'callback' => RawJs::make(<<<'JS'
function(value) {
  return new Intl.NumberFormat().format(value);
}
JS),
                    ],
                ],
            ],
            'animation' => [
                'duration' => 900,
                'easing' => 'easeOutQuart',
            ],
            'interaction' => [
                'mode' => 'nearest',
                'intersect' => false,
            ],
        ];
    }

    protected function getFilters(): ?array
    {
        return [
            null => 'All Time',
            'month' => 'Last Month',
            'quarter' => 'Last Quarter',
            'year' => 'Last Year',
        ];
    }
}
