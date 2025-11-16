<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Number;

class AgentPerformance extends BaseWidget
{
    protected static ?string $heading = '🏆 Top Performing Agents (Last 30 Days)';
    protected static ?int $sort = -35;
    protected static ?string $pollingInterval = '120s';
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
                    ->label('RANK')
                    ->formatStateUsing(fn ($state, $record, $rowLoop) => '#' . $rowLoop->iteration)
                    ->size('sm')
                    ->weight('bold')
                    ->color('primary')
                    ->alignCenter()
                    ->width('60px'),

                // Avatar
                Tables\Columns\ImageColumn::make('photo_url')
                    ->label('')
                    ->disk('public')
                    ->visibility('public')
                    ->circular()
                    ->width(44)
                    ->height(44)
                    ->extraImgAttributes([
                        'class' => 'border-2 border-gray-100 shadow-sm',
                    ])
                    ->defaultImageUrl('https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg'),

                // Agent name + email
                Tables\Columns\TextColumn::make('name')
                    ->label('AGENT')
                    ->weight('semibold')
                    ->size('sm')
                    ->color('gray-800')
                    ->description(fn (User $record) => $record->email, position: 'below')
                    ->wrap()
                    ->searchable(),

                // Listing metrics
                Tables\Columns\TextColumn::make('published_count')
                    ->label('PUBLISHED')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-o-document-text')
                    ->iconPosition('after')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('sold_count')
                    ->label('SOLD')
                    ->badge()
                    ->color('success')
                    ->icon('heroicon-o-trophy')
                    ->iconPosition('after')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_count')
                    ->label('TOTAL')
                    ->badge()
                    ->color('gray')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->iconPosition('after')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('conversion_rate')
                    ->label('CONVERSION')
                    ->state(function (User $record): float {
                        return ($record->published_count > 0)
                            ? round(($record->sold_count / $record->published_count) * 100, 1)
                            : 0.0;
                    })
                    ->formatStateUsing(fn (float $state): string => $state . '%')
                    ->badge()
                    ->color(fn (float $state): string =>
                    $state >= 25 ? 'success' :
                        ($state >= 15 ? 'primary' :
                            ($state >= 8 ? 'warning' : 'danger'))
                    )
                    ->icon(fn (float $state): string =>
                    $state >= 25 ? 'heroicon-o-sparkles' :
                        ($state >= 15 ? 'heroicon-o-chart-bar' :
                            ($state >= 8 ? 'heroicon-o-arrow-trending-up' : 'heroicon-o-arrow-trending-down'))
                    )
                    ->alignCenter()
                    ->sortable(),

                // Fixed feedback column
                Tables\Columns\TextColumn::make('average_feedback')
                    ->label('FEEDBACK')
                    ->state(function (User $record) {
                        // Calculate average from all feedback categories
                        $vals = array_filter([
                            $record->communication_avg,
                            $record->negotiation_avg,
                            $record->professionalism_avg,
                            $record->knowledge_avg,
                        ], fn ($v) => $v !== null);

                        if (empty($vals)) {
                            return null;
                        }

                        $avg = array_sum($vals) / count($vals);
                        return [
                            'average' => $avg,
                            'count' => $record->feedback_count ?? 0
                        ];
                    })
                    ->formatStateUsing(function ($state) {
                        if (!$state) {
                            return new HtmlString('<div class="text-gray-400 text-xs italic">No feedback</div>');
                        }

                        $average = $state['average'];
                        $count = $state['count'];

                        // Convert 1-5 scale to stars
                        $filled = (int) floor($average);
                        $half = ($average - $filled) >= 0.5 ? 1 : 0;
                        $empty = 5 - ($filled + $half);

                        $stars = str_repeat('⭐', $filled)
                            . str_repeat('✨', $half)
                            . str_repeat('☆', $empty);

                        return new HtmlString("
                            <div class='flex flex-col items-center justify-center space-y-1'>
                                <div class='text-sm font-medium'>{$stars}</div>
                                <div class='text-xs text-gray-600'>
                                    " . number_format($average, 1) . " ({$count})
                                </div>
                            </div>
                        ");
                    })
                    ->html()
                    ->alignCenter()
                    ->sortable(query: function (Builder $query, string $direction) {
                        // Sort by average of all feedback categories
                        $query->orderByRaw('
                            (COALESCE(communication_avg, 0) +
                             COALESCE(negotiation_avg, 0) +
                             COALESCE(professionalism_avg, 0) +
                             COALESCE(knowledge_avg, 0)) /
                            GREATEST(1,
                                (communication_avg IS NOT NULL) +
                                (negotiation_avg IS NOT NULL) +
                                (professionalism_avg IS NOT NULL) +
                                (knowledge_avg IS NOT NULL)
                            ) ' . $direction
                        );
                    }),
            ])
            ->striped()
            ->deferLoading()
            ->defaultSort('sold_count', 'desc')
            ->paginated(false)
            ->emptyStateHeading('No agent performance data')
            ->emptyStateDescription('Agent performance will appear here as they complete deals and receive feedback.')
            ->emptyStateIcon('heroicon-o-user-group')
            ->recordClasses(fn (User $record) => match (true) {
                ($record->sold_count ?? 0) >= 10 => 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500',
                ($record->sold_count ?? 0) >= 5 => 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500',
                ($record->sold_count ?? 0) >= 1 => 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500',
                default => 'hover:bg-gray-50 border-l-4 border-l-gray-200',
            });
    }
}
