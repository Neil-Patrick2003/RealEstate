<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;

class AgentPerformance extends BaseWidget
{
    protected static ?string $heading = 'Top Agents (Last 30 Days)';
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $since = now()->subDays(30);

        return $table
            ->query(
                User::query()
                    ->where('role', 'agent')

                    // Listings KPIs (30d)
                    ->withCount([
                        'property_listings as published_count' => fn (Builder $q) =>
                        $q->where('status', 'Published')->where('created_at', '>=', $since),

                        'property_listings as sold_count' => fn (Builder $q) =>
                        $q->where('status', 'Sold')->where('created_at', '>=', $since),

                        'property_listings as total_count' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since),
                    ])

                    // Feedback rollups (30d)
                    ->withCount([
                        'feedbackAsReceiver as feedback_count' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since),
                    ])
                    ->withAvg(['feedbackAsReceiver as communication_avg'   => fn (Builder $q) => $q->where('created_at', '>=', $since)], 'communication')
                    ->withAvg(['feedbackAsReceiver as negotiation_avg'     => fn (Builder $q) => $q->where('created_at', '>=', $since)], 'negotiation')
                    ->withAvg(['feedbackAsReceiver as professionalism_avg' => fn (Builder $q) => $q->where('created_at', '>=', $since)], 'professionalism')
                    ->withAvg(['feedbackAsReceiver as knowledge_avg'       => fn (Builder $q) => $q->where('created_at', '>=', $since)], 'knowledge')

                    ->orderByDesc('sold_count')
                    ->orderByDesc('published_count')
                    ->limit(10)
            )
            ->columns([
                // Rank
                Tables\Columns\TextColumn::make('rank')
                    ->label('#')
                    ->rowIndex()
                    ->alignCenter()
                    ->width('48px'),

                // Avatar
                Tables\Columns\ImageColumn::make('photo_url')
                    ->label('')
                    ->disk('public')
                    ->visibility('public')
                    ->circular()
                    ->default('https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg')
                    ->width(36)
                    ->height(36),

                // Agent name + email
                Tables\Columns\TextColumn::make('name')
                    ->label('Agent')
                    ->weight('semibold')
                    ->description(fn (User $record) => $record->email, position: 'below')
                    ->wrap()
                    ->searchable(),

                // Listing metrics
                Tables\Columns\TextColumn::make('published_count')
                    ->label('Published')
                    ->badge()
                    ->color('info')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('sold_count')
                    ->label('Sold')
                    ->badge()
                    ->color('success')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_count')
                    ->label('Total')
                    ->badge()
                    ->color('gray')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('feedback_summary')
                    ->label('Feedback Summary')
                    ->getStateUsing(function (User $record) {
                        $count = (int) ($record->feedback_count ?? 0);

                        if ($count === 0) {
                            // Always return a string (or HtmlString) — not null.
                            return new HtmlString('<div class="text-gray-400 dark:text-gray-500 italic">No feedbacks</div>');
                        }

                        // Color helper
                        $color = static function (float $val): string {
                            return $val < 60 ? '#dc2626' : ($val < 80 ? '#f59e0b' : '#16a34a'); // red/amber/green
                        };

                        // 1–5 → %
                        $comm = $record->communication_avg   ? round($record->communication_avg * 20, 1)   : null;
                        $nego = $record->negotiation_avg     ? round($record->negotiation_avg * 20, 1)     : null;
                        $prof = $record->professionalism_avg ? round($record->professionalism_avg * 20, 1) : null;
                        $know = $record->knowledge_avg       ? round($record->knowledge_avg * 20, 1)       : null;

                        $parts = [];
                        if ($comm !== null) $parts[] = "<span style='color:{$color($comm)};'>Comm {$comm}%</span>";
                        if ($nego !== null) $parts[] = "<span style='color:{$color($nego)};'>Negot {$nego}%</span>";
                        if ($prof !== null) $parts[] = "<span style='color:{$color($prof)};'>Prof {$prof}%</span>";
                        if ($know !== null) $parts[] = "<span style='color:{$color($know)};'>Know {$know}%</span>";

                        $line = $parts ? implode(' • ', $parts) : '<span class="text-gray-400 dark:text-gray-500">No category data</span>';

                        return new HtmlString("
                            <div class='flex flex-col items-center justify-center'>
                                <span class='text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5'>
                                    {$count} Feedbacks
                                </span>
                                <span class='text-xs mt-1 text-center'>{$line}</span>
                            </div>
                        ");
                    })
                    ->html()
                    ->alignCenter(),


                // Overall feedback % badge
                Tables\Columns\BadgeColumn::make('overall_feedback_pct')
                    ->label('FB Overall')
                    ->state(function (User $record) {
                        $vals = array_filter([
                            $record->communication_avg,
                            $record->negotiation_avg,
                            $record->professionalism_avg,
                            $record->knowledge_avg,
                        ], static fn ($v) => $v !== null);

                        if (! $vals) {
                            return null;
                        }

                        $avg5 = array_sum($vals) / count($vals); // 1..5
                        return round($avg5 * 20, 1);            // → %
                    })
                    ->formatStateUsing(fn ($state) => $state === null ? '—' : "{$state}%")
                    ->color(fn ($state) => $state === null ? 'gray' : ($state < 60 ? 'danger' : ($state < 80 ? 'warning' : 'success')))
                    ->alignCenter()
                    ->sortable(),
            ])
            ->striped()
            ->defaultSort('sold_count', 'desc')
            ->paginated(false);
    }
}
