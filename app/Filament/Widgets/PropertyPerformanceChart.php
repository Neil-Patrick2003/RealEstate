<?php

namespace App\Filament\Widgets;

        use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyTripping; // <-- adjust if your class name differs
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PropertyPerformanceChart extends ChartWidget
{
    public ?int $propertyId = null;

    protected static ?string $heading = 'Property Performance (30 days)';
    protected static ?int $sort = 20;

    protected array|string|int $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];

    protected int|string|null $chartHeight = 420;

    public function mount(): void
    {
        $this->propertyId = (int) request()->query('property', 0) ?: null;
    }

    public function getHeading(): string
    {
        if ($this->propertyId && ($t = Property::whereKey($this->propertyId)->value('title'))) {
            return "Performance – {$t} (30 days)";
        }
        return static::$heading ?? 'Property Performance (30 days)';
    }

    protected function getData(): array
    {
        $end   = Carbon::today();
        $start = $end->copy()->subDays(29);

        // Build 30-day label axis
        $dateKeys = [];
        $labels   = [];
        $c = $start->copy();
        while ($c->lte($end)) {
            $dateKeys[] = $c->toDateString();
            $labels[]   = $c->format('M d');
            $c->addDay();
        }

        // ---- Views (cumulative snapshot from properties.views) ----
        // If focused to a property → that property's views
        // Else → sum of all property views
        if ($this->propertyId) {
            $totalViews = (int) (Property::whereKey($this->propertyId)->value('views') ?? 0);
        } else {
            $totalViews = (int) (Property::sum('views') ?? 0);
        }
        // Represent it as a flat cumulative line across the range
        $seriesViews = array_fill(0, count($dateKeys), $totalViews);

        // ---- Inquiries (daily counts) ----
        $inquiriesTable  = class_exists(Inquiry::class) ? (new Inquiry)->getTable() : 'inquiries';
        $inquiriesRows   = $this->dailyCounts(
            table: $inquiriesTable,
            dateColumn: 'created_at',
            propertyColumn: 'property_id',
            start: $start,
            end: $end,
            propertyId: $this->propertyId
        );
        $seriesInquiries = array_map(fn ($d) => (int) ($inquiriesRows[$d] ?? 0), $dateKeys);

        // ---- Trippings (daily counts) ----
        $trippingsTable  = class_exists(PropertyTripping::class) ? (new PropertyTripping)->getTable() : 'property_trippings';
        $trippingsRows   = $this->dailyCounts(
            table: $trippingsTable,
            dateColumn: 'created_at',
            propertyColumn: 'property_id',
            start: $start,
            end: $end,
            propertyId: $this->propertyId
        );
        $seriesTrippings = array_map(fn ($d) => (int) ($trippingsRows[$d] ?? 0), $dateKeys);

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Views (cumulative)',
                    'data' => $seriesViews,
                    'tension' => 0.25,
                    'borderColor' => 'rgba(59, 130, 246, 1)',       // blue-500
                    'backgroundColor' => 'rgba(59, 130, 246, 0.12)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 0,
                ],
                [
                    'label' => 'Inquiries',
                    'data' => $seriesInquiries,
                    'tension' => 0.25,
                    'borderColor' => 'rgba(234, 179, 8, 1)',        // amber-500
                    'backgroundColor' => 'rgba(234, 179, 8, 0.12)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 2,
                    'pointHoverRadius' => 4,
                ],
                [
                    'label' => 'Trippings',
                    'data' => $seriesTrippings,
                    'tension' => 0.25,
                    'borderColor' => 'rgba(16, 185, 129, 1)',       // emerald-500
                    'backgroundColor' => 'rgba(16, 185, 129, 0.12)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 2,
                    'pointHoverRadius' => 4,
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
                        'padding' => 14,
                    ],
                ],
                'tooltip' => [
                    'mode' => 'index',
                    'intersect' => false,
                ],
            ],
            'interaction' => [
                'mode' => 'index',
                'intersect' => false,
            ],
            'elements' => [
                'line' => ['borderWidth' => 2],
            ],
            'scales' => [
                'x' => [
                    'grid' => ['display' => false],
                    'ticks' => ['font' => ['size' => 12]],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => ['precision' => 0, 'font' => ['size' => 12]],
                    'grid' => ['color' => 'rgba(200,200,200,0.15)'],
                ],
            ],
        ];
    }

    /**
     * Returns ['YYYY-MM-DD' => count, ...]
     */
    private function dailyCounts(
        string $table,
        string $dateColumn,
        string $propertyColumn,
        Carbon $start,
        Carbon $end,
        ?int $propertyId = null
    ): array {
        if (!Schema::hasTable($table)) {
            return [];
        }

        $q = DB::table($table)
            ->whereBetween($dateColumn, [$start->copy()->startOfDay(), $end->copy()->endOfDay()]);

        if ($propertyId) {
            $q->where($propertyColumn, $propertyId);
        }

        return $q->selectRaw("DATE($dateColumn) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd')
            ->toArray();
    }
}
