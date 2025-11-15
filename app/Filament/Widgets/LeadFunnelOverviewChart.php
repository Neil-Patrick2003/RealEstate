<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class LeadFunnelOverviewChart extends ChartWidget
{
    protected static ?string $heading = 'Lead Funnel Overview';
    protected static ?int $sort = -57;

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        $stages = [];

        /** 🟢 1. Inquiries */
        $stages['Inquiries'] = Schema::hasTable('inquiries')
            ? (int) DB::table('inquiries')->whereBetween('created_at', [$from, $to])->count()
            : 0;

        /** 🟡 2. Trippings (Viewings) */
        $stages['Trippings'] = Schema::hasTable('property_trippings')
            ? (int) DB::table('property_trippings')->whereBetween('created_at', [$from, $to])->count()
            : 0;

        /** 🟠 3. Offers (if “deals” doubles as offers table, reuse count) */
        $stages['Offers'] = Schema::hasTable('deals')
            ? (int) DB::table('deals')->whereBetween('created_at', [$from, $to])->count()
            : 0;

        /** 🔵 4. Deals (Closed only) */
        $stages['Deals'] = 0;
        if (Schema::hasTable('deals')) {
            $dealQuery = DB::table('deals')
                ->whereBetween('created_at', [$from, $to]);

            // Check if the column “status” exists and filter properly
            if (Schema::hasColumn('deals', 'status')) {
                $dealQuery->where('status', '=', 'Sold');
            }

            $stages['Deals'] = (int) $dealQuery->count();
        }

        return [
            'labels' => array_keys($stages),
            'datasets' => [[
                'label' => 'Leads Funnel',
                'data' => array_values($stages),
                'backgroundColor' => [
                    '#60a5fa', // Inquiries - blue
                    '#34d399', // Trippings - green
                    '#fbbf24', // Offers - yellow
                    '#6366f1', // Deals - indigo
                ],
                'borderRadius' => 8,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => [
                    'callbacks' => [
                        'label' => fn ($ctx) => $ctx->parsed['y'] . ' leads',
                    ],
                ],
            ],
            'scales' => [
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
            'responsive' => true,
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
