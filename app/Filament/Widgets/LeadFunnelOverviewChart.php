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

        /** 🟠 3. Offers (if "deals" doubles as offers table, reuse count) */
        $stages['Offers'] = Schema::hasTable('deals')
            ? (int) DB::table('deals')->whereBetween('created_at', [$from, $to])->count()
            : 0;

        /** 🔵 4. Deals (Closed only) */
        $stages['Deals'] = 0;
        if (Schema::hasTable('deals')) {
            $dealQuery = DB::table('deals')
                ->whereBetween('created_at', [$from, $to]);

            // Check if the column "status" exists and filter properly
            if (Schema::hasColumn('deals', 'status')) {
                $dealQuery->where('status', '=', 'Sold');
            }

            $stages['Deals'] = (int) $dealQuery->count();
        }

        return [
            'labels' => array_keys($stages),
            'datasets' => [[
                'label' => 'Leads',
                'data' => array_values($stages),
                'backgroundColor' => [
                    '#10B981', // Inquiries - emerald-500
                    '#059669', // Trippings - emerald-600
                    '#047857', // Offers - emerald-700
                    '#065F46', // Deals - emerald-800
                ],
                'borderColor' => [
                    '#10B981',
                    '#059669',
                    '#047857',
                    '#065F46',
                ],
                'borderWidth' => 2,
                'borderRadius' => 8,
                'barPercentage' => 0.6,
                'categoryPercentage' => 0.8,
            ]],
        ];
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
                // Using default tooltip - no custom configuration
            ],
            'scales' => [
                'x' => [
                    'grid' => [
                        'display' => false,
                    ],
                    'ticks' => [
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                            'weight' => '600',
                        ],
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
                ],
            ],
            'elements' => [
                'bar' => [
                    'borderRadius' => 8,
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
        $stages = $data['datasets'][0]['data'] ?? [];

        if (empty($stages) || array_sum($stages) === 0) {
            return 'No lead data available for the last 30 days';
        }

        $inquiries = $stages[0] ?? 0;
        $deals = $stages[3] ?? 0;
        $overallConversion = $inquiries > 0 ? round(($deals / $inquiries) * 100, 1) : 0;

        // Calculate stage-to-stage conversion rates
        $trippingRate = $inquiries > 0 ? round(($stages[1] / $inquiries) * 100, 1) : 0;
        $offerRate = $stages[1] > 0 ? round(($stages[2] / $stages[1]) * 100, 1) : 0;
        $closingRate = $stages[2] > 0 ? round(($stages[3] / $stages[2]) * 100, 1) : 0;

        return "Overall: {$overallConversion}% • Inquiry→Trip: {$trippingRate}% • Trip→Offer: {$offerRate}% • Offer→Deal: {$closingRate}%";
    }

    /** ========== EMPTY STATE ========== */
    protected function getEmptyData(): array
    {
        return [
            'labels' => ['Inquiries', 'Trippings', 'Offers', 'Deals'],
            'datasets' => [[
                'data' => [0, 0, 0, 0],
                'backgroundColor' => [
                    'rgba(16, 185, 129, 0.3)',
                    'rgba(5, 150, 105, 0.3)',
                    'rgba(4, 120, 87, 0.3)',
                    'rgba(6, 95, 70, 0.3)',
                ],
                'borderColor' => [
                    '#10B981',
                    '#059669',
                    '#047857',
                    '#065F46',
                ],
                'borderWidth' => 2,
                'borderRadius' => 8,
            ]],
        ];
    }
}
