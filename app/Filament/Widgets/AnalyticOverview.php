<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use App\Models\User;
use App\Models\Developer;
use Carbon\Carbon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticOverview extends BaseWidget
{
    protected ?string $heading = 'Core Business Metrics';
    protected static ?int $sort = 1;

    public function getColumnSpan(): int|string|array
    {
        return 4;
    }

    protected function getStats(): array
    {
        $totalPartners = class_exists(Developer::class) ? Developer::count() : 0;
        $totalSold = Property::where('status', 'Sold')->count();
        $totalBrokers = User::where('role', 'broker')->count();
        $totalAgents = User::where('role', 'agent')->count();

        // NEW: Get conversion rate metrics
        $conversionMetrics = $this->getBasicConversionRate();
        $trend = $this->getMonthlyConversionTrend();

        return [
            Stat::make('Total Developers', number_format($totalPartners))
                ->description($this->getPartnerInterpretation($totalPartners))
                ->descriptionIcon($this->getPartnerIcon($totalPartners))
                ->icon('heroicon-o-building-office')
                ->color('primary'),

            Stat::make('Properties Sold', number_format($totalSold))
                ->description($this->getSoldInterpretation($totalSold, $conversionMetrics))
                ->descriptionIcon($this->getSoldIcon($totalSold))
                ->icon('heroicon-o-receipt-percent')
                ->color('success'),

            // NEW CONVERSION RATE CARD
            Stat::make('Conversion Rate', number_format($conversionMetrics['conversion_rate'], 1) . '%')
                ->description($this->getConversionInterpretation($conversionMetrics, $trend))
                ->descriptionIcon($this->getTrendIcon($trend['trend']))
                ->icon('heroicon-o-arrow-trending-up')
                ->color($this->getConversionColor($conversionMetrics['conversion_rate'])),

            Stat::make('Total Agents', number_format($totalAgents))
                ->description($this->getAgentInterpretation($totalAgents, $totalSold))
                ->descriptionIcon($this->getAgentIcon($totalAgents))
                ->icon('heroicon-o-user-group')
                ->color('warning'),
        ];
    }

    // NEW INTERPRETATION METHODS

    private function getPartnerInterpretation(int $count): string
    {
        if ($count >= 50) return 'Strong partner network with diverse offerings';
        if ($count >= 20) return 'Growing partner ecosystem';
        if ($count >= 10) return 'Building partner relationships';
        return 'Initial partner acquisition phase';
    }

    private function getPartnerIcon(int $count): string
    {
        if ($count >= 20) return 'heroicon-m-building-storefront';
        return 'heroicon-m-building-office';
    }

    private function getSoldInterpretation(int $soldCount, array $conversion): string
    {
        $totalProperties = $conversion['total_properties'];
        $available = $totalProperties - $soldCount;

        if ($soldCount >= 100) return 'Excellent sales volume with market dominance';
        if ($soldCount >= 50) return 'Strong sales performance';
        if ($soldCount >= 20) return 'Steady sales momentum';
        if ($soldCount >= 10) return 'Building sales pipeline';
        return 'Early sales stage - focus on conversions';
    }

    private function getSoldIcon(int $count): string
    {
        if ($count >= 50) return 'heroicon-m-trophy';
        if ($count >= 20) return 'heroicon-m-sparkles';
        return 'heroicon-m-receipt-percent';
    }

    private function getConversionInterpretation(array $conversion, array $trend): string
    {
        $rate = $conversion['conversion_rate'];
        $trendChange = $trend['trend'];

        $performance = match(true) {
            $rate >= 25 => 'Exceptional performance',
            $rate >= 15 => 'Strong conversion rate',
            $rate >= 8 => 'Moderate performance',
            $rate >= 3 => 'Needs improvement',
            default => 'Critical attention needed'
        };

        $trendText = match(true) {
            $trendChange > 2 => ' (improving)',
            $trendChange < -2 => ' (declining)',
            default => ' (stable)'
        };

        return $performance . $trendText;
    }

    private function getAgentInterpretation(int $agentCount, int $soldCount): string
    {
        $efficiency = $agentCount > 0 ? $soldCount / $agentCount : 0;

        if ($agentCount >= 50) return 'Large sales force with extensive coverage';
        if ($agentCount >= 20) return 'Established sales team';
        if ($agentCount >= 10) return 'Growing sales team';
        if ($agentCount >= 5) return 'Core team formation';

        return 'Building sales capacity';
    }

    private function getAgentIcon(int $count): string
    {
        if ($count >= 20) return 'heroicon-m-user-group';
        if ($count >= 10) return 'heroicon-m-users';
        return 'heroicon-m-user';
    }

    // NEW METHODS FOR CONVERSION RATE TRACKING

    private function getBasicConversionRate(): array
    {
        $totalProperties = Property::count();
        $totalSold = Property::where('status', 'Sold')->count();

        $conversionRate = $totalProperties > 0 ?
            ($totalSold / $totalProperties) * 100 : 0;

        return [
            'total_properties' => $totalProperties,
            'sold_properties' => $totalSold,
            'conversion_rate' => $conversionRate
        ];
    }

    private function getMonthlyConversionTrend(): array
    {
        $currentMonth = now()->month;
        $lastMonth = now()->subMonth()->month;

        $currentMonthListings = Property::whereMonth('created_at', $currentMonth)->count();
        $currentMonthSales = Property::where('status', 'Sold')
            ->whereMonth('updated_at', $currentMonth)
            ->count();

        $currentRate = $currentMonthListings > 0 ?
            ($currentMonthSales / $currentMonthListings) * 100 : 0;

        $lastMonthListings = Property::whereMonth('created_at', $lastMonth)->count();
        $lastMonthSales = Property::where('status', 'Sold')
            ->whereMonth('updated_at', $lastMonth)
            ->count();

        $lastMonthRate = $lastMonthListings > 0 ?
            ($lastMonthSales / $lastMonthListings) * 100 : 0;

        return [
            'current_month' => $currentRate,
            'last_month' => $lastMonthRate,
            'trend' => $currentRate - $lastMonthRate
        ];
    }

    private function getConversionColor(float $rate): string
    {
        if ($rate >= 25) return 'success';
        if ($rate >= 15) return 'primary';
        if ($rate >= 8) return 'warning';
        return 'danger';
    }

    private function getTrendIcon(float $trendChange): string
    {
        if ($trendChange > 0) return 'heroicon-m-arrow-trending-up';
        if ($trendChange < 0) return 'heroicon-m-arrow-trending-down';
        return 'heroicon-m-minus';
    }
}
