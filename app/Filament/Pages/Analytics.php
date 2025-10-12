<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\AgentPerformance;
use App\Filament\Widgets\AgentsLeaderboard;
use App\Filament\Widgets\MostViewedBarWithImages;
use App\Filament\Widgets\MostViewedProperty;
use App\Filament\Widgets\PropertiesByStatusChart;
use App\Filament\Widgets\PropertyPerformanceChart;
use App\Filament\Widgets\TopAgents;
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
            \App\Filament\Widgets\AnalyticOverview::class,
            MostViewedProperty::class,
//            MostViewedBarWithImages::class,
            PropertyPerformanceChart::class,
            PropertiesByStatusChart::class,
            AgentsLeaderboard::class,
            AgentPerformance::class
        ];
    }

    // Or below the page content:
    // protected function getFooterWidgets(): array
    // {
    //     return [ \App\Filament\Widgets\AnalyticOverview::class ];
    // }

    // Optional: columns for header/footer widgets
    public function getHeaderWidgetsColumns(): int|array
    {
        return [
            'default' => 1,
            'xl' => 2,
        ];
    }
}
