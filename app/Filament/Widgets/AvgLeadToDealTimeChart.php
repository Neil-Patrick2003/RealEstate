<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class AvgLeadToDealTimeChart extends ChartWidget
{
    protected static ?string $heading = 'Avg Lead → Deal Time (90d)';
    protected static ?int $sort = -28;

    protected function getType(): string
    {
        return 'doughnut'; // still a doughnut, styled as a gauge
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 1, 'xl' => 2];
    }

    protected float $avgDays = 0;

    protected function getData(): array
    {
        if (!Schema::hasTable('deals')) {
            return [
                'labels'   => ['Avg Days', 'Remaining to Target'],
                'datasets' => [[ 'data' => [0, 1] ]],
            ];
        }

        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(89)->startOfDay();

        // --- Retrieve inquiry→deal pairs ---
        $inqDates = collect();

        if (Schema::hasTable('inquiries')) {
            if (Schema::hasColumn('inquiries', 'property_listing_id')) {
                $inqDates = DB::table('deals as d')
                    ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
                    ->join('inquiries as iq', 'iq.property_listing_id', '=', 'pl.id')
                    ->whereBetween('d.created_at', [$from, $to])
                    ->selectRaw('d.id as deal_id, MIN(iq.created_at) as first_inquiry_at, d.created_at as deal_at')
                    ->groupBy('d.id')
                    ->get();
            } elseif (Schema::hasColumn('inquiries', 'property_id')) {
                $inqDates = DB::table('deals as d')
                    ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
                    ->join('inquiries as iq', 'iq.property_id', '=', 'pl.property_id')
                    ->whereBetween('d.created_at', [$from, $to])
                    ->selectRaw('d.id as deal_id, MIN(iq.created_at) as first_inquiry_at, d.created_at as deal_at')
                    ->groupBy('d.id')
                    ->get();
            }
        }

        // --- Compute average difference ---
        $diffDays = [];
        foreach ($inqDates as $row) {
            if ($row->first_inquiry_at && $row->deal_at) {
                $diffDays[] = CarbonImmutable::parse($row->first_inquiry_at, $tz)
                    ->diffInDays(CarbonImmutable::parse($row->deal_at, $tz));
            }
        }

        $this->avgDays = empty($diffDays)
            ? 0
            : round(array_sum($diffDays) / count($diffDays), 1);

        // --- Gauge logic ---
        $targetDays = (int) config('metrics.avg_lead_to_deal_target_days', 30);
        $val = min($this->avgDays, $targetDays);
        $rem = max($targetDays - $val, 0);

        $ratio = $targetDays > 0 ? $this->avgDays / $targetDays : 0;
        $valueColor =
            $ratio <= 0.7 ? '#16a34a' :        // green
                ($ratio <= 1.0 ? '#f59e0b' : '#dc2626'); // orange/red

        return [
            'labels'   => ['Avg Days', 'Remaining to Target'],
            'datasets' => [[
                'data'            => [$val, $rem],
                'backgroundColor' => [$valueColor, '#e5e7eb'],
                'borderWidth'     => 0,
                'borderRadius'    => [8, 0],
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'cutout' => '70%',
            'rotation' => -90 * (M_PI / 180),     // start left
            'circumference' => 180 * (M_PI / 180), // 180° arc
            'plugins' => [
                // --- Hide legend ---
                'legend' => ['display' => false],

                // --- Tooltip with labels ---
                'tooltip' => [
                    'enabled' => true,
                    'callbacks' => [
                        // Show "Avg Days: 12 days"
                        'label' => fn($ctx) => match ($ctx->dataIndex) {
                            0 => 'Avg Days: ' . $ctx->parsed . ' days',
                            default => 'Remaining: ' . $ctx->parsed . ' days',
                        },
                    ],
                ],

                // --- Title in the center of gauge ---
                'title' => [
                    'display' => true,
                    'text' => sprintf('%.1f days', $this->avgDays),
                    'align' => 'center',
                    'position' => 'bottom',
                    'font' => [
                        'size' => 16,
                        'weight' => 'bold',
                    ],
                    'color' => '#374151',
                    'padding' => ['top' => 6],
                ],
            ],
            'layout' => [
                'padding' => ['top' => 8, 'bottom' => 0],
            ],
        ];
    }
}

