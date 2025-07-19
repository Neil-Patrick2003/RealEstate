<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FeedbackCharacteristic;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {



        $data = $request->validate([
            'transaction_id' => 'required|exists:deals,id',
            'agent_id' => 'required|exists:users,id',
            'ratings.communication' => 'required|integer|min:1|max:5',
            'ratings.negotiation' => 'required|integer|min:1|max:5',
            'ratings.professionalism' => 'required|integer|min:1|max:5',
            'ratings.knowledge' => 'required|integer|min:1|max:5',
            'characteristics' => 'required|array',
            'characteristics.*' => 'string',
            'comments' => 'nullable|string',
        ]);


        $feedback = Feedback::create([
            'deal_id' => $data['transaction_id'],
            'agent_id' => $data['agent_id'],
            'communication' => $data['ratings']['communication'],
            'negotiation' => $data['ratings']['negotiation'],
            'professionalism' => $data['ratings']['professionalism'],
            'knowledge' => $data['ratings']['knowledge'],
            'comments' => $data['comments'] ?? null,
        ]);

        foreach ($data['characteristics'] as $char) {
            FeedbackCharacteristic::create([
                'feedback_id' => $feedback->id,
                'characteristic' => $char,
            ]);
        }

        return redirect()->back()->with('success', 'Thank you for sharing your feedback with us!');
    }



}
