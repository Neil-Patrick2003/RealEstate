<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class DailyInquiriesChart extends ChartWidget
{
    protected static ?string $heading = 'Daily Inquiries (Last 30 Days)';
    protected static ?int $sort = -60;

    /** Selected agent or broker filter */
    public ?string $filter = '__all';

    protected function getType(): string
    {
        return 'line';
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default'=>1,'md'=>2,'xl'=>2,'2xl'=>2];
    }

    /** ========== FILTER DROPDOWN ========== */
    protected function getFilters(): array
    {
        if (!Schema::hasTable('users') || !Schema::hasTable('inquiries')) {
            return ['__all' => 'All Agents/Brokers'];
        }

        $users = DB::table('users')
            ->whereIn('role', ['agent', 'broker'])
            ->whereExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('inquiries')
                    ->whereColumn('inquiries.agent_id', 'users.id');
            })
            ->orderBy('name')
            ->pluck('name', 'id')
            ->toArray();

        return ['__all' => 'All Agents/Brokers'] + $users;
    }

    /** ========== CHART DATA ========== */
    protected function getData(): array
    {
        if (!Schema::hasTable('inquiries')) {
            return ['labels' => [], 'datasets' => [['data' => []]]];
        }

        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        $q = DB::table('inquiries')->whereBetween('created_at', [$from, $to]);

        // Filter by agent/broker if selected
        if ($this->filter && $this->filter !== '__all' && Schema::hasColumn('inquiries', 'agent_id')) {
            $q->where('agent_id', (int) $this->filter);
        } else {
            // Only include inquiries handled by agents/brokers
            $q->whereIn('agent_id', function ($sub) {
                $sub->select('id')->from('users')->whereIn('role', ['agent', 'broker']);
            });
        }

        $rows = $q->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->pluck('c', 'd');

        // Build aligned 30-day series
        $labels = [];
        $data   = [];
        $cursor = $from;
        while ($cursor->lte($to)) {
            $date = $cursor->toDateString();
            $labels[] = $cursor->format('M j');
            $data[]   = (int) ($rows[$date] ?? 0);
            $cursor   = $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'datasets' => [[
                'label'   => 'Inquiries',
                'data'    => $data,
                'tension' => 0.3,
                'borderWidth' => 2,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => ['mode' => 'index', 'intersect' => false],
            ],
            'interaction' => ['mode' => 'index', 'intersect' => false],
            'scales' => [
                'y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
        ];
    }

}
