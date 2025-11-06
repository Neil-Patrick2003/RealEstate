<?php

namespace App\Filament\Widgets;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Card;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

// Models — adjust namespaces if yours differ
use App\Models\Property;
use App\Models\PropertyTripping;
use App\Models\Inquiry;
use App\Models\Deal;
use App\Models\Feedback; // <-- if your feedback model is named differently, change this

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = -100;
    protected static ?string $pollingInterval = '30s';

    /** Layout: 4 columns (2 rows × 4 on desktop) */
    protected function getColumns(): int
    {
        return 4;
    }

    /** Make the band full width */
    public function getColumnSpan(): int|string|array
    {
        return [
            'default' => 1,  // full-width on mobile (cards wrap)
            'md'      => 2,  // 2-per-row on tablets
            'xl'      => 6,  // stretch across; the widget itself renders 1 row 5 cols
        ];
    }

    protected function getCards(): array
    {
        // Cache everything briefly to keep the dashboard snappy
        return Cache::remember('dash.kpi.overview.v1', 60, function () {
            $tz = 'Asia/Manila';
            $now = CarbonImmutable::now($tz);

            // Windows
            $last30Start   = $now->subDays(30)->startOfDay();
            $prev30Start   = $now->subDays(60)->startOfDay();
            $prev30End     = $last30Start->subSecond();
            $mtdStart      = $now->startOfMonth();
            $prevMonthEnd  = $mtdStart->subSecond();
            $prevMonthStart= $mtdStart->subMonth()->startOfMonth();
            $next7Start    = $now->startOfDay();
            $next7End      = $now->addDays(7)->endOfDay();

            // ===== Raw counts / sums =====
            $totalProps     = Property::count();
            // Adjust "active" to match your enum/status (e.g., 'Published' or 'Active')
            $activeProps    = Property::where('status', 'Published')->count();

            $inq30          = Inquiry::whereBetween('created_at', [$last30Start, $now->endOfDay()])->count();
            $inqPrev30      = Inquiry::whereBetween('created_at', [$prev30Start, $prev30End])->count();

            // Prefer scheduled_at; fallback to created_at if you don't have it
            $tripsNext7     = PropertyTripping::when(
                Schema()->hasColumn((new PropertyTripping)->getTable(), 'scheduled_at'),
                fn($q) => $q->whereBetween('scheduled_at', [$next7Start, $next7End]),
                fn($q) => $q->whereBetween('created_at',   [$next7Start, $next7End])
            )->count();

            // Deals closed MTD (use closed_at if available)
            $dealDateCol    = Schema()->hasColumn((new Deal)->getTable(), 'closed_at') ? 'closed_at' : 'created_at';
            $dealsMTD       = Deal::whereBetween($dealDateCol, [$mtdStart, $now->endOfDay()])
                ->when(Schema()->hasColumn((new Deal)->getTable(), 'status'),
                    fn($q) => $q->where('status', 'closed'))
                ->count();
            $dealsPrevMonth = Deal::whereBetween($dealDateCol, [$prevMonthStart, $prevMonthEnd])
                ->when(Schema()->hasColumn((new Deal)->getTable(), 'status'),
                    fn($q) => $q->where('status', 'closed'))
                ->count();

            // Average feedback (⭐)
            // Average feedback (⭐) over last 30 days vs prior 30 days
            $avgFeedbackCurrent = (float) (DB::table('feedbacks')
                ->whereBetween('created_at', [$last30Start, $now->endOfDay()])
                ->selectRaw('AVG((communication + negotiation + professionalism + knowledge) / 4) AS avg_rating')
                ->value('avg_rating') ?? 0.0);

            $avgFeedbackPrev = (float) (DB::table('feedbacks')
                ->whereBetween('created_at', [$prev30Start, $prev30End])
                ->selectRaw('AVG((communication + negotiation + professionalism + knowledge) / 4) AS avg_rating')
                ->value('avg_rating') ?? 0.0);

// Absolute delta (not %)
            $deltaFb = round($avgFeedbackCurrent - $avgFeedbackPrev, 2);


            // Revenue (MTD) — assumes 'amount' column (decimal) on deals
            $revMTD       = (float) Deal::whereBetween($dealDateCol, [$mtdStart, $now->endOfDay()])
                ->sum('amount');
            $revPrevMonth = (float) Deal::whereBetween($dealDateCol, [$prevMonthStart, $prevMonthEnd])
                ->sum('amount');

            // Lead → Deal Rate (conversion) over last 30 days
            $deals30      = Deal::whereBetween($dealDateCol, [$last30Start, $now->endOfDay()])->count();
            $rate         = ($inq30 > 0) ? round($deals30 / max(1, $inq30) * 100, 1) : 0.0;

            // ===== Deltas / Trends =====
            $deltaInq30   = $this->pctDelta($inq30, $inqPrev30);
            $deltaDealsM  = $this->pctDelta($dealsMTD, $dealsPrevMonth);
            $deltaRevM    = $this->pctDelta($revMTD, $revPrevMonth);
            $deltaFb      = $this->diff($avgFeedbackCurrent, $avgFeedbackPrev); // absolute difference, not %

            // Formatters
            $peso = static fn(float $n) => '₱' . number_format($n, 2);
            $num  = static fn(int|float $n) => number_format((float) $n);

            // ===== Cards =====
            return [
                // 1) Total Properties
                Card::make('Total Properties', $num($totalProps))
                    ->description('All listings')
                    ->icon('heroicon-o-home')
                    ->color('primary'),

                // 2) Active Properties
                Card::make('Active Properties', $num($activeProps))
                    ->description('Live / published')
                    ->icon('heroicon-o-globe-alt')
                    ->color('success'),

                // 3) Total Inquiries (30d) + trend
                Card::make('Total Inquiries (30d)', $num($inq30))
                    ->description($this->trendText($deltaInq30) . ' vs prior 30d')
                    ->descriptionIcon($deltaInq30 >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($deltaInq30 >= 0 ? 'success' : 'danger')
                    ->icon('heroicon-o-inbox-arrow-down'),

                // 4) Scheduled Trippings (Next 7 Days)
                Card::make('Scheduled Trippings (Next 7d)', $num($tripsNext7))
                    ->description('Upcoming viewings')
                    ->icon('heroicon-o-calendar-days')
                    ->color('info'),

                // 5) Deals Closed (MTD) + trend vs previous month
                Card::make('Deals Closed (MTD)', $num($dealsMTD))
                    ->description($this->trendText($deltaDealsM) . ' vs last month')
                    ->descriptionIcon($deltaDealsM >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($deltaDealsM >= 0 ? 'success' : 'danger')
                    ->icon('heroicon-o-briefcase'),

                // 6) Average Feedback (⭐)
                Card::make('Average Feedback (30d)', $avgFeedbackCurrent > 0 ? number_format($avgFeedbackCurrent, 2) . ' ⭐' : '—')
                    ->description(($deltaFb >= 0 ? '+' : '−') . number_format(abs($deltaFb), 2) . ' vs prior 30d')
                    ->icon('heroicon-o-star')
                    ->color($avgFeedbackCurrent >= $avgFeedbackPrev ? 'success' : 'danger'),


                // 7) Revenue (MTD) + trend
                Card::make('Revenue (MTD)', $peso($revMTD))
                    ->description($this->trendText($deltaRevM) . ' vs last month')
                    ->descriptionIcon($deltaRevM >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($deltaRevM >= 0 ? 'success' : 'danger')
                    ->icon('heroicon-o-banknotes'),

                // 8) Lead → Deal Rate (Gauge-style)
                Card::make('Lead → Deal Rate', $rate . '%')
                    ->description($inq30 . ' inq • ' . $deals30 . ' deals (30d)')
                    ->icon('heroicon-o-arrow-path-rounded-square')
                    ->color($this->rateColor($rate))
//                        ->progress((int) round($rate)) // renders a progress bar under the number
                    ->extraAttributes(['class' => 'overflow-hidden']), // keeps progress tidy
            ];
        });
    }

    // ===== Helpers =====

    protected function pctDelta(int|float $current, int|float $previous): float
    {
        if ($previous == 0) return $current > 0 ? 100.0 : 0.0;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    protected function diff(float $current, float $previous): float
    {
        return round($current - $previous, 2);
    }

    protected function trendText(float $pct): string
    {
        $sign = $pct > 0 ? '+' : '';
        return "{$sign}{$pct}%";
    }

    protected function deltaNumberText(float $delta): string
    {
        $sign = $delta > 0 ? '+' : ($delta < 0 ? '−' : '');
        return $sign . abs($delta);
    }

    protected function rateColor(float $rate): string
    {
        // tweak thresholds to taste
        return $rate >= 25 ? 'success' : ($rate >= 10 ? 'warning' : 'danger');
    }
}

/** Tiny utility to safely check columns without importing Schema everywhere */
if (!function_exists(__NAMESPACE__ . '\Schema')) {
    function Schema() { return \Illuminate\Support\Facades\Schema::getFacadeRoot(); }
}
