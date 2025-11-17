<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class TrippingsScheduledCompletedChart extends ChartWidget
{
    protected static ?string $heading = 'Scheduled vs Completed Trips (Last 8 Weeks)';
    protected static ?int $sort = -30;
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
        if (!Schema::hasTable('property_trippings')) {
            return $this->getEmptyData();
        }

        $tz    = 'Asia/Manila';
        $end   = CarbonImmutable::now($tz)->endOfWeek();
        $start = $end->subWeeks(7)->startOfWeek();

        // Choose the most appropriate date column
        $candidateDateCols = ['scheduled_at', 'tripping_at', 'created_at', 'updated_at'];
        $dateCol = collect($candidateDateCols)->first(fn ($c) => Schema::hasColumn('property_trippings', $c));
        if (!$dateCol) {
            return $this->getEmptyData();
        }

        // Pull counts per ISO week + normalized status (lowercased)
        $rows = DB::table('property_trippings')
            ->selectRaw("YEARWEEK($dateCol, 3) as wk, LOWER(COALESCE(status,'')) as s, COUNT(*) as c")
            ->whereBetween($dateCol, [$start, $end])
            ->groupBy('wk', 's')
            ->get();

        // Map status aliases into 3 buckets
        $aliasToBucket = [
            'accepted'   => 'scheduled',
            'scheduled'  => 'scheduled',
            'pending'    => 'scheduled',
            'confirmed'  => 'scheduled',
            'rebooked'   => 'scheduled',

            'done'       => 'completed',
            'complete'   => 'completed',
            'completed'  => 'completed',
            'finished'   => 'completed',
            'success'    => 'completed',

            'cancel'     => 'cancelled',
            'cancelled'  => 'cancelled',
            'canceled'   => 'cancelled',
            'no-show'    => 'cancelled',
            'noshow'     => 'cancelled',
            'declined'   => 'cancelled',
        ];

        // Build index: wk => ['scheduled'=>n, 'completed'=>n, 'cancelled'=>n]
        $agg = [];
        foreach ($rows as $r) {
            $bucket = $aliasToBucket[$r->s] ?? null;
            if (!$bucket) continue;
            $agg[$r->wk][$bucket] = ($agg[$r->wk][$bucket] ?? 0) + (int) $r->c;
        }

        // Generate week labels + aligned arrays
        $labels     = [];
        $scheduled  = [];
        $completed  = [];
        $cancelled  = [];

        $cursor = $start;
        while ($cursor->lte($end)) {
            $wkIso = (int) $cursor->format('oW');

            $weekStart = $cursor->startOfWeek();
            $weekEnd   = $cursor->endOfWeek();
            $labels[]  = $weekStart->format('M j') . '–' . $weekEnd->format('M j');

            $scheduled[] = $agg[$wkIso]['scheduled'] ?? 0;
            $completed[] = $agg[$wkIso]['completed'] ?? 0;
            $cancelled[] = $agg[$wkIso]['cancelled'] ?? 0;

            $cursor = $cursor->addWeek();
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Scheduled',
                    'data'  => $scheduled,
                    'stack' => 'trips',
                    'backgroundColor' => '#10B981',
                    'borderColor' => '#059669',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                    'barPercentage' => 0.7,
                    'categoryPercentage' => 0.8,
                ],
                [
                    'label' => 'Completed',
                    'data'  => $completed,
                    'stack' => 'trips',
                    'backgroundColor' => '#065F46',
                    'borderColor' => '#064E3B',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                    'barPercentage' => 0.7,
                    'categoryPercentage' => 0.8,
                ],
                [
                    'label' => 'Cancelled',
                    'data'  => $cancelled,
                    'stack' => 'trips',
                    'backgroundColor' => '#DC2626',
                    'borderColor' => '#B91C1C',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                    'barPercentage' => 0.7,
                    'categoryPercentage' => 0.8,
                ],
            ],
        ];
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
                        'pointStyle' => 'rect',
                    ],
                ],
                // Using default tooltip - no custom configuration
            ],
            'scales' => [
                'x' => [
                    'stacked' => true,
                    'grid' => [
                        'display' => false,
                    ],
                    'ticks' => [
                        'color' => '#374151',
                        'maxRotation' => 0,
                        'minRotation' => 0,
                        'font' => [
                            'size' => 11,
                        ],
                    ],
                ],
                'y' => [
                    'stacked' => true,
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
                        'text' => 'Number of Trips',
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
        if (!Schema::hasTable('property_trippings')) {
            return 'No tripping data available';
        }

        $data = $this->getData();
        $scheduled = $data['datasets'][0]['data'] ?? [];
        $completed = $data['datasets'][1]['data'] ?? [];

        if (empty($scheduled) || array_sum($scheduled) === 0) {
            return 'No trip data for the last 8 weeks';
        }

        $totalScheduled = array_sum($scheduled);
        $totalCompleted = array_sum($completed);
        $completionRate = $totalScheduled > 0 ? round(($totalCompleted / $totalScheduled) * 100, 1) : 0;

        return "Completion Rate: {$completionRate}% • Scheduled: {$totalScheduled} • Completed: {$totalCompleted}";
    }

    private function getEmptyData(): array
    {
        $labels = [];
        $cursor = CarbonImmutable::now('Asia/Manila')->subWeeks(7)->startOfWeek();

        for ($i = 0; $i < 8; $i++) {
            $weekStart = $cursor->copy()->addWeeks($i)->startOfWeek();
            $weekEnd = $cursor->copy()->addWeeks($i)->endOfWeek();
            $labels[] = $weekStart->format('M j') . '–' . $weekEnd->format('M j');
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Scheduled',
                    'data'  => array_fill(0, 8, 0),
                    'stack' => 'trips',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.3)',
                    'borderColor' => '#10B981',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                ],
                [
                    'label' => 'Completed',
                    'data'  => array_fill(0, 8, 0),
                    'stack' => 'trips',
                    'backgroundColor' => 'rgba(6, 95, 70, 0.3)',
                    'borderColor' => '#065F46',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                ],
                [
                    'label' => 'Cancelled',
                    'data'  => array_fill(0, 8, 0),
                    'stack' => 'trips',
                    'backgroundColor' => 'rgba(220, 38, 38, 0.3)',
                    'borderColor' => '#DC2626',
                    'borderWidth' => 1,
                    'borderRadius' => 6,
                ],
            ],
        ];
    }
}
