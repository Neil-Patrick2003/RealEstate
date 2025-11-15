<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class AvgFeedbackPerAgentChart extends ChartWidget
{
    protected static ?string $heading = 'Avg Feedback per Agent';
    protected static ?int $sort = -48;

    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        // Compute per-feedback rating, then AVG per agent_id
        $rows = DB::table('feedbacks as f')
            ->join('users as u', 'u.id', '=', 'f.agent_id')
            ->selectRaw("
                f.agent_id,
                u.name,
                AVG(
                  (
                    COALESCE(f.communication,0) +
                    COALESCE(f.negotiation,0) +
                    COALESCE(f.professionalism,0) +
                    COALESCE(f.knowledge,0)
                  ) / NULLIF(
                    ( (f.communication IS NOT NULL) + (f.negotiation IS NOT NULL) + (f.professionalism IS NOT NULL) + (f.knowledge IS NOT NULL) )
                  ,0)
                ) as avg_rating
            ")
            ->whereNotNull('f.agent_id')
            ->groupBy('f.agent_id', 'u.name')
            ->orderByDesc('avg_rating')
            ->limit(10)
            ->get();

        $labels = $rows->pluck('name')->all();
        $data   = $rows->pluck('avg_rating')->map(fn($v) => round((float)$v, 2))->all();

        return [
            'labels' => $labels,
            'datasets' => [[ 'label' => 'Avg ★', 'data' => $data ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['display' => false]],
            'scales'  => [
                'y' => ['beginAtZero' => true, 'suggestedMax' => 5, 'ticks' => ['stepSize' => 1]],
            ],
            'responsive' => true,
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
