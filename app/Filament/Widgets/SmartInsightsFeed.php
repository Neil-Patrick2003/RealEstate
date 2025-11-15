<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Storage;

class SmartInsightsFeed extends Widget
{
    protected static ?string $heading = 'Smart Insights';
    protected static ?int $sort = -20;
    protected static string $view = 'filament.widgets.smart-insights-feed';
    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }
    protected static ?string $pollingInterval = '60s'; // file updated hourly by your job

    protected function getViewData(): array
    {
        $path = 'insights_feed.json'; // storage/app/insights_feed.json
        $items = [];

        if (Storage::disk('local')->exists($path)) {
            $raw = json_decode(Storage::disk('local')->get($path), true);
            if (is_array($raw)) $items = array_values($raw);
        }

        return ['items' => $items];
    }
}
