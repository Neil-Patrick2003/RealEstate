<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

// Header (top band)
use App\Filament\Widgets\StatsOverview;
//use App\Filament\Widgets\NewListingsSurge;           // if you added earlier; else comment out
use App\Filament\Widgets\CancelledTrippingsAlert;

// Main grid widgets
use App\Filament\Widgets\FastestImprovingResponseTime;
use App\Filament\Widgets\PropertiesByStatusChart;
use App\Filament\Widgets\HotLeadSurge;
use App\Filament\Widgets\DealsPerMonthChart;
use App\Filament\Widgets\TrippingCompletionRateChart;
use App\Filament\Widgets\TopAgentThisWeek;           // or TopAgentLast30Days if you renamed
use App\Filament\Widgets\InquiriesOverTimeChart;
use App\Filament\Widgets\PropertiesNewVsPublishedChart;
use App\Filament\Widgets\NeedsAttention;
use App\Filament\Widgets\AgentsLeaderboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationLabel = 'Dashboard';
    protected static ?string $navigationIcon  = 'heroicon-o-chart-pie';

    /**
     * HEADER WIDGETS (top band)
     * Keep this lightweight: KPIs + quick alerts/feed.
     */
    protected function getHeaderWidgets(): array
    {
        return [
            StatsOverview::class,           // 1 row × 5 cards (your widget enforces 5 cols)
        ];
    }

    /**
     * HEADER GRID: 1 col on mobile, 2 on md+, so KPIs on first row, alerts on second row if needed.
     */
        public function getHeaderWidgetsColumns(): int|array
    {
        return [
            'default' => 1,
            'md'      => 2,
            'xl'      => 2,
        ];
    }

    /**
     * MAIN GRID WIDGETS (charts, lists, tables)
     */
    public function getWidgets(): array
    {
        return [
            
        ];
    }

    /**
     * MAIN GRID: 1 col mobile, 2 cols md, 3 cols xl.
     */
    public function getColumns(): int|string|array
    {
        return [
            'default' => 1,
            'md'      => 2,
            'xl'      => 3,
        ];
    }
}
