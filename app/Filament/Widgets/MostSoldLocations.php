<?php

namespace App\Filament\Widgets;

use App\Models\Property;
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

        if (! empty($this->filter)) {
            $from = match ($this->filter) {
                'month'   => now()->subMonth(),
                'quarter' => now()->subMonths(3),
                'year'    => now()->subYear(),
                default   => null,
            };

            if ($from) {
                // Adjust to your real "sold date" column if you have one
                $query->where('updated_at', '>=', $from);
            }
        }

        $rows = $query
            ->groupBy('address')
            ->orderByDesc('sold_count')
            ->limit(10)
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Sold',
                    'data'  => $rows->pluck('sold_count')->all(),
                ],
            ],
            'labels' => $rows->pluck('address')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getFilters(): ?array
    {
        return [
            null      => 'All Time',
            'month'   => 'Last Month',
            'quarter' => 'Last Quarter',
            'year'    => 'Last Year',
        ];
    }
}
