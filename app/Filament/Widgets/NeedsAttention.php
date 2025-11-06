<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class NeedsAttention extends BaseWidget
{
    protected static ?string $heading = 'Needs Attention (Draft/Pending)';
    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 1, 'xl' => 3];
    }

    protected function getTableQuery(): Builder
    {
        return Property::query()
            ->whereIn('status', ['Unassigned', 'Pending'])
            ->with(['property_listing.agents', 'property_listing.property'])
            ->latest();
    }

    protected function getTableColumns(): array
    {
        return [
            Tables\Columns\TextColumn::make('title')
                ->label('Title')
                ->limit(40)
                ->searchable(),

            Tables\Columns\BadgeColumn::make('status')
                ->label('Status')
                ->colors([
                    'warning' => 'Pending',
                    'gray'    => 'Unassigned',
                ])
                ->sortable(),

            Tables\Columns\TextColumn::make('property_listing.agents.name')
                ->label('Agents')
                ->limitList(3)
                ->expandableLimitedList(),

            Tables\Columns\TextColumn::make('created_at')
                ->label('Created')
                ->dateTime('M d, Y h:i A'),
        ];
    }
}
