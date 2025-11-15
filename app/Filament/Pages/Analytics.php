<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\PropertyTrendsWidget;
use Filament\Pages\Page;

class Analytics extends Page
{
    protected static ?string $navigationLabel = 'Analytics';
    protected static ?string $navigationIcon  = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?int    $navigationSort  = 10;

    // Use our Blade view
    protected static string $view = 'filament.pages.analytics';

    /**
     * Place all analytics widgets above the page content.
     * Each widget can define its own column span; this grid gives them room.
     */
    protected function getHeaderWidgets(): array
    {
        return [
            // ── 1) OVERVIEW / KPIs ────────────────────────────────────────────
            \App\Filament\Widgets\AnalyticOverview::class,
//            \App\Filament\Widgets\PropertiesByStatusChart::class,
            \App\Filament\Widgets\MostViewedProperty::class,

            // ── 2) LEAD ANALYTICS ────────────────────────────────────────────
            \App\Filament\Widgets\DailyInquiriesChart::class,
            \App\Filament\Widgets\LeadFunnelOverviewChart::class,
//            \App\Filament\Widgets\HotLeadsTable::class,
            \App\Filament\Widgets\UnattendedLeadsTable::class,

            // ── 3) TRIPPING ANALYTICS ────────────────────────────────────────
            \App\Filament\Widgets\TrippingsScheduledCompletedChart::class,
            \App\Filament\Widgets\TrippingCancellationReasonsChart::class,
            // \App\Filament\Widgets\TrippingHeatmap::class, // enable when ready

            // ── 4) PROPERTY ANALYTICS ────────────────────────────────────────
            \App\Filament\Widgets\MostInquiredPropertiesChart::class,
            \App\Filament\Widgets\PropertyConversionTable::class,
            \App\Filament\Widgets\PropertyPerformanceTimeline::class,
            \App\Filament\Widgets\PropertyPerformanceChart::class,

            // ── 5) AGENT ANALYTICS ───────────────────────────────────────────
            \App\Filament\Widgets\TopAgentsDealsChart::class,
            \App\Filament\Widgets\LeadToDealRatioPerAgentChart::class,
//            \App\Filament\Widgets\AvgFeedbackPerAgentChart::class,
            \App\Filament\Widgets\AgentsLeaderboard::class,
            \App\Filament\Widgets\AgentPerformance::class,

            // ── 6) OPERATIONS / SLA ─────────────────────────────────────────
            \App\Filament\Widgets\ResponseTimeDistributionChart::class,
            \App\Filament\Widgets\AvgLeadToDealTimeChart::class,
            PropertyTrendsWidget::class
        ];
    }

    /**
     * Responsive grid: 1 / 2 / 3 / 4 columns.
     */
    public function getHeaderWidgetsColumns(): int|array
    {
        return [
            'default' => 1,
            'md'      => 2,
            'xl'      => 3,
            '2xl'     => 4,
        ];
    }
}
