<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class TrippingCancellationReasonsChart extends ChartWidget
{
    protected static ?string $heading = 'Cancellation Reasons (30d)';
    protected static ?int $sort = -27;

    // ▶ Limit the widget height (must be a CSS string, e.g. "160px")
    protected function getMaxHeight(): ?string
    {
        return '400px';
    }

    protected function getType(): string { return 'pie'; }

    protected function getData(): array
    {
        if (!Schema::hasTable('property_trippings')) {
            return ['labels'=>[], 'datasets'=>[['data'=>[]]]];
        }

        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        $reasonCol = collect(['cancellation_reason','reason','cancel_reason','remarks'])
            ->first(fn($c) => Schema::hasColumn('property_trippings', $c));

        if (!$reasonCol) {
            return ['labels'=>[], 'datasets'=>[['data'=>[]]]];
        }

        $rows = DB::table('property_trippings')
            ->selectRaw('COALESCE(NULLIF(TRIM('.$reasonCol.'),""), "Unspecified") as reason, COUNT(*) c')
            ->whereBetween('created_at', [$from, $to])
            ->when(Schema::hasColumn('property_trippings','status'), fn($q)=>$q->where('status','Cancelled'))
            ->groupBy('reason')
            ->orderByDesc('c')
            ->limit(8)
            ->get();

        return [
            'labels' => $rows->pluck('reason')->all(),
            'datasets' => [[
                'data' => $rows->pluck('c')->map(fn($v)=>(int)$v)->all(),
                'borderWidth' => 0,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            // ▶ Let the container height control the chart height
            'maintainAspectRatio' => false,
            'layout' => [
                'padding' => ['top' => 0, 'bottom' => 0, 'left' => 0, 'right' => 0],
            ],
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels' => [
                        'boxWidth' => 10,
                        'font' => ['size' => 10],
                    ],
                ],
                'tooltip' => ['enabled' => true],
            ],
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default'=>1,'md'=>2,'xl'=>2];
    }
}
