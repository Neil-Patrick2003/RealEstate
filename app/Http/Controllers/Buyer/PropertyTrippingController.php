<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyTripping;
use App\Models\User;
use App\Notifications\TrippingRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PropertyTrippingController extends Controller
{


    public function index(){

        $trippings = PropertyTripping::with('property', 'agent', 'broker')
            ->where('buyer_id', auth()->id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Buyer/Trippins/Trippings' , [
            'trippings' => $trippings
        ]);
    }
    public function store(Request $request){


        //validate
        $validated = request()->validate([
            'property_id' => 'required',
            'agent_id' => 'nullable',
            'broker_id' => 'nullable',
            'inquiry_id' => 'required',
            'date' => 'required',
            'time' => 'required',
            'notes' => 'nullable|max:255',
        ]);

        //create tripping
        PropertyTripping::create([
            'property_id' => $validated['property_id'],
            'agent_id' => $validated['agent_id'],
            'buyer_id' => auth()->user()->id,
            'inquiry_id' => $validated['inquiry_id'],
            'visit_date' => $validated['date'],
            'visit_time' => $validated['time'],
            'broker_id' => $validated['broker_id'],
            'status' => 'pending',
            'notes' => $validated['notes'],
        ]);


        if (!empty($validated['agent_id'])) {
            $agent = User::find($validated['agent_id']);
            $property = Property::find($validated['property_id']);

            if ($agent) {
                $agent->notify(new TrippingRequest([
                    'buyer_name' => auth()->user()->name,
                    'property_title' => $property->title,
                ]));
            }
        } elseif (!empty($validated['broker_id'])) {
            $broker = User::find($validated['broker_id']);
            $property = Property::find($validated['property_id']);

            if ($broker) {
                $broker->notify(new TrippingRequest([
                    'buyer_name' => auth()->user()->name,
                    'property_title' => $property->title,
                ]));
            }
        }

        return redirect()->back()->with('success', 'Schedule tripping successfully.' );
    }
    public function update(Request $request, PropertyTripping $tripping)
    {
        // $this->authorize('update', $tripping); // <- enable if you have policies

        $data = $request->validate([
            'date'   => ['required', 'date', 'after_or_equal:today'],
            // allow H:i and normalize to H:i:s; validate both formats
            'time'   => ['required', function ($attr, $value, $fail) {
                if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value ?? '')) {
                    $fail('Time must be in HH:MM or HH:MM:SS format.');
                }
            }],
            'notes'  => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', Rule::in(['pending','accepted','scheduled','cancelled','done','declined'])],
        ]);

        // Normalize time to HH:MM:SS
        if (strlen($data['time']) === 5) {
            $data['time'] .= ':00';
        }

        // Working hours guard (09:00–18:00, inclusive)
        $hhmm = substr($data['time'], 0, 5);
        if ($hhmm < '09:00' || $hhmm > '18:00') {
            return back()->withErrors(['time' => 'Please choose a time between 09:00 and 18:00.'])->onlyInput();
        }

        // Prevent double-booking (same agent, same date, same time or full-day hold)
        $conflict = PropertyTripping::query()
            ->where('agent_id', $tripping->agent_id)
            ->where('visit_date', $data['date'])
            ->where('id', '!=', $tripping->id)
            ->whereNotIn('status', ['cancelled','declined'])
            ->where(function ($q) use ($data) {
                $q->whereNull('visit_time')
                    ->orWhere('visit_time', '00:00:00')  // full-day block
                    ->orWhere('visit_time', $data['time']);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['time' => 'Selected slot is already booked for the agent.'])->onlyInput();
        }

        $originalDate = $tripping->visit_date;
        $originalTime = $tripping->visit_time;

        // Apply updates
        $tripping->visit_date = $data['date'];
        $tripping->visit_time = $data['time'];
        if (array_key_exists('notes', $data)) {
            $tripping->notes = $data['notes'];
        }

        $rescheduled = ($originalDate !== $data['date']) || ($originalTime !== $data['time']);

        // If rescheduled and no explicit status, force back to pending to re-confirm
        if ($rescheduled && empty($data['status'])) {
            $tripping->status = 'pending';
        } elseif (!empty($data['status'])) {
            $tripping->status = $data['status'];
        }

        $tripping->save();

        return back()->with(
            'success',
            $rescheduled
                ? 'Visit updated and sent for confirmation.'
                : 'Visit details updated.'
        );
    }

}
