<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class SmsClient
{
    public function send(string $to, string $message): void
    {
        $to = $this->formatPHMobile($to);
        $provider = config('sms.provider', 'infotxt');

        match ($provider) {
            'infotxt'   => $this->sendViaInfoTxt($to, $message),
            'semaphore' => $this->sendViaSemaphore($to, $message),
            default     => throw new RuntimeException("Unknown SMS provider: {$provider}"),
        };
    }

    protected function http()
    {
        return Http::timeout((int) config('sms.timeout', 15))
            ->retry(2, 500)
            ->acceptJson();
    }

    /* ========= InfoTXT ========= */

    protected function sendViaInfoTxt(string $to, string $message): void
    {
        $res = $this->http()->get(config('sms.infotxt.url'), [
            'SMS'    => $message,
            'ApiKey' => config('sms.infotxt.key'),
            'Mobile' => $to,
            'UserID' => config('sms.infotxt.user_id'),
        ]);

        if (!$res->ok()) {
            throw new RuntimeException("InfoTXT HTTP error: ".$res->body());
        }
    }

    /* ========= Semaphore ========= */

    protected function sendViaSemaphore(string $to, string $message): void
    {
        $payload = [
            'apikey'  => config('sms.semaphore.key'),
            'number'  => $to, // NOW 09XXXXXXXXX
            'message' => $message,
        ];

        if ($sender = config('sms.semaphore.sender')) {
            $payload['sendername'] = $sender;
        }

        $res = $this->http()->asForm()->post(config('sms.semaphore.url'), $payload);

        if (!$res->ok()) {
            throw new RuntimeException("Semaphore HTTP error: ".$res->body());
        }

        $json = $res->json();
        if (is_array($json) && isset($json['error']) && $json['error']) {
            throw new RuntimeException("Semaphore send failed: ".json_encode($json));
        }
        if (!is_array($json)) {
            throw new RuntimeException("Semaphore unexpected response: ".json_encode($json));
        }
    }

    /* ========= Phone Sanitizer (09 format) ========= */

    protected function formatPHMobile(string $raw): string
    {
        // Remove all non-digits
        $digits = preg_replace('/\D+/', '', $raw ?? '');

        // If already correct 09XXXXXXXXX, return as is
        if (preg_match('/^09\d{9}$/', $digits)) {
            return $digits;
        }

        // If number starts with 639, convert to 09
        if (preg_match('/^639(\d{9})$/', $digits, $m)) {
            return '09'.$m[1];
        }

        // If number starts with +639, convert to 09
        if (preg_match('/^\+639(\d{9})$/', $raw, $m)) {
            return '09'.$m[1];
        }

        // Otherwise return raw digits (your provider may reject it but we won't change it)
        return $digits;
    }
}
