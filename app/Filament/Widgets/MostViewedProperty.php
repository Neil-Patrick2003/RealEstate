<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class MostViewedProperty extends BaseWidget
{
    protected static ?string $heading = 'Top Viewed Properties';
    protected static ?int $sort = -40;
    protected static ?string $pollingInterval = '60s';

    protected function getTableQuery(): Builder|Relation|null
    {
        // Uses properties.view (total view count) and sorts by it
        return Property::query()
            ->select(['id', 'title', 'image_url', 'views'])
            ->orderByDesc('views');
    }

    public function getColumnSpan(): int|string|array
    {
        return 'full';
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Photo')
                    ->width(72)
                    ->height(54)
                    ->extraImgAttributes([
                        'class' => 'object-cover rounded-md border border-gray-200 dark:border-gray-700',
                    ])
                    ->toggleable(),

                Tables\Columns\TextColumn::make('title')
                    ->label('Property')
                    ->searchable()
                    ->limit(50)
                    ->wrap(),

                Tables\Columns\TextColumn::make('views')
                    ->label('Views')
                    ->sortable()
                    ->badge()
                    ->color('info'),
            ])
            ->defaultSort('views', 'desc')
            ->paginated([10])
            ->defaultPaginationPageOption(10)
            ->striped();
    }


}
