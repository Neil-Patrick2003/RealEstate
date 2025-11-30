<?php

namespace App\Http\Controllers\Chat;

use App\Events\ChatChannelNewMessage;
use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, ChatChannel $channel)
    {
        $validated = $request->validate([
            'content' => ['nullable', 'string'],
            'file'    => ['nullable', 'file', 'max:10240'], // 10 MB
        ]);

        // Require at least text OR file
        if (!filled($validated['content'] ?? null) && !$request->hasFile('file')) {
            return response()->json([
                'message' => 'Message must have text or an attachment.',
            ], 422);
        }

        $data = [
            'content'   => $validated['content'] ?? null,
            'sender_id' => $request->user()->id,
        ];

        // If a file was sent, store it and attach metadata
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // storage/app/public/chat_attachments/...
            $path = $file->store('chat_attachments', 'public');

            $data['attachment_path'] = $path;
            $data['attachment_name'] = $file->getClientOriginalName();
            $data['attachment_mime'] = $file->getClientMimeType();
            $data['attachment_size'] = $file->getSize();
        }

        // Save message in this channel
        $message = $channel->messages()->create($data);

        // Broadcast to Reverb listeners
        ChatChannelNewMessage::dispatch($message);

        return response()->noContent();
    }
}
