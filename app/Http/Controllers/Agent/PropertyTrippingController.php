<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
use App\Notifications\TrippingRequest;
use App\Notifications\TrippingResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use JetBrains\PhpStorm\NoReturn;

class PropertyTrippingController extends Controller
{
    public function index()
    {
        $trippings = PropertyTripping::with('property:id,title,image_url,address', 'buyer:id,name,email')
                ->where('agent_id', auth()->id())
                ->latest()
                ->get();



        return Inertia::render('Agent/Tripping/Trippings', [
            'trippings' => $trippings,
        ]);
    }

    public function accept(Request $request, $id)
    {
        $tripping = PropertyTripping::find($id);

        $tripping->update([
            'status' => 'accepted',
        ]);

        $buyer = $tripping->buyer;

        $property = $tripping->property;
        $agent = $tripping->agent;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'status' => 'Accepted',
            'property_id' => $property->id,
            'buyer_id' => $tripping->buyer_id,
        ]));

        return redirect()->back()->with('success', 'Tripping accepted');

    }


    public function complete(Request $request, $id)
    {
        $tripping = PropertyTripping::find($id);


        $tripping->update([
            'status' => 'completed',
        ]);

        $buyer = $tripping->buyer;

        $property = $tripping->property;
        $agent = $tripping->agent;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'status' => 'Accepted',
            'property_id' => $property->id,
            'buyer_id' => $tripping->buyer_id,
        ]));

        return redirect()->back()->with('success', 'Tripping accepted');

    }


    public function decline(Request $request, $id){

        $tripping = PropertyTripping::find($id);
        $tripping->update([
            'status' => 'declined',
        ]);

        return redirect()->back()->with('success', 'Tripping declined');
    }

    public function calendar(Request $request)
    {
        // Pull the same relations you showed in your dump
        $trips = PropertyTripping::query()
            ->with([
                'property:id,title,address',
                'agent:id,name,photo_url',   // make sure relations exist in model
                'buyer:id,name,email',
            ])
            ->latest('visit_date')
            ->get();

        // Build agent list for filters (distinct from the dataset)
        $agents = $trips->pluck('agent')
            ->filter()
            ->unique('id')
            ->values()
            ->map(fn ($a) => [
                'id'   => $a->id,
                'name' => $a->name,
                'photo_url' => $a->photo_url,
            ]);

        // Color by agent (stable hsl from id)
        $colorForAgent = function ($id) {
            if (!$id) return '#64748b'; // slate as fallback
            $h = (crc32((string)$id) % 360);
            return "hsl($h 70% 45%)";
        };

        // Transform to FullCalendar events
        // NOTE: we’ll assume 2 hours duration when no end time. Adjust as needed.
        $events = $trips->map(function ($t) use ($colorForAgent) {
            $start = Carbon::parse("{$t->visit_date} {$t->visit_time}", 'Asia/Manila');
            $end   = (clone $start)->addHours(2);

            return [
                'id'    => $t->id,
                'title' => ($t->property->title ?? 'Tripping'),
                'start' => $start->toIso8601String(),
                'end'   => $end->toIso8601String(),
                'backgroundColor' => $colorForAgent($t->agent_id),
                'borderColor'     => $colorForAgent($t->agent_id),
                // Everything else is accessible in event.extendedProps
                'extendedProps' => [
                    'status'   => $t->status,
                    'agent'    => $t->agent?->name,
                    'agent_id' => $t->agent_id,
                    'agent_photo' => $t->agent?->photo_url,
                    'buyer'    => $t->buyer?->name,
                    'buyer_email' => $t->buyer?->email,
                    'property' => [
                        'id' => $t->property?->id,
                        'title' => $t->property?->title,
                        'address' => $t->property?->address,
                    ],
                    'visit_date' => $t->visit_date,
                    'visit_time' => $t->visit_time,
                ],
            ];
        });

        return Inertia::render('Agent/Tripping/Calendar', [
            'events' => $events,
            'agents' => $agents,
        ]);
    }

}
