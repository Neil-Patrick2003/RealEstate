<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\User;
use Carbon\Carbon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Card;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatsOverview extends BaseWidget
{
    protected static ?string $pollingInterval = '30s';
    protected static ?int $sort = -100;                 // keep KPIs at the very top

    protected function getCards(): array
    {
        // Cache everything for 60s to keep the dashboard snappy
        return Cache::remember('dashboard.stats.kpis', 60, function () {
            $today       = Carbon::today();
            $start7      = $today->copy()->subDays(6);   // 7-day window (inclusive)
            $prevStart7  = $start7->copy()->subDays(7);  // previous 7 days
            $prevEnd7    = $start7->copy()->subDay();    // day before current window

            // ---- Aggregations (single queries each) -------------------------
            $totalProperties = Property::count();
            $unassigned      = Property::where('status', 'Unassigned')->count();
            $liveProperties  = Property::where('status', 'Published')->count();
            $totalAgents     = User::where('role', 'agent')->count();

            // New properties – last 7 days & previous 7 days (for delta)
            [$dailyNew, $last7New, $prev7New] = $this->dailyCounts(
                table: (new Property)->getTable(),
                dateColumn: 'created_at',
                start: $start7,
                end: $today
            );
            $prev7New = Property::whereBetween('created_at', [$prevStart7, $prevEnd7])->count();

            // Published listings – last 7 days & previous 7 days (for delta)
            // If your "published" status is on Property instead, switch to Property/published_at.
            [$dailyPublished, $last7Pub, $prev7Pub] = $this->dailyCounts(
                table: (new PropertyListing)->getTable(),
                dateColumn: 'created_at',
                start: $start7,
                end: $today,
                where: ['status' => 'Published']
            );
            $prev7Pub = PropertyListing::where('status', 'Published')
                ->whereBetween('created_at', [$prevStart7, $prevEnd7])->count();

            // Deltas (week over week)
            $deltaNew = $this->percentDelta($last7New, $prev7New);
            $deltaPub = $this->percentDelta($last7Pub, $prev7Pub);

            return [
                // Total inventory
                Card::make('Total Properties', $this->nf($totalProperties))
                    ->description($this->deltaText($deltaNew) . ' new vs prev 7d')
                    ->descriptionIcon($deltaNew >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($deltaNew >= 0 ? 'success' : 'danger')
                    ->icon('heroicon-o-home')
                    ->chart($dailyNew),

                // Live inventory (from properties.status)
                Card::make('Published (Live)', $this->nf($liveProperties))
                    ->description($this->deltaText($deltaPub) . ' published vs prev 7d')
                    ->descriptionIcon($deltaPub >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($deltaPub >= 0 ? 'success' : 'danger')
                    ->icon('heroicon-o-globe-alt')
                    ->chart($dailyPublished),

                // Attention queue
                Card::make('Unassigned', $this->nf($unassigned))
                    ->description('Needs attention')
                    ->color('warning')
                    ->icon('heroicon-o-exclamation-triangle'),

                // Agents
                Card::make('Agents', $this->nf($totalAgents))
                    ->description('Active handlers')
                    ->color('info')
                    ->icon('heroicon-o-user-group'),
            ];
        });
    }

    /**
     * Build a 7-day array (last 7 days) of counts in one query.
     * Returns [array<int>, int $totalInRange, int $prev7 (placeholder, computed outside when needed)]
     */
    protected function dailyCounts(
        string $table,
        string $dateColumn,
        Carbon $start,
        Carbon $end,
        array $where = []
    ): array {
        // Get counts grouped by date in the window
        $rows = DB::table($table)
            ->when(!empty($where), function ($q) use ($where) {
                foreach ($where as $col => $val) {
                    $q->where($col, $val);
                }
            })
            ->whereBetween($dateColumn, [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->selectRaw("DATE($dateColumn) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd');

        // Fill the 7-day series in chronological order
        $series = [];
        $cursor = $start->copy();
        $total  = 0;

        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $count = (int) ($rows[$key] ?? 0);
            $series[] = $count;
            $total += $count;
            $cursor->addDay();
        }

        return [$series, $total, 0]; // prev7 is computed by caller if needed
    }

    protected function percentDelta(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / max(1, $previous)) * 100, 1);
    }

    protected function deltaText(float $delta): string
    {
        $sign = $delta > 0 ? '+' : '';
        return "{$sign}{$delta}%";
    }

    protected function nf(int|float $num): string
    {
        return number_format((float) $num);
    }
}
