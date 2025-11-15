<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonImmutable;

class ResponseTimeDistributionChart extends ChartWidget
{
    protected static ?string $heading = 'Response Time Distribution (30d)';
    protected static ?int $sort = -47;

    protected function getType(): string { return 'bar'; }

    protected function getData(): array
    {
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        // 1️⃣ Collect first buyer → first agent message timestamps per channel
        $messages = DB::table('chat_channel_messages')
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('channel_id')
            ->orderBy('created_at')
            ->get(['channel_id', 'sender_id', 'created_at']);

        if ($messages->isEmpty()) {
            return [
                'labels' => ['0–15m','15–60m','1–4h','4–12h','12–24h','1–2d','>2d'],
                'datasets' => [[ 'label' => 'Count', 'data' => [0,0,0,0,0,0,0] ]],
            ];
        }

        // Get agent IDs (role='agent') to identify responses
        $agentIds = DB::table('users')->where('role', 'agent')->pluck('id')->toArray();

        $durations = [];

        foreach ($messages->groupBy('channel_id') as $cid => $msgs) {
            $msgs = $msgs->sortBy('created_at')->values();

            $buyerFirst = null;
            $agentFirst = null;

            foreach ($msgs as $m) {
                if (!in_array($m->sender_id, $agentIds)) {
                    // Buyer message
                    $buyerFirst ??= $m->created_at;
                } else {
                    // Agent reply
                    if ($buyerFirst) {
                        $agentFirst = $m->created_at;
                        break;
                    }
                }
            }

            if ($buyerFirst && $agentFirst) {
                $diffSeconds = CarbonImmutable::parse($buyerFirst, $tz)->diffInSeconds(CarbonImmutable::parse($agentFirst, $tz));
                $durations[] = $diffSeconds;
            }
        }

        // 2️⃣ Bucket durations
        $buckets = [
            '0–15m' => 0,
            '15–60m' => 0,
            '1–4h' => 0,
            '4–12h' => 0,
            '12–24h' => 0,
            '1–2d' => 0,
            '>2d' => 0,
        ];

        foreach ($durations as $s) {
            if ($s < 900) $buckets['0–15m']++;
            elseif ($s < 3600) $buckets['15–60m']++;
            elseif ($s < 14400) $buckets['1–4h']++;
            elseif ($s < 43200) $buckets['4–12h']++;
            elseif ($s < 86400) $buckets['12–24h']++;
            elseif ($s < 172800) $buckets['1–2d']++;
            else $buckets['>2d']++;
        }

        return [
            'labels' => array_keys($buckets),
            'datasets' => [[
                'label' => 'Responses',
                'data' => array_values($buckets),
                'backgroundColor' => '#38bdf8',
                'borderRadius' => 4,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['display' => false]],
            'scales'  => [
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
            'responsive' => true,
        ];
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
