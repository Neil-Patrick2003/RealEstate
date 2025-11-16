<?php

namespace App\Filament\Widgets;

use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyTripping;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PropertyPerformanceChart extends ChartWidget
{
    public ?int $propertyId = null;

    protected static ?string $heading = 'Property Performance (30 days)';
    protected static ?int $sort = 20;
    protected static ?string $pollingInterval = '120s';
    protected static ?string $maxHeight = '500px';

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
        if ($this->propertyId && ($title = Property::whereKey($this->propertyId)->value('title'))) {
            return "📊 Performance – {$title} (30 days)";
        }
        return static::$heading ?? '📊 Property Performance (30 days)';
    }

    public function getHeight(): string
    {
        return '500px';
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
        if ($this->propertyId) {
            $totalViews = (int) (Property::whereKey($this->propertyId)->value('views') ?? 0);
        } else {
            $totalViews = (int) (Property::sum('views') ?? 0);
        }
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
                    'tension' => 0.3,
                    'borderColor' => '#10B981', // emerald-500
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'fill' => true,
                    'borderWidth' => 3,
                    'pointRadius' => 0,
                ],
                [
                    'label' => 'Inquiries',
                    'data' => $seriesInquiries,
                    'tension' => 0.3,
                    'borderColor' => '#059669', // emerald-600
                    'backgroundColor' => 'rgba(5, 150, 105, 0.1)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointBackgroundColor' => '#059669',
                    'pointBorderColor' => '#ffffff',
                    'pointBorderWidth' => 2,
                    'pointRadius' => 4,
                    'pointHoverRadius' => 6,
                ],
                [
                    'label' => 'Trippings',
                    'data' => $seriesTrippings,
                    'tension' => 0.3,
                    'borderColor' => '#047857', // emerald-700
                    'backgroundColor' => 'rgba(4, 120, 87, 0.1)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointBackgroundColor' => '#047857',
                    'pointBorderColor' => '#ffffff',
                    'pointBorderWidth' => 2,
                    'pointRadius' => 4,
                    'pointHoverRadius' => 6,
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
            'maintainAspectRatio' => true,
            'plugins' => [
                'legend' => [
                    'position' => 'top',
                    'labels' => [
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                            'weight' => '600',
                        ],
                        'padding' => 15,
                        'usePointStyle' => true,
                        'pointStyle' => 'circle',
                    ],
                ],
                // Using default tooltip - no custom configuration
            ],
            'interaction' => [
                'mode' => 'index',
                'intersect' => false,
            ],
            'elements' => [
                'line' => [
                    'tension' => 0.3,
                ],
            ],
            'scales' => [
                'x' => [
                    'grid' => [
                        'display' => false,
                    ],
                    'ticks' => [
                        'color' => '#374151',
                        'font' => [
                            'size' => 11,
                        ],
                        'maxTicksLimit' => 10,
                    ],
                ],
                'y' => [
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
                        'text' => 'Count',
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                            'weight' => '600',
                        ],
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
        $data = $this->getData();
        $inquiries = $data['datasets'][1]['data'] ?? [];
        $trippings = $data['datasets'][2]['data'] ?? [];

        $totalInquiries = array_sum($inquiries);
        $totalTrippings = array_sum($trippings);
        $conversionRate = $totalInquiries > 0 ? round(($totalTrippings / $totalInquiries) * 100, 1) : 0;

        if ($this->propertyId) {
            return "Inquiries: {$totalInquiries} • Trippings: {$totalTrippings} • Conversion: {$conversionRate}%";
        }

        return "Total Inquiries: {$totalInquiries} • Total Trippings: {$totalTrippings} • Overall Conversion: {$conversionRate}%";
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

    /** ========== EMPTY STATE ========== */
    private function getEmptyData(): array
    {
        $labels = [];
        $start = Carbon::today()->subDays(29);

        for ($i = 0; $i < 30; $i++) {
            $labels[] = $start->copy()->addDays($i)->format('M d');
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Views (cumulative)',
                    'data' => array_fill(0, 30, 0),
                    'tension' => 0.3,
                    'borderColor' => 'rgba(16, 185, 129, 0.3)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.05)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 0,
                ],
                [
                    'label' => 'Inquiries',
                    'data' => array_fill(0, 30, 0),
                    'tension' => 0.3,
                    'borderColor' => 'rgba(5, 150, 105, 0.3)',
                    'backgroundColor' => 'rgba(5, 150, 105, 0.05)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 0,
                ],
                [
                    'label' => 'Trippings',
                    'data' => array_fill(0, 30, 0),
                    'tension' => 0.3,
                    'borderColor' => 'rgba(4, 120, 87, 0.3)',
                    'backgroundColor' => 'rgba(4, 120, 87, 0.05)',
                    'fill' => true,
                    'borderWidth' => 2,
                    'pointRadius' => 0,
                ],
            ],
        ];
    }
}
