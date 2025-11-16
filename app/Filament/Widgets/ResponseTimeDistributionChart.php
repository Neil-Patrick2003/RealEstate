<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class ResponseTimeDistributionChart extends ChartWidget
{
    protected static ?string $heading = '⏱️ Response Time Distribution (Last 30 Days)';
    protected static ?int $sort = -47;
    protected static ?string $pollingInterval = '120s';
    protected static ?string $maxHeight = '500px';

    protected function getType(): string
    {
        return 'bar';
    }

    public function getHeight(): string
    {
        return '500px';
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2, '2xl' => 2];
    }

    protected function getData(): array
    {
        if (!Schema::hasTable('chat_channel_messages') || !Schema::hasTable('users')) {
            return $this->getEmptyData();
        }

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
            return $this->getEmptyData();
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

        if (empty($durations)) {
            return $this->getEmptyData();
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
                'label' => 'Response Count',
                'data' => array_values($buckets),
                'backgroundColor' => [
                    '#10B981', // 0–15m - emerald-500 (fast)
                    '#059669', // 15–60m - emerald-600
                    '#047857', // 1–4h - emerald-700
                    '#065F46', // 4–12h - emerald-800
                    '#F59E0B', // 12–24h - amber-500 (slow)
                    '#D97706', // 1–2d - amber-600
                    '#DC2626', // >2d - red-600 (very slow)
                ],
                'borderColor' => [
                    '#10B981',
                    '#059669',
                    '#047857',
                    '#065F46',
                    '#F59E0B',
                    '#D97706',
                    '#DC2626',
                ],
                'borderWidth' => 2,
                'borderRadius' => 6,
                'barPercentage' => 0.7,
                'categoryPercentage' => 0.8,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => true,
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                // Using default tooltip - no custom configuration
            ],
            'scales' => [
                'x' => [
                    'grid' => [
                        'display' => false,
                    ],
                    'ticks' => [
                        'color' => '#374151',
                        'font' => [
                            'size' => 11,
                        ],
                    ],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'precision' => 0,
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                        ],
                    ],
                    'grid' => [
                        'color' => 'rgba(5, 150, 105, 0.1)',
                    ],
                    'title' => [
                        'display' => true,
                        'text' => 'Number of Responses',
                        'color' => '#374151',
                        'font' => [
                            'size' => 12,
                            'weight' => '600',
                        ],
                    ],
                ],
            ],
            'layout' => [
                'padding' => [
                    'top' => 20,
                    'right' => 20,
                    'bottom' => 20,
                    'left' => 20,
                ],
            ],
        ];
    }

    /** ========== CHART DESCRIPTION ========== */
    public function getDescription(): ?string
    {
        if (!Schema::hasTable('chat_channel_messages') || !Schema::hasTable('users')) {
            return 'No response time data available';
        }

        $data = $this->getData();
        $responseCounts = $data['datasets'][0]['data'] ?? [];

        if (empty($responseCounts) || array_sum($responseCounts) === 0) {
            return 'No response time data recorded in the last 30 days';
        }

        $totalResponses = array_sum($responseCounts);
        $fastResponses = $responseCounts[0] + $responseCounts[1]; // 0–15m + 15–60m
        $fastResponseRate = $totalResponses > 0 ? round(($fastResponses / $totalResponses) * 100, 1) : 0;
        $slowResponses = $responseCounts[5] + $responseCounts[6]; // 1–2d + >2d
        $slowResponseRate = $totalResponses > 0 ? round(($slowResponses / $totalResponses) * 100, 1) : 0;

        return "Fast Responses (<1h): {$fastResponseRate}% • Slow Responses (>1d): {$slowResponseRate}% • Total: {$totalResponses} responses";
    }

    private function getEmptyData(): array
    {
        return [
            'labels' => ['0–15m', '15–60m', '1–4h', '4–12h', '12–24h', '1–2d', '>2d'],
            'datasets' => [[
                'label' => 'Response Count',
                'data' => [0, 0, 0, 0, 0, 0, 0],
                'backgroundColor' => [
                    'rgba(16, 185, 129, 0.3)',
                    'rgba(5, 150, 105, 0.3)',
                    'rgba(4, 120, 87, 0.3)',
                    'rgba(6, 95, 70, 0.3)',
                    'rgba(245, 158, 11, 0.3)',
                    'rgba(217, 119, 6, 0.3)',
                    'rgba(220, 38, 38, 0.3)',
                ],
                'borderColor' => [
                    '#10B981',
                    '#059669',
                    '#047857',
                    '#065F46',
                    '#F59E0B',
                    '#D97706',
                    '#DC2626',
                ],
                'borderWidth' => 2,
                'borderRadius' => 6,
            ]],
        ];
    }
}
