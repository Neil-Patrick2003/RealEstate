<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonImmutable;

class TopAreasFromAddress extends ChartWidget
{
    protected static ?string $heading = 'Top 5 Areas (from address)';
    protected static ?int $sort = -34;

    protected function getType(): string { return 'bar'; }

    public string $range = '30d'; // '7d' | '30d' | '90d'

    protected function getFilters(): ?array
    {
        return [
            '7d'  => 'Last 7 days',
            '30d' => 'Last 30 days',
            '90d' => 'Last 90 days',
        ];
    }

    public function setRange(string $rng): void
    {
        $this->range = in_array($rng, ['7d','30d','90d'], true) ? $rng : '30d';
    }

    protected function getData(): array
    {
        $days = $this->range === '90d' ? 90 : ($this->range === '7d' ? 7 : 30);
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays($days - 1)->startOfDay();

        // Heuristic:
        //   area1 = last token after last comma
        //   area2 = second-last token (fallback when area1 is 'PHILIPPINES', blank, or mostly digits)
        // MySQL 8+ REGEXP used; if you’re on 5.7, remove the REGEXP branch and keep simple checks.
        $rows = DB::table('inquiries as iq')
            ->whereNotNull('iq.address')
            ->where('iq.address', '!=', '')
            ->whereBetween('iq.created_at', [$from, $to])
            ->selectRaw(<<<SQL
                CASE
                        WHEN UPPER(TRIM(SUBSTRING_INDEX(iq.address, ',', -1))) REGEXP '^[0-9 ]*$'
                      OR UPPER(TRIM(SUBSTRING_INDEX(iq.address, ',', -1))) IN ('PHILIPPINES','PH','PILIPINAS','N/A','NA','NONE','UNKNOWN','')
                    THEN UPPER(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(iq.address, ',', -2), ',', 1)))
                    ELSE UPPER(TRIM(SUBSTRING_INDEX(iq.address, ',', -1)))
                END AS area,
                COUNT(*) AS c
            SQL)
            ->groupBy('area')
            ->having('area', '!=', '')
            ->orderByDesc('c')
            ->limit(5)
            ->get();

        // Pretty labels: Title-case the area strings (PH locales often uppercase)
        $labels = $rows->map(fn($r) => mb_convert_case(strtolower($r->area), MB_CASE_TITLE, "UTF-8"))->all();
        $data   = $rows->pluck('c')->map(fn($n) => (int)$n)->all();

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Inquiries',
                'data'  => $data,
                'backgroundColor' => 'rgba(16,185,129,0.85)', // green
                'borderColor'     => 'rgb(16,185,129)',
                'borderWidth'     => 1,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend'  => ['display' => false],
                'tooltip' => ['enabled' => true],
            ],
            // Horizontal mini bar
            'indexAxis' => 'y',
            'scales' => [
                'x' => ['beginAtZero' => true, 'ticks' => ['precision' => 0], 'grid' => ['display' => false]],
                'y' => ['grid' => ['display' => false]],
            ],
        ];
    }
}
