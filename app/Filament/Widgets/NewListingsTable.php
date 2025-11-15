<?php

namespace App\Filament\Widgets;

use App\Models\PropertyListing;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class NewListingsTable extends BaseWidget
{
    protected static ?string $heading = 'New Listings (Unassigned)';
    protected static ?int $sort = -18;
    protected static ?string $pollingInterval = '45s';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }


    /** v3 signature */
    protected function getTableQuery(): Builder|Relation|null
    {
        return PropertyListing::query()
            ->where('status', 'Unassigned')
            ->latest('created_at');
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

                // If your listing stores the label on a related Property, change to 'property.title'
                Tables\Columns\TextColumn::make('title')
                    ->label('Title')
                    ->limit(40)
                    ->searchable()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('status')
                    ->badge(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Added')
                    ->since(),
            ])
            ->actions([
                // Adjust these actions to your flow if "Unassigned" should first be assigned to an agent
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (PropertyListing $record): bool => $record->status !== 'Published')
                    ->action(fn (PropertyListing $record) => $record->update(['status' => 'Published'])),

                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (PropertyListing $record): bool => $record->status !== 'Rejected')
                    ->action(fn (PropertyListing $record) => $record->update(['status' => 'Rejected'])),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10);
    }
}
