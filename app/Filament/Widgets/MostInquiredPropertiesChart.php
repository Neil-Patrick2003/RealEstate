<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MostInquiredPropertiesChart extends ChartWidget
{
    protected static ?string $heading = 'Most Inquired Properties (Top 10)';
    protected static ?int $sort = -39;
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
        if (!Schema::hasTable('inquiries') || !Schema::hasTable('properties')) {
            return $this->getEmptyData();
        }

        // Get top 10 most inquired properties
        $rows = DB::table('inquiries as iq')
            ->selectRaw('iq.property_id, COUNT(*) as inquiry_count')
            ->whereNotNull('iq.property_id')
            ->groupBy('iq.property_id')
            ->orderByDesc('inquiry_count')
            ->limit(10)
            ->get();

        if ($rows->isEmpty()) {
            return $this->getEmptyData();
        }

        // Fetch property titles
        $ids = $rows->pluck('property_id')->all();
        $properties = DB::table('properties')
            ->whereIn('id', $ids)
            ->pluck('title', 'id');

        // Prepare labels and data
        $labels = [];
        $data = [];

        foreach ($rows as $row) {
            $title = $properties[$row->property_id] ?? ('Property #' . $row->property_id);
            // Shorten long titles for better display
            $shortTitle = strlen($title) > 30 ? substr($title, 0, 30) . '...' : $title;
            $labels[] = $shortTitle;
            $data[] = (int) $row->inquiry_count;
        }

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Inquiries',
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
            'indexAxis' => 'y', // Horizontal bar chart for better property name display
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                // Using default tooltip - no custom callbacks
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
                        'text' => 'Number of Inquiries',
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
        if (!Schema::hasTable('inquiries') || !Schema::hasTable('properties')) {
            return 'No inquiry data available';
        }

        $data = $this->getData();
        $inquiryCounts = $data['datasets'][0]['data'] ?? [];

        if (empty($inquiryCounts) || array_sum($inquiryCounts) === 0) {
            return 'No property inquiries recorded';
        }

        $totalInquiries = array_sum($inquiryCounts);
        $topPropertyInquiries = max($inquiryCounts);
        $averageInquiries = round($totalInquiries / count($inquiryCounts), 1);

        return "Total: {$totalInquiries} inquiries • Top Property: {$topPropertyInquiries} inquiries • Avg: {$averageInquiries}";
    }

    private function getEmptyData(): array
    {
        return [
            'labels' => ['No Data Available'],
            'datasets' => [[
                'label' => 'Inquiries',
                'data' => [0],
                'backgroundColor' => 'rgba(16, 185, 129, 0.3)',
                'borderColor' => '#10B981',
                'borderWidth' => 2,
                'borderRadius' => 6,
            ]],
        ];
    }
}
