<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Number;

class PropertyConversionTable extends BaseWidget
{
    protected static ?string $heading = '🏆 Property Conversion Performance';
    protected static ?int $sort = -38;
    protected static ?string $pollingInterval = '120s';

    protected function getTableQuery(): Builder|Relation
    {
        // Deals via property_listings → properties
        $deals = DB::table('deals as d')
            ->join('property_listings as pl', 'pl.id', '=', 'd.property_listing_id')
            ->selectRaw('pl.property_id, COUNT(*) AS deals')
            ->groupBy('pl.property_id');

        // Inquiries per property (prefer property_listing_id; fallback to property_id)
        if (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'property_listing_id')) {
            $inq = DB::table('inquiries as iq')
                ->join('property_listings as ipl', 'ipl.id', '=', 'iq.property_listing_id')
                ->selectRaw('ipl.property_id, COUNT(*) AS inquiries')
                ->groupBy('ipl.property_id');
        } elseif (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'property_id')) {
            $inq = DB::table('inquiries as iq')
                ->selectRaw('iq.property_id, COUNT(*) AS inquiries')
                ->whereNotNull('iq.property_id')
                ->groupBy('iq.property_id');
        } else {
            // no usable mapping → empty
            $inq = DB::query()->fromRaw('(SELECT NULL AS property_id, 0 AS inquiries) AS _empty')
                ->whereRaw('1=0');
        }

        return Property::query()
            ->leftJoinSub($inq,  'iq', 'iq.property_id',  '=', 'properties.id')
            ->leftJoinSub($deals,'dl', 'dl.property_id',  '=', 'properties.id')
            ->addSelect([
                'properties.id',
                'properties.title',
                'properties.price',
                'properties.address',
                'properties.image_url',
                DB::raw('COALESCE(iq.inquiries, 0) AS inquiries'),
                DB::raw('COALESCE(dl.deals,     0) AS deals'),
            ])
            ->where(function ($query) {
                $query->where('iq.inquiries', '>', 0)
                    ->orWhere('dl.deals', '>', 0);
            })
            ->orderByDesc(DB::raw('COALESCE(dl.deals,0)'));
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('RANK')
                    ->formatStateUsing(fn ($state, $record, $rowLoop) => '#' . $rowLoop->iteration)
                    ->size('sm')
                    ->weight('bold')
                    ->color('primary')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\ImageColumn::make('image_url')
                    ->label('')
                    ->width(60)
                    ->height(45)
                    ->disk('public')
                    ->extraImgAttributes([
                        'class' => 'object-cover rounded-lg border-2 border-gray-100 shadow-sm',
                        'loading' => 'lazy',
                    ])
                    ->defaultImageUrl(asset('images/placeholder-property.jpg')),

                Tables\Columns\TextColumn::make('title')
                    ->label('PROPERTY')
                    ->limit(35)
                    ->wrap()
                    ->weight('medium')
                    ->size('sm')
                    ->color('gray-800')
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $title = $column->getState();
                        return strlen($title) > 35 ? $title : null;
                    })
                    ->searchable(),

                Tables\Columns\TextColumn::make('location')
                    ->label('LOCATION')
                    ->limit(20)
                    ->size('sm')
                    ->color('gray-600')
                    ->icon('heroicon-o-map-pin')
                    ->iconColor('gray-400')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('price')
                    ->label('PRICE')
                    ->money('USD')
                    ->size('sm')
                    ->weight('semibold')
                    ->color('success')
                    ->icon('heroicon-o-currency-dollar')
                    ->iconColor('success')
                    ->alignEnd()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('inquiries')
                    ->label('INQUIRIES')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => Number::format($state))
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-o-envelope')
                    ->iconPosition('after')
                    ->size('sm')
                    ->weight('medium')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('deals')
                    ->label('DEALS')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => Number::format($state))
                    ->badge()
                    ->color('success')
                    ->icon('heroicon-o-check-badge')
                    ->iconPosition('after')
                    ->size('sm')
                    ->weight('bold')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('rate')
                    ->label('CONVERSION RATE')
                    ->state(fn (Property $record): float =>
                    ($record->inquiries ?? 0) > 0
                        ? round((($record->deals ?? 0) / $record->inquiries) * 100, 1)
                        : 0.0
                    )
                    ->formatStateUsing(fn (float $state): string => $state . '%')
                    ->badge()
                    ->color(fn (float $state): string =>
                    $state >= 25 ? 'success' :
                        ($state >= 15 ? 'primary' :
                            ($state >= 8 ? 'warning' : 'danger'))
                    )
                    ->icon(fn (float $state): string =>
                    $state >= 25 ? 'heroicon-o-trophy' :
                        ($state >= 15 ? 'heroicon-o-sparkles' :
                            ($state >= 8 ? 'heroicon-o-chart-bar' : 'heroicon-o-exclamation-triangle'))
                    )
                    ->iconPosition('after')
                    ->size('sm')
                    ->weight('bold')
                    ->alignCenter()
                    ->sortable(),
            ])
            ->defaultSort('deals', 'desc')
            ->paginated(8)
            ->defaultPaginationPageOption(8)
            ->striped()
            ->deferLoading()
            ->emptyStateHeading('No conversion data available')
            ->emptyStateDescription('Properties will appear here as they get inquiries and deals.')
            ->emptyStateIcon('heroicon-o-chart-bar')
            ->emptyStateActions([
                Tables\Actions\Action::make('create')
                    ->label('Add Property')
                    ->icon('heroicon-o-plus')
                    ->button(),
            ])

            ->recordAction(null)
            ->recordClasses(fn (Property $record) => match (true) {
                ($record->deals ?? 0) >= 10 => 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500',
                ($record->deals ?? 0) >= 5 => 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500',
                ($record->deals ?? 0) >= 1 => 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-500',
                default => 'hover:bg-gray-50 border-l-4 border-l-gray-200',
            });
    }

    public function getColumnSpan(): int|string|array
    {
        return 'full';
    }

    /** ========== PERFORMANCE INTERPRETATION ========== */
    private function getPerformanceInterpretation(float $conversionRate, int $deals): string
    {
        if ($deals >= 10 && $conversionRate >= 25) return 'Top Performer';
        if ($deals >= 5 && $conversionRate >= 15) return 'Strong Performer';
        if ($deals >= 3 && $conversionRate >= 8) return 'Good Performer';
        if ($deals >= 1) return 'Active Property';
        return 'Needs Attention';
    }
}
