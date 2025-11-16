<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class DailyInquiriesChart extends ChartWidget
{
    protected static ?string $heading = 'Daily Inquiries Trend (Last 30 Days)';
    protected static ?int $sort = -60;
    protected static ?string $pollingInterval = '120s';
    protected static ?string $maxHeight = '500px';

    /** Selected agent or broker filter */
    public ?string $filter = '__all';

    protected function getType(): string
    {
        return 'line';
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2, '2xl' => 2];
    }

    public function getHeight(): string
    {
        return '500px';
    }

    /** ========== FILTER DROPDOWN ========== */
    protected function getFilters(): array
    {
        if (!Schema::hasTable('users') || !Schema::hasTable('inquiries')) {
            return ['__all' => '👥 All Agents/Brokers'];
        }

        $users = DB::table('users')
            ->whereIn('role', ['agent', 'broker'])
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('inquiries')
                    ->whereColumn('inquiries.agent_id', 'users.id');
            })
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($user) {
                $roleIcon = $user->role === 'broker' ? '👔' : '🎯';
                return [$user->id => "{$roleIcon} {$user->name}"];
            })
            ->toArray();

        return ['__all' => '👥 All Agents/Brokers'] + $users;
    }

    /** ========== CHART DATA ========== */
    protected function getData(): array
    {
        if (!Schema::hasTable('inquiries')) {
            return $this->getEmptyData();
        }

        $tz = 'Asia/Manila';
        $to = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        $query = DB::table('inquiries')->whereBetween('created_at', [$from, $to]);

        // Apply agent/broker filter
        $this->applyAgentFilter($query);

        $inquiriesData = $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        // Calculate statistics for styling
        $stats = $this->calculateStats($inquiriesData->values());

        // Build aligned 30-day series
        return $this->buildChartData($from, $to, $inquiriesData, $stats);
    }

    /** ========== HELPER METHODS ========== */
    private function getEmptyData(): array
    {
        return [
            'labels' => [],
            'datasets' => [[
                'data' => [],
                'borderColor' => '#059669',
                'backgroundColor' => 'rgba(5, 150, 105, 0.1)',
                'tension' => 0.4,
                'borderWidth' => 2,
                'pointRadius' => 0,
            ]]
        ];
    }

    private function applyAgentFilter($query): void
    {
        if ($this->filter && $this->filter !== '__all' && Schema::hasColumn('inquiries', 'agent_id')) {
            $query->where('agent_id', (int) $this->filter);
        } else {
            $query->whereIn('agent_id', function ($sub) {
                $sub->select('id')->from('users')->whereIn('role', ['agent', 'broker']);
            });
        }
    }

    private function calculateStats($data): array
    {
        $values = $data->toArray();
        $max = $values ? max($values) : 0;
        $avg = $values ? array_sum($values) / count($values) : 0;

        return [
            'max' => $max,
            'avg' => $avg,
            'trend' => $this->calculateTrend($values),
        ];
    }

    private function calculateTrend(array $values): string
    {
        if (count($values) < 2) return 'stable';

        $firstHalf = array_slice($values, 0, intval(count($values) / 2));
        $secondHalf = array_slice($values, intval(count($values) / 2));

        $firstAvg = array_sum($firstHalf) / count($firstHalf);
        $secondAvg = array_sum($secondHalf) / count($secondHalf);

        if ($secondAvg > $firstAvg * 1.1) return 'up';
        if ($secondAvg < $firstAvg * 0.9) return 'down';
        return 'stable';
    }

    private function buildChartData($from, $to, $inquiriesData, $stats): array
    {
        $labels = [];
        $data = [];
        $cursor = $from;

        while ($cursor->lte($to)) {
            $date = $cursor->toDateString();
            $count = (int) ($inquiriesData[$date] ?? 0);

            $labels[] = $cursor->format('M j');
            $data[] = $count;

            $cursor = $cursor->addDay();
        }

        $chartColor = $this->getChartColor($stats['trend']);

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Daily Inquiries',
                'data' => $data,
                'borderColor' => $chartColor['border'],
                'backgroundColor' => $chartColor['background'],
                'fill' => true,
                'tension' => 0.4,
                'borderWidth' => 3,
                'pointBackgroundColor' => $chartColor['border'],
                'pointBorderColor' => '#ffffff',
                'pointBorderWidth' => 2,
                'pointRadius' => 5,
                'pointHoverRadius' => 8,
            ]],
        ];
    }

    private function getChartColor(string $trend): array
    {
        return match($trend) {
            'up' => [
                'border' => '#059669',
                'background' => 'rgba(5, 150, 105, 0.15)',
            ],
            'down' => [
                'border' => '#DC2626',
                'background' => 'rgba(220, 38, 38, 0.1)',
            ],
            default => [
                'border' => '#10B981',
                'background' => 'rgba(16, 185, 129, 0.15)',
            ],
        };
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
                        'maxTicksLimit' => 10,
                        'font' => [
                            'size' => 12,
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
                ],
            ],
            'elements' => [
                'line' => [
                    'tension' => 0.4,
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
        if (!Schema::hasTable('inquiries')) {
            return 'No inquiry data available';
        }

        $stats = $this->getQuickStats();

        return match($stats['trend']) {
            'up' => "📈 Trend: Upward • 🎯 Peak: {$stats['peak']} inquiries • 📊 Avg: {$stats['avg']}/day",
            'down' => "📉 Trend: Downward • 🎯 Peak: {$stats['peak']} inquiries • 📊 Avg: {$stats['avg']}/day",
            default => "📊 Trend: Stable • 🎯 Peak: {$stats['peak']} inquiries • 📊 Avg: {$stats['avg']}/day",
        };
    }

    private function getQuickStats(): array
    {
        $data = $this->getData();
        $values = $data['datasets'][0]['data'] ?? [];

        if (empty($values)) {
            return ['peak' => 0, 'avg' => 0, 'trend' => 'stable'];
        }

        $peak = max($values);
        $avg = round(array_sum($values) / count($values), 1);
        $trend = $this->calculateTrend($values);

        return [
            'peak' => $peak,
            'avg' => $avg,
            'trend' => $trend,
        ];
    }
}
