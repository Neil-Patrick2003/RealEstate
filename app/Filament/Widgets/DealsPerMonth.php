<?php

namespace App\Filament\Widgets;

use App\Models\Deal;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;

class DealsPerMonth extends ChartWidget
{
    protected static ?string $heading = 'Deals Per Month (12M)';
    protected static ?int $sort = -39;
    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }
    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        $tz   = 'Asia/Manila';
        $now  = CarbonImmutable::now($tz)->startOfMonth();
        $start= $now->subMonths(11);
        $end  = $now->endOfMonth();

        $rows = Deal::whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as ym, COUNT(*) c')
            ->groupBy('ym')
            ->pluck('c','ym')
            ->all();

        $labels = [];
        $series = [];
        for ($i=0; $i<12; $i++) {
            $m = $start->addMonths($i);
            $ym= $m->format('Y-m');
            $labels[] = $m->format('M Y');
            $series[] = (int)($rows[$ym] ?? 0);
        }

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Deals',
                'data'  => $series,
                'backgroundColor' => 'function(ctx){const a=ctx.chart.chartArea;if(!a)return null;const g=ctx.chart.ctx.createLinearGradient(0,a.bottom,0,a.top);g.addColorStop(0,"rgba(16,185,129,.20)");g.addColorStop(1,"rgba(16,185,129,.70)");return g;}',
                'borderColor' => 'rgb(16,185,129)',
                'borderWidth' => 1,
                'barPercentage' => 0.6,
                'categoryPercentage' => 0.7,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => ['legend' => ['display' => false], 'tooltip' => ['enabled' => true]],
            'scales' => [
                'x' => ['grid' => ['display' => false]],
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
        ];
    }
}
