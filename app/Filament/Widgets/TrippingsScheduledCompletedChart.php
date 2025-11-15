<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class TrippingsScheduledCompletedChart extends ChartWidget
{
    protected static ?string $heading = 'Scheduled vs Completed (Last 8 Weeks)';
    protected static ?int $sort = -30;

    protected function getType(): string { return 'bar'; }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }


    protected function getData(): array
    {
        if (!Schema::hasTable('property_trippings')) {
            return ['labels' => [], 'datasets' => [['data' => []]]];
        }

        $tz    = 'Asia/Manila';
        $end   = CarbonImmutable::now($tz)->endOfWeek();          // inclusive end
        $start = $end->subWeeks(7)->startOfWeek();                 // cover 8 weeks

        // Choose the most appropriate date column
        $candidateDateCols = ['scheduled_at', 'tripping_at', 'created_at', 'updated_at'];
        $dateCol = collect($candidateDateCols)->first(fn ($c) => Schema::hasColumn('property_trippings', $c));
        if (!$dateCol) {
            return ['labels' => [], 'datasets' => [['data' => []]]];
        }

        // Pull counts per ISO week + normalized status (lowercased)
        // YEARWEEK(...,3) matches ISO year-week (Mon-based); aligns with PHP oW.
        $rows = DB::table('property_trippings')
            ->selectRaw("YEARWEEK($dateCol, 3) as wk, LOWER(COALESCE(status,'')) as s, COUNT(*) as c")
            ->whereBetween($dateCol, [$start, $end])
            ->groupBy('wk', 's')
            ->get();

        // Map a variety of status aliases into 3 buckets
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
            // ISO year+week like 202544 (matches YEARWEEK(...,3))
            $wkIso = (int) $cursor->format('oW');

            // Pretty label for week range (Mon–Sun)
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
                    'backgroundColor' => '#60a5fa', // blue-400
                    'borderWidth' => 0,
                    'barPercentage' => 0.8,
                    'categoryPercentage' => 0.7,
                ],
                [
                    'label' => 'Completed',
                    'data'  => $completed,
                    'stack' => 'trips',
                    'backgroundColor' => '#22c55e', // green-500
                    'borderWidth' => 0,
                    'barPercentage' => 0.8,
                    'categoryPercentage' => 0.7,
                ],
                [
                    'label' => 'Cancelled',
                    'data'  => $cancelled,
                    'stack' => 'trips',
                    'backgroundColor' => '#f97316', // orange-500
                    'borderWidth' => 0,
                    'barPercentage' => 0.8,
                    'categoryPercentage' => 0.7,
                ],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false, // honor getMaxHeight()
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
                // Clear, labeled hover tooltips
                'tooltip' => [
                    'enabled' => true,
                    'mode' => 'index',
                    'intersect' => false,
                    'callbacks' => [
                        // e.g., "Completed: 12 trips"
                        'label' => fn ($ctx) =>
                            ($ctx->dataset->label ?? 'Value') . ': ' . (int) $ctx->raw . ' trips',
                        // Optional: show total on footer
                        'footer' => fn ($ctxs) => 'Total: ' . array_sum(array_map(fn($c) => (int) $c->raw, $ctxs)) . ' trips',
                    ],
                ],
            ],
            'scales' => [
                'x' => [
                    'stacked' => true,
                    'ticks' => ['maxRotation' => 0, 'minRotation' => 0],
                ],
                'y' => [
                    'stacked' => true,
                    'beginAtZero' => true,
                    'ticks' => ['precision' => 0],
                    'title' => ['display' => true, 'text' => 'Trips'],
                ],
            ],
        ];
    }
}
