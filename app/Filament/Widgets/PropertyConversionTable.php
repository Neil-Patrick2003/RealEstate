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

class PropertyConversionTable extends BaseWidget
{
    protected static ?string $heading = 'Conversion Rate per Property';
    protected static ?int $sort = -38;

    protected function getTableQuery(): Builder|Relation|null
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
                DB::raw('COALESCE(iq.inquiries, 0) AS inquiries'),
                DB::raw('COALESCE(dl.deals,     0) AS deals'),
            ])
            ->orderByDesc(DB::raw('COALESCE(dl.deals,0)'));
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Property')
                    ->limit(40)
                    ->wrap()
                    ->searchable(),

                Tables\Columns\TextColumn::make('inquiries')
                    ->label('Inquiries')
                    ->sortable()
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('deals')
                    ->label('Deals')
                    ->sortable()
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('rate')
                    ->label('Rate')
                    ->state(fn (Property $record): float =>
                    ($record->inquiries ?? 0) > 0
                        ? round((($record->deals ?? 0) / $record->inquiries) * 100, 1)
                        : 0.0
                    )
                    ->formatStateUsing(fn (float $state): string => $state . '%')
                    ->badge()
                    ->color(fn (float $state): string =>
                    $state >= 20 ? 'success' : ($state >= 10 ? 'warning' : 'danger')
                    ),
            ])
            ->defaultSort('deals', 'desc')
            ->paginated([10])
            ->defaultPaginationPageOption(10)
            ->striped();
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
