<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AgentPerformance extends BaseWidget
{
    protected static ?string $heading = '🏆 Top Performing Agents (Last 30 Days)';
    protected static ?int $sort = -35;
    protected static ?string $pollingInterval = '120s';
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $since = now()->subDays(30);

        // Use sold_at if present; otherwise use updated_at (status change to Sold updates row)
        $soldDateColumn = Schema::hasColumn('property_listings', 'sold_at')
            ? 'sold_at'
            : 'updated_at';

        // ✅ Pivot table that stores agent ids
        // Change this if your actual table name is different (e.g. "proeprty_listng_agents")
        $pivotTable = 'property_listing_agents';

        // Pivot columns (auto-detect common names)
        $pivotAgentCol = Schema::hasColumn($pivotTable, 'agent_id')
            ? 'agent_id'
            : (Schema::hasColumn($pivotTable, 'user_id') ? 'user_id' : 'agent_id');

        $pivotListingCol = Schema::hasColumn($pivotTable, 'property_listing_id')
            ? 'property_listing_id'
            : (Schema::hasColumn($pivotTable, 'listing_id') ? 'listing_id' : 'property_listing_id');

        return $table
            ->query(
                User::query()
                    ->where('role', 'agent')

                    // Listings KPIs (30d)
                    ->withCount([
                        'propertyListings as published_count' => fn (Builder $q) =>
                        $q->where('status', 'Published')
                            ->where('created_at', '>=', $since),

                        // ✅ Fix: sold should be based on sold_at/updated_at, not created_at
                        'propertyListings as sold_count' => fn (Builder $q) =>
                        $q->where('status', 'Sold')
                            ->where($soldDateColumn, '>=', $since),

                        'propertyListings as total_count' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since),
                    ])

                    // ✅ FIX: Total sales must join pivot table, not property_listings.agent_id
                    ->addSelect([
                        'total_sales' => DB::table('property_listings as pl')
                            ->selectRaw("
                                COALESCE(
                                    SUM(
                                        CAST(
                                            REPLACE(REPLACE(COALESCE(p.price, 0), ',', ''), '₱', '')
                                        AS DECIMAL(15,2))
                                    ),
                                0)
                            ")
                            ->join("{$pivotTable} as pla", "pla.{$pivotListingCol}", '=', 'pl.id')
                            ->join('properties as p', 'pl.property_id', '=', 'p.id')
                            ->whereColumn("pla.{$pivotAgentCol}", 'users.id')
                            ->where('pl.status', 'Sold')
                            ->where("pl.{$soldDateColumn}", '>=', $since),
                    ])

                    // Feedback rollups (30d)
                    ->withCount([
                        'feedbackAsReceiver as feedback_count' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since),
                    ])
                    ->withAvg(
                        ['feedbackAsReceiver as communication_avg' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since)],
                        'communication'
                    )
                    ->withAvg(
                        ['feedbackAsReceiver as negotiation_avg' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since)],
                        'negotiation'
                    )
                    ->withAvg(
                        ['feedbackAsReceiver as professionalism_avg' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since)],
                        'professionalism'
                    )
                    ->withAvg(
                        ['feedbackAsReceiver as knowledge_avg' => fn (Builder $q) =>
                        $q->where('created_at', '>=', $since)],
                        'knowledge'
                    )

                    ->orderByDesc('sold_count')
                    ->orderByDesc('published_count')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('rank')
                    ->label('RANK')
                    ->formatStateUsing(fn ($state, $record, $rowLoop) => '#' . $rowLoop->iteration)
                    ->size('sm')
                    ->weight('bold')
                    ->color('primary')
                    ->alignCenter()
                    ->width('60px'),

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

                Tables\Columns\TextColumn::make('name')
                    ->label('AGENT')
                    ->weight('semibold')
                    ->size('sm')
                    ->color('gray-800')
                    ->description(fn (User $record) => $record->email, position: 'below')
                    ->wrap()
                    ->searchable(),

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

                Tables\Columns\TextColumn::make('total_sales')
                    ->label('TOTAL SALES')
                    ->state(fn (User $record) => $record->total_sales ?? 0)
                    ->formatStateUsing(fn ($state) => '₱' . number_format((float) $state, 0))
                    ->badge()
                    ->color('success')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('conversion_rate')
                    ->label('CONVERSION')
                    ->state(function (User $record): float {
                        $published = (float) ($record->published_count ?? 0);
                        $sold = (float) ($record->sold_count ?? 0);

                        return $published > 0
                            ? round(($sold / $published) * 100, 1)
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

                Tables\Columns\TextColumn::make('average_feedback')
                    ->label('FEEDBACK')
                    ->state(function (User $record) {
                        $vals = array_filter([
                            $record->communication_avg,
                            $record->negotiation_avg,
                            $record->professionalism_avg,
                            $record->knowledge_avg,
                        ], fn ($v) => $v !== null);

                        if (empty($vals)) {
                            return new HtmlString('<div class="text-gray-400 text-xs italic">No feedback</div>');
                        }

                        $avg = array_sum($vals) / count($vals);
                        $count = (int) ($record->feedback_count ?? 0);

                        $filled = (int) floor($avg);
                        $half = ($avg - $filled) >= 0.5 ? 1 : 0;
                        $empty = 5 - ($filled + $half);

                        $stars = str_repeat('⭐', $filled)
                            . str_repeat('✨', $half)
                            . str_repeat('☆', $empty);

                        return new HtmlString("
                            <div class='flex flex-col items-center justify-center space-y-1'>
                                <div class='text-sm font-medium'>{$stars}</div>
                                <div class='text-xs text-gray-600'>
                                    " . number_format($avg, 1) . " ({$count})
                                </div>
                            </div>
                        ");
                    })
                    ->html()
                    ->alignCenter()
                    ->sortable(query: function (Builder $query, string $direction) {
                        $query->orderByRaw('
                            (COALESCE(communication_avg, 0) +
                             COALESCE(negotiation_avg, 0) +
                             COALESCE(professionalism_avg, 0) +
                             COALESCE(knowledge_avg, 0)) /
                            GREATEST(
                                1,
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
                ($record->sold_count ?? 0) >= 10 =>
                'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500',
                ($record->sold_count ?? 0) >= 5 =>
                'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500',
                ($record->sold_count ?? 0) >= 1 =>
                'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500',
                default =>
                'hover:bg-gray-50 border-l-4 border-l-gray-200',
            });
    }
}
