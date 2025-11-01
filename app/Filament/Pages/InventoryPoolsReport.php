<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use App\Models\InventoryPool;

class InventoryPoolsReport extends Page implements Tables\Contracts\HasTable
{
    use Tables\Concerns\InteractsWithTable;

    protected static ?string $navigationIcon  = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?string $title           = 'Inventory Pools';
    protected static ?string $navigationLabel = 'Inventory Pools';

    protected static string $view = 'filament.pages.InventoryPoolsReport'; // simple view

    public function table(Table $table): Table
    {
        return $table
            ->query($this->query())
            ->defaultSort('projects.name')
            ->columns([
                Tables\Columns\TextColumn::make('developer_name')
                    ->label('Developer')
                    ->sortable()->searchable(),
                Tables\Columns\TextColumn::make('project_name')
                    ->label('Project')
                    ->sortable()->searchable()->weight('semibold'),

                Tables\Columns\TextColumn::make('block_code')
                    ->label('Block/Tower')
                    ->sortable()->toggleable(),

                Tables\Columns\TextColumn::make('house_type')
                    ->label('House Type')
                    ->sortable()->searchable(),

                Tables\Columns\TextColumn::make('total')
                    ->numeric()->sortable()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()),

                Tables\Columns\TextColumn::make('held')
                    ->numeric()->sortable()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()),

                Tables\Columns\TextColumn::make('reserved')
                    ->numeric()->sortable()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()),

                Tables\Columns\TextColumn::make('sold')
                    ->numeric()->sortable()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()),

                Tables\Columns\TextColumn::make('available')
                    ->label('Available')
                    ->getStateUsing(fn ($record) =>
                        (int)$record->total - (int)$record->held - (int)$record->reserved - (int)$record->sold
                    )
                    ->numeric()
                    ->sortable()
                    ->color(fn ($state) => $state <= 0 ? 'danger' : ($state <= 3 ? 'warning' : 'success'))
                    ->summarize(
                        Tables\Columns\Summarizers\Summarizer::make()
                            ->label('Total Available')
                            ->using(function (Tables\Columns\Summarizers\Summarizer $summarizer, \Illuminate\Support\Collection $records) {
                                return $records->sum(fn ($r) =>
                                    (int)$r->total - (int)$r->held - (int)$r->reserved - (int)$r->sold
                                );
                            })
                    ),


            ])
//            ->filters([
//                Tables\Filters\SelectFilter::make('developer_id')
//                    ->label('Developer')
//                    ->options(\App\Models\Developer::query()->pluck('name','id'))
//                    ->query(fn (Builder $q, $value) => $q->where('projects.developer_id', $value)),
//
//                Tables\Filters\SelectFilter::make('project_id')
//                    ->label('Project')
//                    ->options(\App\Models\Project::query()->pluck('name','id'))
//                    ->query(fn (Builder $q, $value) => $q->where('inventory_pools.project_id', $value)),
//
//                Tables\Filters\SelectFilter::make('block_id')
//                    ->label('Block/Tower')
//                    ->options(
//                        \App\Models\Block::query()
//                            ->orderBy('block_code')
//                            ->pluck('block_code', 'id')
//                    )
//                    ->query(fn ($q, $value) => $q->where('inventory_pools.block_id', $value))
//
//        ])
            ->paginated(true);
    }

    private function query(): Builder
    {
        // Join to show nice names
        return InventoryPool::query()
            ->selectRaw('
                inventory_pools.*,
                developers.name as developer_name,
                projects.name as project_name,
                blocks.block_code as block_code,
                CONCAT(house_types.code, " - ", house_types.name) as house_type,
                projects.developer_id as developer_id
            ')
            ->leftJoin('projects', 'projects.id', '=', 'inventory_pools.project_id')
            ->leftJoin('developers', 'developers.id', '=', 'projects.developer_id')
            ->leftJoin('blocks', 'blocks.id', '=', 'inventory_pools.block_id')
            ->leftJoin('house_types', 'house_types.id', '=', 'inventory_pools.house_type_id');
    }
}
