<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\DealsPerMonth;
use App\Filament\Widgets\InquiriesOverTime;
use App\Filament\Widgets\NewListingsTable;
use App\Filament\Widgets\RecentFeedbackTable;
use App\Filament\Widgets\RecentInquiriesTable;
use App\Filament\Widgets\SmartInsightsFeed;
use App\Filament\Widgets\StatusBreakdownDonut;
use App\Filament\Widgets\SystemAlerts;
use App\Filament\Widgets\TodaysScheduleTable;
use App\Filament\Widgets\TopAreasFromAddress;
use App\Filament\Widgets\TrippingCalendarWeek;
use App\Filament\Widgets\TrippingCompletionRateAgent;
use Filament\Pages\Dashboard as BaseDashboard;

// Header (top band)
use App\Filament\Widgets\StatsOverview;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationLabel = 'Dashboard';
    protected static ?string $navigationIcon  = 'heroicon-o-chart-pie';

    public function getWidgets(): array
    {
        return [
            // --- KPI / summary row ---
            \App\Filament\Widgets\StatsOverview::class,

            // --- Performance charts ---
            \App\Filament\Widgets\InquiriesOverTime::class,
            \App\Filament\Widgets\DealsPerMonth::class,
            \App\Filament\Widgets\TrippingCompletionRateAgent::class,
            \App\Filament\Widgets\PropertiesNewVsPublishedChart::class,
            \App\Filament\Widgets\PropertiesByStatusChart::class,
            \App\Filament\Widgets\NeedsAttention::class,



            // --- Operational widgets ---
            \App\Filament\Widgets\TrippingCalendarWeek::class,
            \App\Filament\Widgets\TodaysScheduleTable::class,
            \App\Filament\Widgets\RecentFeedbackTable::class,


//            // --- Feeds & alerts ---
//            \App\Filament\Widgets\SmartInsightsFeed::class,
//            \App\Filament\Widgets\SystemAlerts::class,
            \App\Filament\Widgets\RecentInquiriesTable::class,
            \App\Filament\Widgets\AgentsLeaderboard::class,
//            \App\Filament\Widgets\TopAgentThisWeek::class,
//            \App\Filament\Widgets\HotLeadSurge::class,
//            \App\Filament\Widgets\CancelledTrippingsAlert::class,
        ];
    }

    public function getColumns(): int|string|array
    {
        // 1 col (mobile), 2 cols (md), 6 cols (xl)
        return [
            'default' => 1,
            'md'      => 2,
            'xl'      => 6,
        ];
    }

}
