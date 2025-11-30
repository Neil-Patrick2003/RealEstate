<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Feedback;
use App\Models\FeedbackCharacteristic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{

    public function create(Deal $deal)
    {
        $this->authorize('view', $deal);  // optional policy
        return Inertia::render('Feedback/Create', [
            'deal'  => $deal->only(['id','status']),
            'agent' => optional(optional($deal->propertyListing)->agent)?->only(['id','name','photo_url']),
            'property' => optional(optional($deal->propertyListing)->property)?->only(['id','title','image_url']),
        ]);
    }


    public function store(Request $request, Deal $deal)

    {


        $validated = $request->validate([

            'agent_id'       => ['nullable', 'integer'],
            'ratings.communication'   => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.negotiation'     => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.professionalism' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.knowledge'       => ['required', 'integer', 'min:1', 'max:5'],
            'characteristics'         => ['nullable', 'array'],
            'characteristics.*'       => ['string', 'max:255'],
            'comments'                => ['nullable', 'string', 'max:2000'],

        ]);



        $ratings = $validated['ratings'] ?? [];


        // 1️⃣ Create Feedback record
        $feedback = Feedback::create([
            'deal_id'      => $request->deal,
            'agent_id'     => $validated['agent_id'] ?? null,
            'sender_id'    => auth()->id(),
            'communication'   => $ratings['communication']   ?? null,
            'negotiation'     => $ratings['negotiation']     ?? null,
            'professionalism' => $ratings['professionalism'] ?? null,
            'knowledge'       => $ratings['knowledge']       ?? null,
            'comments'        => $validated['comments'] ?? null,
            'feedback_type'   => 'Agent Feedback',
        ]);


        // 2️⃣ Save characteristics in separate table
        if (!empty($validated['characteristics']) && is_array($validated['characteristics'])) {
            foreach ($validated['characteristics'] as $characteristic) {
                FeedbackCharacteristic::create([
                    'feedback_id'   => $feedback->id,   // IMPORTANT: feedback id, hindi deal id
                    'characteristic'=> $characteristic,
                ]);
            }
        }




        return redirect()
            ->back()
            ->with('success', 'Thanks for your feedback!');
    }




//    public function store(Request $request)
//    {
//
//        $data = $request->validate([
//            'transaction_id' => 'required|exists:deals,id',
//            'agent_id' => 'required|exists:users,id',
//            'ratings.communication' => 'required|integer|min:1|max:5',
//            'ratings.negotiation' => 'required|integer|min:1|max:5',
//            'ratings.professionalism' => 'required|integer|min:1|max:5',
//            'ratings.knowledge' => 'required|integer|min:1|max:5',
//            'characteristics' => 'required|array',
//            'characteristics.*' => 'string',
//            'comments' => 'nullable|string',
//        ]);
//
//
//        $feedback = Feedback::create([
//            'deal_id' => $data['transaction_id'],
//            'agent_id' => $data['agent_id'],
//            'communication' => $data['ratings']['communication'],
//            'negotiation' => $data['ratings']['negotiation'],
//            'professionalism' => $data['ratings']['professionalism'],
//            'knowledge' => $data['ratings']['knowledge'],
//            'comments' => $data['comments'] ?? null,
//            'sender_id' => auth()->id(),
//        ]);
//
//        foreach ($data['characteristics'] as $char) {
//            FeedbackCharacteristic::create([
//                'feedback_id' => $feedback->id,
//                'characteristic' => $char,
//            ]);
//        }
//
//        return redirect()->back()->with('success', 'Thank you for sharing your feedback with us!');
//    }

    private function authorize(string $string, Deal $deal)
    {
    }


}

