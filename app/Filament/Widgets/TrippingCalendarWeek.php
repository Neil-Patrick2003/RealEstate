<?php

namespace App\Filament\Widgets;

use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\CarbonImmutable;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Schema;

class TrippingCalendarWeek extends Widget
{
    protected static ?string $heading = 'Tripping Calendar (Week)';
    protected static ?int $sort = -12;
    protected static ?string $pollingInterval = '300s';
    protected static string $view = 'filament.widgets.tripping-calendar-week';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 'full', 'md' => 'full', 'xl' => 6];
    }

    public string $agentId = 'all';

    public function setAgentId(string $id): void
    {
        if ($id === 'all' || User::where('id', (int) $id)->exists()) {
            $this->agentId = $id;
        } else {
            $this->agentId = 'all';
        }
    }

    protected function getViewData(): array
    {
        try {
            $tz = 'Asia/Manila';
            $now = CarbonImmutable::now($tz);
            $start = $now->startOfWeek(CarbonImmutable::MONDAY);
            $end = $now->endOfWeek(CarbonImmutable::SUNDAY);

            $query = PropertyTripping::query()
                ->with([
                    'agent:id,name',
                    'property:id,title',
                    'buyer:id,name,contact_number'
                ])
                ->whereBetween('visit_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                ->orderBy('visit_date')
                ->orderBy('visit_time');

            if ($this->agentId !== 'all') {
                $query->where('agent_id', (int) $this->agentId);
            }

            $trippings = $query->get();

            $events = $trippings->map(function ($tripping) use ($tz) {
                $agentName = $tripping->agent->name ?? 'Unassigned';
                $propertyTitle = $tripping->property->title ?? 'Property';

                // Combine date and time
                $startDateTime = $tripping->visit_date . ' ' . $tripping->visit_time;
                $start = CarbonImmutable::parse($startDateTime, $tz);
                $end = $start->addHour();

                // Generate color based on agent
                $agentId = $tripping->agent->id ?? 0;
                $hue = ($agentId * 37) % 360;
                $color = "hsl($hue, 70%, 45%)";

                return [
                    'id' => (string) $tripping->id,
                    'title' => "{$propertyTitle} • {$agentName}",
                    'start' => $start->toIso8601String(),
                    'end' => $end->toIso8601String(),
                    'backgroundColor' => $color,
                    'borderColor' => $color,
                    'textColor' => '#ffffff',
                    'extendedProps' => [
                        'property' => $propertyTitle,
                        'agent' => $agentName,
                        'buyer' => $tripping->buyer->name ?? null,
                        'phone' => $tripping->buyer->contact_number ?? null,
                        'status' => $tripping->status ?? null,
                        'notes' => $tripping->notes ?? null,
                        'visit_date' => $tripping->visit_date,
                        'visit_time' => $tripping->visit_time,
                    ],
                ];
            })->values()->all();

            $agents = User::query()
                ->when(
                    Schema::hasColumn((new User())->getTable(), 'role'),
                    fn ($q) => $q->where('role', 'agent')
                )
                ->orderBy('name')
                ->get(['id', 'name']);

            return [
                'events' => $events,
                'agents' => $agents,
                'weekRange' => $start->format('M j') . ' – ' . $end->format('M j, Y'),
                'agentId' => $this->agentId,
                'totalEvents' => count($events),
            ];

        } catch (\Exception $e) {
            return [
                'events' => [],
                'agents' => collect(),
                'weekRange' => 'Error loading calendar',
                'agentId' => $this->agentId,
                'totalEvents' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }
}
