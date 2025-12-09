<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class TopTrippedProperties extends BaseWidget
{
    protected static ?string $heading = 'Most Tripped Properties';

    protected int|string|array $columnSpan = 'full';

    protected function getTableQuery(): Builder
    {
        return Property::query()
            ->withCount('trippings')
            ->orderByDesc('trippings_count');
    }

    protected function getTableColumns(): array
    {
        return [
            Tables\Columns\TextColumn::make('title')
                ->label('Property')
                ->searchable()
                ->limit(40),

            Tables\Columns\TextColumn::make('address')
                ->label('Location')
                ->searchable(),

            Tables\Columns\TextColumn::make('trippings_count')
                ->label('# of Trippings')
                ->sortable(),
        ];
    }
}
