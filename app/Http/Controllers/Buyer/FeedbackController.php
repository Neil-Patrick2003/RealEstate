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


        $this->authorize('update', $deal);

        $data = $request->validate([
            'communication'   => 'nullable|integer|min:1|max:5',
            'negotiation'     => 'nullable|integer|min:1|max:5',
            'professionalism' => 'nullable|integer|min:1|max:5',
            'knowledge'       => 'nullable|integer|min:1|max:5',
            'comments'        => 'nullable|string|max:2000',
        ]);

        Feedback::create([
            'deal_id'  => $deal->id,
            'agent_id' => $request->agent_id,
            'sender_id'=> auth()->id(),// sender is buyer here
            ...$data,
        ]);

        return redirect()->route('deals.feedback.create', $deal)
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

