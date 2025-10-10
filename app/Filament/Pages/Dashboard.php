<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationLabel = 'Dashboard';
    protected static ?string $navigationIcon  = 'heroicon-o-chart-pie';

    /**
     * Only the widgets you list here will render.
     * This completely removes the default Filament info/docs/GitHub widgets.
     */
    public function getWidgets(): array
    {
        return [
            \App\Filament\Widgets\StatsOverview::class,
            \App\Filament\Widgets\PropertiesByStatusChart::class,
            \App\Filament\Widgets\PropertiesNewVsPublishedChart::class,
            \App\Filament\Widgets\NeedsAttention::class,
            \App\Filament\Widgets\AgentsLeaderboard::class,
        ];
    }

    /**
     * Control the responsive grid of the main area.
     * Example: 1 col on mobile, 2 on md, 3 on xl.
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
