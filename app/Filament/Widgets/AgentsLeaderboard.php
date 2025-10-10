<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class AgentsLeaderboard extends BaseWidget
{
    protected static ?string $heading = 'Agents Leaderboard (Last 30d)';

    protected function getTableQuery(): Builder
    {
        return User::query()
            ->where('role', 'agent')
            ->withCount([
                'property_listings as published_count' => fn ($query) =>
                $query->where('status', 'Published')
                    ->where('created_at', '>=', now()->subDays(30)),

                'property_listings as total_count' => fn ($query) =>
                $query->where('created_at', '>=', now()->subDays(30)),

                'property_listings as sold_count' => fn ($query) =>
                $query->where('status', 'Sold')
                    ->where('created_at', '>=', now()->subDays(30)),

            ])

            ->orderByDesc('published_count')
            ->limit(10);
    }

    protected function getTableColumns(): array
    {
        return [
            Tables\Columns\TextColumn::make('name')->label('Agent')->searchable(),
            Tables\Columns\TextColumn::make('published_count')->label('Published')->badge()->sortable(),
            Tables\Columns\TextColumn::make('sold_count')->label('Sold')->badge()->sortable(),
            Tables\Columns\TextColumn::make('total_count')->label('Assigned')->badge()->sortable(),
            Tables\Columns\TextColumn::make('email')->toggleable(),
        ];
    }

}
