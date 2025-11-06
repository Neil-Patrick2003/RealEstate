<?php

namespace App\Filament\Widgets;

use App\Models\Feedback;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class RecentFeedbackTable extends BaseWidget
{
    protected static ?string $heading = 'Recent Feedback';
    protected static ?int $sort = -17;
    protected static ?string $pollingInterval = '60s';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }


    protected function getTableQuery(): Builder|Relation|null
    {
        return Feedback::query()
            ->with(['agent:id,name,email,photo_url', 'sender:id,name,email,photo_url'])
            ->latest('created_at');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                // 1️⃣ Agent rated
                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Agent')
                    ->description(fn(Feedback $record) => $record->agent?->email)
                    ->icon('heroicon-o-user')
                    ->wrap()
                    ->searchable(),

                // 2️⃣ Sender (reviewer)
                Tables\Columns\TextColumn::make('sender.name')
                    ->label('From')
                    ->description(fn(Feedback $record) => $record->sender?->email)
                    ->icon('heroicon-o-envelope')
                    ->wrap(),

                // 3️⃣ Rating (average of 4 fields)
                Tables\Columns\TextColumn::make('rating')
                    ->label('Rating')
                    ->state(function (Feedback $record): float {
                        $scores = [
                            $record->communication,
                            $record->negotiation,
                            $record->professionalism,
                            $record->knowledge,
                        ];
                        $valid = array_filter($scores, fn ($v) => !is_null($v));
                        return $valid ? round(array_sum($valid) / count($valid), 2) : 0.0;
                    })
                    ->badge()
                    ->color(fn ($state) => $state >= 4.5 ? 'success' : ($state >= 3 ? 'warning' : 'danger'))
                    ->formatStateUsing(fn ($state) => $state > 0 ? "{$state} ★" : '—'),

                // 4️⃣ Comment
                Tables\Columns\TextColumn::make('comments')
                    ->label('Comment')
                    ->limit(50)
                    ->wrap()
                    ->placeholder('—'),

                // 5️⃣ Date
                Tables\Columns\TextColumn::make('created_at')
                    ->label('When')
                    ->since()
                    ->sortable(),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10)
            ->emptyStateHeading('No feedback yet')
            ->striped();
    }
}
