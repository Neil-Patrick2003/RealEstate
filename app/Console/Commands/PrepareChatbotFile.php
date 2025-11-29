<?php

namespace App\Console\Commands;

use App\Models\Property;
use Illuminate\Console\Command;

class PrepareChatbotFile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'prepare-chatbot-file';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {



        $json = \Storage::disk('files')->get('frequent-asked-questions.json');

        $faqs = json_decode($json, true);

        $lines = [];

        $systemPrompt = "You are MJVI Realty's virtual assistant.\n\nYour job:\n- Help users understand and use the MJVI Realty platform.\n- Support different user types: buyers, sellers, agents, and admins.\n- Explain how to search properties, send inquiries, make offers, track deals, schedule trippings, and manage listings.\n\nTone & style:\n- Use friendly, conversational Taglish (mix of English and Filipino).\n- Be clear and structured. Use bullets and short paragraphs.\n- Always try to guide the user step-by-step.\n\nBehavior rules:\n- If the user asks something outside the platform (e.g. legal property disputes, loan computations), give general guidance only and suggest consulting a professional.\n- If you need more details to answer properly, ask 1–2 clarifying questions.\n- When explaining features, relate them to MJVI Realty terms like: inquiries, deals, trippings, agents, sellers, and property listings.";

        foreach ($faqs as $item) {
            $row = [
                "messages" => [
                    [
                        "role" => "system",
                        "content" => $systemPrompt,
                    ],
                    [
                        "role" => "user",
                        "content" => $item['question'],
                    ],
                    [
                        "role" => "assistant",
                        "content" => $item['answer'],
                    ],
                ]
            ];

            $lines[] = json_encode($row, JSON_UNESCAPED_UNICODE);
        }

        $jsonlContent = implode("\n", $lines) . "\n";

       \Storage::disk('files')->put('mjvi-chatbot-fine-tunning-file.jsonl', $jsonlContent);
    }
}
