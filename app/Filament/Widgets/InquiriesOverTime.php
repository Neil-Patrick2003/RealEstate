<?php

namespace App\Filament\Widgets;

use App\Models\Inquiry;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;

class InquiriesOverTime extends ChartWidget
{
    protected static ?string $heading = 'Inquiries Over Time';
    protected static ?int $sort = -40;
    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }
    protected function getType(): string { return 'line'; }

    protected function getFilters(): ?array
    {
        return [
            '7d'  => 'Last 7 days',
            '30d' => 'Last 30 days',
            '90d' => 'Last 90 days',
        ];
    }

    protected function getData(): array
    {
        $range = $this->filter ?? '7d';
        $days  = $range === '90d' ? 90 : ($range === '30d' ? 30 : 7);

        $tz   = 'Asia/Manila';
        $end  = CarbonImmutable::now($tz)->endOfDay();
        $start= $end->subDays($days - 1)->startOfDay();

        $prevEnd   = $start->subDay()->endOfDay();
        $prevStart = $prevEnd->subDays($days - 1)->startOfDay();

        // Build label list (daily)
        $labels = [];
        for ($i = 0; $i < $days; $i++) {
            $labels[] = $start->addDays($i)->format('M j');
        }

        $curMap = Inquiry::whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->groupBy(fn($r) => $r->created_at->timezone($tz)->toDateString())
            ->map->count()
            ->all();

        $prevMap = Inquiry::whereBetween('created_at', [$prevStart, $prevEnd])
            ->get(['created_at'])
            ->groupBy(fn($r) => $r->created_at->timezone($tz)->toDateString())
            ->map->count()
            ->all();

        $cur = $prev = [];
        for ($i = 0; $i < $days; $i++) {
            $dCur  = $start->addDays($i)->toDateString();
            $dPrev = $prevStart->addDays($i)->toDateString();
            $cur[]  = (int)($curMap[$dCur]  ?? 0);
            $prev[] = (int)($prevMap[$dPrev] ?? 0);
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Current',
                    'data'  => $cur,
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.15)',
                    'fill' => true,
                ],
                [
                    'label' => 'Previous',
                    'data'  => $prev,
                    'borderColor' => 'rgb(107, 114, 128)',
                    'backgroundColor' => 'rgba(107, 114, 128, 0.10)',
                    'borderDash' => [6, 6],
                    'fill' => false,
                ],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'interaction' => ['mode' => 'index', 'intersect' => false],
            'elements' => [
                'line'  => ['tension' => 0.4],
                'point' => ['radius' => 2, 'hitRadius' => 8, 'hoverRadius' => 4],
            ],
            'plugins' => [
                'legend' => ['display' => true],
                'tooltip' => ['enabled' => true],
            ],
            'scales' => [
                'x' => ['grid' => ['display' => false]],
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
        ];
    }
}
