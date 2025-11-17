<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Number;

class MostViewedProperty extends BaseWidget
{
    protected static ?string $heading = '🔥 Top Viewed Properties';
    protected static ?int $sort = -40;
    protected static ?string $pollingInterval = '60s';

    protected function getTableQuery(): Builder|Relation
    {
        return Property::query()
            ->select(['id', 'title', 'image_url', 'views', 'price', 'address', 'status'])
            ->withCount(['inquiries'])
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
                    ->label('RANK')
                    ->formatStateUsing(function ($state, $record, $rowLoop) {
                        // Simple rank based on row iteration
                        return '#' . $rowLoop->iteration;
                    })
                    ->size('sm')
                    ->weight('bold')
                    ->color('primary')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\ImageColumn::make('image_url')
                    ->label('PROPERTY')
                    ->width(80)
                    ->height(60)
                    ->disk('public')   // <-- important: use the disk that points to /storage
                    ->extraImgAttributes([
                        'class' => 'object-cover rounded-xl border-2 border-gray-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md',
                        'loading' => 'lazy',
                    ])
                    ->defaultImageUrl(asset('images/placeholder-property.jpg')),

                Tables\Columns\TextColumn::make('title')
                    ->label('TITLE')
                    ->searchable()
                    ->limit(40)
                    ->wrap()
                    ->weight('medium')
                    ->size('sm')
                    ->color('gray-800')
                    ->tooltip(function ($state) {
                        return strlen($state) > 40 ? $state : null;
                    }),

                Tables\Columns\TextColumn::make('address')
                    ->label('LOCATION')
                    ->limit(25)
                    ->size('sm')
                    ->color('gray-600')
                    ->icon('heroicon-o-map-pin')
                    ->iconColor('gray-400')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('price')
                    ->label('PRICE')
                    ->money('PHP')
                    ->size('sm')
                    ->weight('semibold')
                    ->color('success')
                    ->iconColor('success')
                    ->alignEnd(),

                Tables\Columns\TextColumn::make('views')
                    ->label('VIEWS')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => Number::format($state))
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state >= 1000 => 'success',
                        $state >= 500 => 'warning',
                        $state >= 100 => 'info',
                        default => 'gray',
                    })
                    ->icon('heroicon-o-eye')
                    ->iconPosition('after')
                    ->size('sm')
                    ->weight('bold')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('inquiries_count')
                    ->label('INQUIRIES')
                    ->badge()
                    ->color('primary')
                    ->icon('heroicon-o-envelope')
                    ->iconPosition('after')
                    ->size('sm')
                    ->alignCenter()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('STATUS')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'published', 'active' => 'success',
                        'sold', 'rented' => 'danger',
                        'pending' => 'warning',
                        'draft', 'inactive' => 'gray',
                        default => 'secondary',
                    })
                    ->formatStateUsing(fn ($state) => strtoupper($state))
                    ->size('xs')
                    ->alignCenter()
                    ->toggleable(),
            ])
            ->defaultSort('views', 'desc')
            ->paginated(8)
            ->defaultPaginationPageOption(8)
            ->striped()
            ->deferLoading()
            ->emptyStateHeading('No views yet')
            ->emptyStateDescription('Properties will appear here as they get views.')
            ->emptyStateIcon('heroicon-o-eye-slash')
            ->actions([
                Tables\Actions\Action::make('view')
                    ->label('')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->tooltip('View Details')
                    ->openUrlInNewTab(),
            ])
            ->recordClasses(fn (Property $record) => match (true) {
                $record->views >= 1000 => 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500',
                $record->views >= 500 => 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500',
                $record->views >= 100 => 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500',
                default => 'hover:bg-gray-50 border-l-4 border-l-gray-200',
            });
    }
}
