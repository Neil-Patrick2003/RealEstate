<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'message'       => 'required|string',
            'session_token' => 'nullable|string',
        ]);

        $userMessage  = $request->input('message');
        $sessionToken = $request->input('session_token');

        // 1) Create or get session (with 2-hour reset)
        $session = $this->getOrCreateSession($sessionToken);

        $messages = [];

        $systemPrompt = <<<EOT
You are MJVI Realty's virtual assistant.

- You know how the MJVI platform works (starting, listing properties, searching, inquiries, deals, etc.).
- You receive a JSON list of properties from the database.
- For how-to / FAQ questions: explain clearly in Taglish, friendly, MJVI-specific.
- For property search questions: use ONLY the provided properties JSON to recommend up to 3 properties.

Always answer in this JSON shape:

{
  "message": "human-readable reply in Taglish.",
  "recommended_property_ids": [1, 2, 3]
}

If no property fits, set "recommended_property_ids": [].
EOT;

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'user',
            'content'         => $userMessage,
            'meta'            => null,
        ]);

        $historyMessages = $session->messages()
            ->orderBy('created_at', 'asc')
            ->take(100)
            ->get()
            ->map(fn ($m) => [
                'role'    => $m->role,
                'content' => $m->content,
            ])
            ->toArray();

        $messages[] = [
            'role'    => 'system',
            'content' => $systemPrompt,
        ];

        $properties = Property::where('status', 'Published')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'address' => $property->address,
                    'type' => $property->type,
                    'sub_type' => $property->sub_type,
                    'price' => $property->price,
                    'lot_area' => $property->lot_area,
                    'floor_area' => $property->floor_area,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'car_slots' => $property->car_slots,
                    'image_url' => $property->image_url,
                ];
            })
            ->values()
            ->toArray();

        $messages[] = [
            'role'    => 'system',
            'content' => 'Property catalog (JSON): ' . json_encode($properties),
        ];

        foreach ($historyMessages as $msg) {
            $messages[] = $msg;
        }

        $messages[] = [
            'role'    => 'user',
            'content' => $userMessage,
        ];

        $openaiResponse = Http::withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'           => config('services.openai.model'),
                'messages'        => $messages,
                'temperature'     => 0.4,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $openaiResponse->successful()) {
            return response()->json([
                'error'   => 'OpenAI error',
                'details' => $openaiResponse->json(),
            ], 500);
        }

        $raw    = $openaiResponse->json('choices.0.message.content');
        $parsed = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $parsed = [
                'message'                  => $raw,
                'recommended_property_ids' => [],
            ];
        }

        $assistantText = $parsed['message'] ?? '';
        $recommendedIds = collect($parsed['recommended_property_ids'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        // 7) Save assistant message
        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'assistant',
            'content'         => $assistantText,
            'meta'            => [
                'recommended_property_ids' => $recommendedIds,
            ],
        ]);

        // 8) Get properties for preview
        $recommendedProps = [];
        if (! empty($recommendedIds)) {
            $recommendedProps = Property::whereIn('id', $recommendedIds)->get();
        }

        // 9) Update last activity
        $session->update(['last_activity_at' => now()]);

        return response()->json([
            'session_token'          => $session->session_token,
            'message'                => $assistantText,
            'recommended_properties' => $recommendedProps,
        ]);
    }

    protected function getOrCreateSession(?string $sessionToken): ChatSession
    {
        // if session_token provided, try to find it
        $session = null;

        if ($sessionToken) {
            $session = ChatSession::where('session_token', $sessionToken)->first();
        }

        // if found, check for 2-hour inactivity → reset conversation
        if ($session) {
            $inactiveFor = $session->last_activity_at
                ? $session->last_activity_at->diffInMinutes(now())
                : null;

            if ($inactiveFor !== null && $inactiveFor >= 120) {
                $session->messages()->delete();
                $session->delete();
                $session = null;
            }
        }

        // create new session if none
        if (! $session) {
            $session = ChatSession::create([
                'session_token'  => $sessionToken ?: Str::orderedUuid()->toString(),
                'last_activity_at'=> now(),
            ]);
        }

        return $session->load('messages');
    }
}
