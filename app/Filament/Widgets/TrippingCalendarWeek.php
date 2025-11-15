<?php

namespace App\Filament\Widgets;

use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\CarbonImmutable;
use Filament\Widgets\Widget;

class TrippingCalendarWeek extends Widget
{
    protected static ?string $heading = 'Tripping Calendar (Week)';
    protected static ?int $sort = -12;
    protected static ?string $pollingInterval = '300s'; // 5 minutes
    protected static string $view = 'filament.widgets.tripping-calendar-week';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 'full', 'md' => 'full', 'xl' => 6];
    }


    /** Livewire filter state */
    public string $agentId = 'all';

    /** Setter triggered from Blade filter */
    public function setAgentId(string $id): void
    {
        $this->agentId = $id;
    }

    protected function getViewData(): array
    {
        $tz    = 'Asia/Manila';
        $now   = CarbonImmutable::now($tz);
        $start = $now->startOfWeek(CarbonImmutable::MONDAY);
        $end   = $now->endOfWeek(CarbonImmutable::SUNDAY);

        $trip  = new PropertyTripping();
        $table = $trip->getTable();

        // Determine which datetime columns exist
        $dateColStart = \Schema::hasColumn($table, 'scheduled_start')
            ? 'scheduled_start'
            : (\Schema::hasColumn($table, 'scheduled_at') ? 'scheduled_at' : 'created_at');

        $dateColEnd = \Schema::hasColumn($table, 'scheduled_end') ? 'scheduled_end' : null;

        $q = PropertyTripping::query()
            ->with([
                'agent:id,name',               // Agent assigned
                'property:id,title',           // Related property
                'buyer:id,name,contact_number' // Buyer info
            ])
            ->whereBetween($dateColStart, [$start, $end]);

        // Optional agent filter
        if ($this->agentId !== 'all' && \Schema::hasColumn($table, 'agent_id')) {
            $q->where('agent_id', (int) $this->agentId);
        }

        $rows = $q->get();

        // Convert to FullCalendar events
        $events = $rows->map(function ($r) use ($dateColStart, $dateColEnd) {
            $agentName = $r->agent->name ?? 'Unassigned';
            $propTitle = $r->property->title ?? 'Property';
            $title     = "{$propTitle} • {$agentName}";

            // Generate stable color per agent
            $aid = $r->agent->id ?? 0;
            $hue = ($aid * 37) % 360;
            $color = "hsl($hue, 70%, 55%)";

            return [
                'id'              => (string) $r->id,
                'title'           => $title,
                'start'           => optional($r->{$dateColStart})->toIso8601String(),
                'end'             => $dateColEnd ? optional($r->{$dateColEnd})->toIso8601String() : null,
                'backgroundColor' => $color,
                'borderColor'     => $color,
                'extendedProps'   => [
                    'property' => $propTitle,
                    'agent'    => $agentName,
                    'buyer'    => $r->buyer->name ?? null,
                    'phone'    => $r->buyer->contact_number ?? null,
                    'status'   => $r->status ?? null,
                ],
            ];
        })->values()->all();

        // Agent dropdown list
        $agents = User::query()
            ->when(\Schema::hasColumn((new User())->getTable(), 'role'), fn ($q) => $q->where('role', 'agent'))
            ->orderBy('name')
            ->get(['id','name']);

        return [
            'events'    => $events,
            'weekRange' => $start->format('M j') . ' – ' . $end->format('M j, Y'),
            'agents'    => $agents,
            'agentId'   => $this->agentId,
            'projects'  => collect(), // ✅ avoid "Undefined variable $projects"
        ];
    }
}
