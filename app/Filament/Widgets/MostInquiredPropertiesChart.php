<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class MostInquiredPropertiesChart extends ChartWidget
{
    protected static ?string $heading = 'Most Inquired Properties (Top 10)';
    protected static ?int $sort = -39;

    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        // If your inquiries are tied via property_listing_id, swap to a JOIN to properties.
        $rows = DB::table('inquiries as iq')
            ->selectRaw('iq.property_id, COUNT(*) as c')
            ->whereNotNull('iq.property_id')
            ->groupBy('iq.property_id')
            ->orderByDesc('c')
            ->limit(10)
            ->get();

        // fetch titles
        $ids = $rows->pluck('property_id')->all();
        $titles = DB::table('properties')->whereIn('id', $ids)->pluck('title','id');

        $labels = $rows->map(fn($r) => $titles[$r->property_id] ?? ('#'.$r->property_id))->all();
        $data   = $rows->pluck('c')->map(fn($n)=> (int)$n)->all();

        return [
            'labels' => $labels,
            'datasets' => [[ 'label' => 'Inquiries', 'data' => $data ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'plugins' => ['legend' => ['display' => false]],
            'scales' => ['y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]]],
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
