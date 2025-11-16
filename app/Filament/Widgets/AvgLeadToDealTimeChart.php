<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class AvgLeadToDealTimeChart extends ChartWidget
{
    protected static ?string $heading = '⏱️ Avg Lead → Deal Time (90 Days)';
    protected static ?int $sort = -28;
    protected static ?string $pollingInterval = '120s';
    protected static ?string $maxHeight = '350px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    public function getHeight(): string
    {
        return '350px';
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 1, 'xl' => 2, '2xl' => 2];
    }

    protected float $avgDays = 0;

    protected function getData(): array
    {
        if (!Schema::hasTable('deals')) {
            return $this->getEmptyData();
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

        // Green theme colors
        $valueColor = match(true) {
            $ratio <= 0.5 => '#10B981',  // emerald-500 - excellent
            $ratio <= 0.7 => '#059669',  // emerald-600 - good
            $ratio <= 0.9 => '#F59E0B',  // amber-500 - warning
            default => '#DC2626'         // red-600 - critical
        };

        return [
            'labels'   => ['Current Avg', 'Remaining to Target'],
            'datasets' => [[
                'data'            => [$val, $rem],
                'backgroundColor' => [$valueColor, '#E5E7EB'],
                'borderWidth'     => 0,
                'borderRadius'    => 8,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => true,
            'cutout' => '75%',
            'rotation' => -90 * (M_PI / 180),
            'circumference' => 180 * (M_PI / 180),
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                // Using default tooltip - no custom configuration
            ],
            'layout' => [
                'padding' => [
                    'top' => 40,
                    'right' => 20,
                    'bottom' => 60,
                    'left' => 20,
                ],
            ],
        ];
    }

    /** ========== CHART DESCRIPTION ========== */
    public function getDescription(): ?string
    {
        if (!Schema::hasTable('deals')) {
            return 'No lead-to-deal data available';
        }

        $targetDays = (int) config('metrics.avg_lead_to_deal_target_days', 30);
        $performance = $this->getPerformanceLevel();

        if ($this->avgDays === 0) {
            return 'No completed deals in the last 90 days';
        }

        $daysFromTarget = $this->avgDays - $targetDays;
        $comparison = $daysFromTarget > 0 ?
            "{$daysFromTarget} days above target" :
            abs($daysFromTarget) . " days below target";

        return "{$performance} • Target: {$targetDays} days • {$comparison}";
    }

    private function getPerformanceLevel(): string
    {
        $targetDays = (int) config('metrics.avg_lead_to_deal_target_days', 30);
        $ratio = $targetDays > 0 ? $this->avgDays / $targetDays : 0;

        return match(true) {
            $ratio <= 0.5 => '🚀 Excellent',
            $ratio <= 0.7 => '✅ Good',
            $ratio <= 0.9 => '⚠️  Needs Improvement',
            default => '❌ Critical Attention Needed'
        };
    }

    private function getEmptyData(): array
    {
        return [
            'labels'   => ['Current Avg', 'Remaining to Target'],
            'datasets' => [[
                'data'            => [0, 30],
                'backgroundColor' => ['#9CA3AF', '#E5E7EB'],
                'borderWidth'     => 0,
                'borderRadius'    => 8,
            ]],
        ];
    }
}
