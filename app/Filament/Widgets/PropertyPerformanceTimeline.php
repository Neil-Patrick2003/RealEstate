<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class PropertyPerformanceTimeline extends ChartWidget
{
    protected static ?string $heading = 'Property Performance Timeline';
    protected static ?int $sort = -37;

    /** Selected property id (managed by ChartWidget filters) */
    public ?string $filter = null;

    protected function getType(): string
    {
        return 'line';
    }

    /** Populate the filter dropdown (id => title) */
    protected function getFilters(): array
    {
        // Limit for performance; adjust as needed
        $opts = DB::table('properties')->orderBy('title')->limit(200)->pluck('title', 'id')->toArray();

        // If you want a default, ChartWidget will pick the first automatically
        return $opts ?: ['0' => 'No properties'];
    }

    protected function getData(): array
    {
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        // Resolve property id (if none selected, take first from filters)
        $pid = (int) ($this->filter ?? array_key_first($this->getFilters()) ?? 0);

        // Build aligned 30-day labels
        $labels = [];
        $cursor = $from;
        while ($cursor->lte($to)) {
            $labels[] = $cursor->format('M j');
            $cursor = $cursor->addDay();
        }

        // Views per day (optional if you have property_views_daily)
        $viewsDaily = [];
        if (Schema::hasTable('property_views_daily')) {
            $views = DB::table('property_views_daily')
                ->selectRaw('view_date as d, SUM(views) as v')
                ->where('property_id', $pid)
                ->whereBetween('view_date', [$from->toDateString(), $to->toDateString()])
                ->groupBy('d')
                ->pluck('v', 'd');

            $cursor = $from;
            while ($cursor->lte($to)) {
                $k = $cursor->toDateString();
                $viewsDaily[] = (int) ($views[$k] ?? 0);
                $cursor = $cursor->addDay();
            }
        }

        // Inquiries per day (prefers listing→property, falls back to inquiries.property_id)
        if (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'property_listing_id')) {
            $inq = DB::table('inquiries as iq')
                ->join('property_listings as pl', 'pl.id', '=', 'iq.property_listing_id')
                ->where('pl.property_id', $pid)
                ->whereBetween('iq.created_at', [$from, $to])
                ->selectRaw('DATE(iq.created_at) as d, COUNT(*) as c')
                ->groupBy('d')
                ->pluck('c', 'd');
        } elseif (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'property_id')) {
            $inq = DB::table('inquiries as iq')
                ->where('iq.property_id', $pid)
                ->whereBetween('iq.created_at', [$from, $to])
                ->selectRaw('DATE(iq.created_at) as d, COUNT(*) as c')
                ->groupBy('d')
                ->pluck('c', 'd');
        } else {
            $inq = collect();
        }

        $inqDaily = [];
        $cursor = $from;
        while ($cursor->lte($to)) {
            $k = $cursor->toDateString();
            $inqDaily[] = (int) ($inq[$k] ?? 0);
            $cursor = $cursor->addDay();
        }

        // Build datasets (omit Views if that table doesn't exist)
        $datasets = [
            ['label' => 'Inquiries', 'data' => $inqDaily, 'tension' => 0.3],
        ];
        if (!empty($viewsDaily)) {
            array_unshift($datasets, ['label' => 'Views', 'data' => $viewsDaily, 'tension' => 0.3]);
        }

        return ['labels' => $labels, 'datasets' => $datasets];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'plugins' => [
                'legend' => ['position' => 'bottom'],
                'tooltip' => ['mode' => 'index', 'intersect' => false],
            ],
            'interaction' => ['mode' => 'index', 'intersect' => false],
            'scales' => [
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
