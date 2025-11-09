<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\AgentPerformance;
use App\Filament\Widgets\AgentsLeaderboard;
use App\Filament\Widgets\AvgFeedbackPerAgentChart;
use App\Filament\Widgets\AvgLeadToDealTimeChart;
use App\Filament\Widgets\DailyInquiriesChart;
use App\Filament\Widgets\DataExportTools;
use App\Filament\Widgets\HotLeadsTable;
use App\Filament\Widgets\LeadFunnelOverviewChart;
use App\Filament\Widgets\LeadToDealRatioPerAgentChart;
use App\Filament\Widgets\MostInquiredPropertiesChart;
use App\Filament\Widgets\MostViewedBarWithImages;
use App\Filament\Widgets\MostViewedProperty;
use App\Filament\Widgets\PropertiesByStatusChart;
use App\Filament\Widgets\PropertyConversionTable;
use App\Filament\Widgets\PropertyPerformanceChart;
use App\Filament\Widgets\PropertyPerformanceTimeline;
use App\Filament\Widgets\ResponseTimeDistributionChart;
use App\Filament\Widgets\TopAgents;
use App\Filament\Widgets\TopAgentsDealsChart;
use App\Filament\Widgets\TrippingCancellationReasonsChart;
use App\Filament\Widgets\TrippingHeatmap;
use App\Filament\Widgets\TrippingsScheduledCompletedChart;
use App\Filament\Widgets\UnattendedLeadsTable;
use Filament\Pages\Page;

class Analytics extends Page
{
    protected static string $view = 'filament.pages.analytics';
    protected static ?string $navigationLabel = 'Analytics';
    protected static ?string $navigationIcon  = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?int $navigationSort     = 10;

    // Put widgets above the page content
    protected function getHeaderWidgets(): array
    {
        return [
            // ── 1) OVERVIEW / KPIs ────────────────────────────────────────────
            \App\Filament\Widgets\AnalyticOverview::class,        // KPI cards row
            \App\Filament\Widgets\PropertiesByStatusChart::class, // Donut breakdown
            \App\Filament\Widgets\MostViewedProperty::class,      // Hero/highlight

            // ── 2) LEAD ANALYTICS ────────────────────────────────────────────
            \App\Filament\Widgets\DailyInquiriesChart::class,     // 30d trend
            \App\Filament\Widgets\LeadFunnelOverviewChart::class, // Inq → Deal funnel
            \App\Filament\Widgets\HotLeadsTable::class,           // 🔥 ≥3 in 30d
            \App\Filament\Widgets\UnattendedLeadsTable::class,    // ⚠️ no reply >3d

            // ── 3) TRIPPING ANALYTICS ────────────────────────────────────────
            \App\Filament\Widgets\TrippingsScheduledCompletedChart::class, // stacked weekly
            \App\Filament\Widgets\TrippingCancellationReasonsChart::class, // pie (30d)
            // \App\Filament\Widgets\TrippingHeatmap::class,        // enable after polygons/coords ready

            // ── 4) PROPERTY ANALYTICS ────────────────────────────────────────
            \App\Filament\Widgets\MostInquiredPropertiesChart::class, // Top 10
            \App\Filament\Widgets\PropertyConversionTable::class,     // Deals/Inq %
            \App\Filament\Widgets\PropertyPerformanceTimeline::class, // 30d views vs inquiries
            \App\Filament\Widgets\PropertyPerformanceChart::class,    // Comparison chart

            // ── 5) AGENT ANALYTICS ───────────────────────────────────────────
            \App\Filament\Widgets\TopAgentsDealsChart::class,         // Deals per agent (bar)
            \App\Filament\Widgets\LeadToDealRatioPerAgentChart::class,// Conversion per agent
            \App\Filament\Widgets\AvgFeedbackPerAgentChart::class,    // ⭐ averages
            \App\Filament\Widgets\AgentsLeaderboard::class,           // leaderboard card(s)
            \App\Filament\Widgets\AgentPerformance::class,            // detailed (table/metrics)

            // ── 6) OPERATIONS / SLA ─────────────────────────────────────────
            \App\Filament\Widgets\ResponseTimeDistributionChart::class, // response-time histogram
            \App\Filament\Widgets\AvgLeadToDealTimeChart::class,        // doughnut “gauge”
        ];
    }

    /**
     * Responsive grid: 1 / 2 / 3 / 4 columns.
     * (Large charts already set their own getColumnSpan; this grid gives them room.)
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
