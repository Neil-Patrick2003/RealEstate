<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticOverview extends BaseWidget
{
    // ✅ Must be NON-static for StatsOverviewWidget
    protected ?string $heading = 'Analytics Overview';

    // Sort is static (comes from base Widget)
    protected static ?int $sort = 1;

    // Match Filament’s type exactly (array|string|int), non-static
    public function getColumnSpan(): int|string|array
    {
        return ['default'=>1,'md'=>2,'xl'=>4,'2xl'=>4];
    }

    protected function getStats(): array
    {
        // Total Partners (guard in case you don't have a Partner model)
        $totalPartners = class_exists(\App\Models\Developer::class)
            ? \App\Models\Developer::count()
            : 0;

        // Sold properties
        $totalSold = Property::where('status', 'Sold')->count();

        // Active users (last 30 days)
        $activeUsers = User::whereNotNull('last_login')
            ->where('last_login', '>=', now()->subDays(30))
            ->count();

        // Total agents
        $totalAgents = User::where('role', 'agent')->count();

        return [
            Stat::make('Total Partners', number_format($totalPartners))
                ->description('Registered partners')
                ->icon('heroicon-o-briefcase')     // ✅ common heroicon
                ->color('info'),

            Stat::make('Sold Properties', number_format($totalSold))
                ->description('Marked as Sold')
                ->icon('heroicon-o-home-modern')   // ✅ common heroicon
                ->color('success'),

            Stat::make('Active Users', number_format($activeUsers))
                ->description('Logged in ≤ 30 days')
                ->icon('heroicon-o-users')         // ✅ common heroicon
                ->color('primary'),

            Stat::make('Total Agents', number_format($totalAgents))
                ->description('Registered agents')
                ->icon('heroicon-o-user-group')    // ✅ common heroicon
                ->color('warning'),
        ];
    }
}
