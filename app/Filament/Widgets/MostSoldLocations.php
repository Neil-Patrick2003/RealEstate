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

    protected static ?string $maxHeight = '400px';

    protected function getData(): array
    {
        $rows = Property::query()
            ->select(
                'address',
                DB::raw('COUNT(properties.id) as sold_count')
            )
            ->where('status', 'sold')
            ->groupBy('address')
            ->orderByDesc('sold_count')
            ->limit(10)
            ->get();

        $labels = $rows->pluck('address')->toArray();
        $values = $rows->pluck('sold_count')->toArray();

        // Generate different shades of green for the bars
        $backgroundColors = [];
        $borderColors = [];

        foreach ($values as $index => $value) {
            // Create gradient of green from dark to light
            $greenValue = 120 + ($index * 15); // Base green hue
            $alpha = 0.8;

            $backgroundColors[] = "rgba(56, 178, 172, {$alpha})"; // Teal-500 with alpha
            $borderColors[] = "rgb(56, 178, 172)"; // Teal-500 solid
        }

        return [
            'datasets' => [
                [
                    'label' => 'Sold Properties',
                    'data' => $values,
                    'backgroundColor' => $backgroundColors,
                    'borderColor' => $borderColors,
                    'borderWidth' => 2,
                    'borderRadius' => 6,
                    'hoverBackgroundColor' => 'rgba(72, 187, 120, 0.9)', // Green-400 on hover
                    'hoverBorderColor' => 'rgb(56, 178, 172)',
                    'hoverBorderWidth' => 3,
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
            'responsive' => true,
            'maintainAspectRatio' => true,
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                'tooltip' => [
                    'backgroundColor' => 'rgba(0, 0, 0, 0.8)',
                    'titleColor' => '#cbd5e0',
                    'bodyColor' => '#e2e8f0',
                    'titleFont' => [
                        'size' => 14,
                        'weight' => 'bold',
                    ],
                    'bodyFont' => [
                        'size' => 13,
                    ],
                    'padding' => 12,
                    'cornerRadius' => 6,
                    'displayColors' => false,
                    'callbacks' => [
                        'label' => function($context) {
                            return "Sold Properties: " . $context->raw;
                        }
                    ]
                ],
            ],
            'scales' => [
                'x' => [
                    'grid' => [
                        'display' => false,
                    ],
                    'ticks' => [
                        'color' => '#718096',
                        'maxRotation' => 45,
                        'minRotation' => 45,
                        'font' => [
                            'size' => 12,
                        ],
                    ],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'grid' => [
                        'color' => 'rgba(226, 232, 240, 0.2)',
                    ],
                    'ticks' => [
                        'color' => '#718096',
                        'precision' => 0,
                        'font' => [
                            'size' => 12,
                        ],
                    ],
                    'title' => [
                        'display' => true,
                        'text' => 'Number of Properties',
                        'color' => '#718096',
                        'font' => [
                            'size' => 13,
                            'weight' => 'bold',
                        ],
                    ],
                ],
            ],
            'animation' => [
                'duration' => 1000,
                'easing' => 'easeOutQuart',
            ],
            'hover' => [
                'mode' => 'index',
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

    public function getDescription(): ?string
    {
        return 'Displays the top 10 locations with the highest number of sold properties';
    }
}
