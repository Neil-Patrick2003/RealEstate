<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticOverview extends BaseWidget
{
    protected ?string $heading = 'Core Business Metrics';

    protected static ?int $sort = 1;

    // Adjusted column span for modern wide dashboards (e.g., 4 columns on large screens)
    public function getColumnSpan(): int|string|array
    {
        return 4; // Use full width, Filament will split into 4 columns automatically
    }

    protected function getStats(): array
    {
        $totalPartners = class_exists(\App\Models\Developer::class)
            ? \App\Models\Developer::count()
            : 0;

        // Sold properties
        $totalSold = Property::where('status', 'Sold')->count();

        //Total Brokers
        $totalBrokers = User::where('role', 'broker')->count();

        // Total agents
        $totalAgents = User::where('role', 'agent')->count();

        return [
            Stat::make('Total Developers', number_format($totalPartners))
                ->description('Registered project partners')
                ->icon('heroicon-o-building-office')     // Use a relevant icon
                ->color('primary'), // Use primary for contrast

            Stat::make('Properties Sold', number_format($totalSold))
                ->description('Total closed deals')
                ->icon('heroicon-o-receipt-percent')   // Icon emphasizing a completed transaction
                ->color('success'), // Primary theme color

            Stat::make('Total Brokers', number_format($totalBrokers))
                ->description('Registered brokerage users')
                ->icon('heroicon-o-users')         // General user group icon
                ->color('info'), // Use info for a neutral color

            Stat::make('Total Agents', number_format($totalAgents))
                ->description('Field sales representatives')
                ->icon('heroicon-o-user-group')    // Consistent user group icon
                ->color('warning'), // Use warning for distinct visibility
        ];
    }
}
