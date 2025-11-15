<?php

namespace App\Filament\Widgets;

use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\CarbonImmutable;
use Filament\Widgets\ChartWidget;

class TrippingCompletionRateAgent extends ChartWidget
{
    protected static ?string $heading = 'Tripping Completion Rate';

    protected static ?int $sort = -37;
    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }
    protected function getType(): string { return 'bar'; }

    public string $agent = 'all'; // filter key

    protected function getFilters(): ?array
    {
        // Build agent dropdown (id => name) + "All"
        $agents = User::query()
            ->where('role', 'agent')
            ->orderBy('name')
            ->pluck('name', 'id')
            ->toArray();

        return ['all' => 'All Agents'] + array_combine(
                array_map(fn($id) => (string)$id, array_keys($agents)),
                array_values($agents)
            );
    }

    protected function getData(): array
    {
        $tz    = 'Asia/Manila';
        $end   = CarbonImmutable::now($tz)->endOfDay();
        $start = $end->subDays(29)->startOfDay(); // last 30 days

        // Columns: adjust to your schema if needed
        $dateScheduled = \Schema::hasColumn((new PropertyTripping)->getTable(),'scheduled_at') ? 'scheduled_at' : 'created_at';

        $q = PropertyTripping::query()
            ->whereBetween($dateScheduled, [$start, $end]);

        // Apply agent filter if your trippings table has agent_id
        // If completion belongs to listing agents, adapt to join via pivot here.
        if ($this->agent !== 'all') {
            $agentId = (int) $this->agent;
            if (\Schema::hasColumn((new PropertyTripping)->getTable(),'agent_id')) {
                $q->where('agent_id', $agentId);
            }
        }

        $scheduled = (int) $q->count();

        $qc = clone $q;
        $completed = (int) $qc->where('status', 'Completed')->count();

        $completed = max(0, min($completed, $scheduled));
        $remaining = max(0, $scheduled - $completed);
        $rate      = $scheduled > 0 ? round($completed / $scheduled * 100) : 0;

        return [
            'labels' => ['Last 30 days'],
            'datasets' => [
                [
                    'label' => 'Completed',
                    'data'  => [$completed],
                    'backgroundColor' => 'rgba(16,185,129,0.85)',
                    'borderColor' => 'rgb(16,185,129)',
                    'stack' => 's',
                ],
                [
                    'label' => 'Scheduled (Remaining)',
                    'data'  => [$remaining],
                    'backgroundColor' => 'rgba(107,114,128,0.35)',
                    'borderColor' => 'rgb(107,114,128)',
                    'stack' => 's',
                ],
            ],
            // pass % to options for label plugin
            '_rate' => $rate,
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                'legend' => ['display' => true],
                'tooltip' => ['enabled' => true],
            ],
            'scales' => [
                'x' => ['stacked' => true, 'grid' => ['display' => false]],
                'y' => ['stacked' => true, 'beginAtZero' => true, 'ticks' => ['precision' => 0]],
            ],
            // draw % on top (inline plugin)
            'pluginsRegister' => [[
                'id' => 'rateLabel',
                'afterDatasetsDraw' => 'function(chart){const ds=chart.data.datasets;if(!ds||!ds.length)return;const meta=chart.getDatasetMeta(0);const bar=meta?.data?.[0];if(!bar)return;const rate=chart.config.data._rate||0;const ctx=chart.ctx;ctx.save();ctx.font="bold 12px sans-serif";ctx.fillStyle="#111827";ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillText(rate+"%", bar.x, bar.y-8);ctx.restore();}',
            ]],
        ];
    }
}
