<?php

namespace App\Filament\Resources\DeveloperAmenityResource\RelationManagers;

use App\Models\Amenity;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AmenitiesRelationManager extends RelationManager
{
    protected static string $relationship = 'amenities';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('amenity_id')
                    ->label('Amenity')
                    ->options(Amenity::all()->pluck('name', 'id'))
                    ->searchable()
                    ->preload()
                    ->required()
                    ->columnSpanFull(),

                Forms\Components\TextInput::make('distance')
                    ->label('Distance (meters)')
                    ->numeric()
                    ->minValue(0)
                    ->suffix('meters')
                    ->helperText('Distance from the property in meters'),

                Forms\Components\TextInput::make('walking_time')
                    ->label('Walking Time')
                    ->numeric()
                    ->minValue(0)
                    ->suffix('minutes')
                    ->helperText('Approximate walking time in minutes'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Amenity Name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),

                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'education' => '🎓 Education',
                        'healthcare' => '🏥 Healthcare',
                        'transportation' => '🚗 Transportation',
                        'shopping' => '🛍️ Shopping',
                        'recreation' => '⚽ Recreation',
                        'dining' => '🍽️ Dining',
                        'financial' => '💰 Financial',
                        'religious' => '⛪ Religious',
                        default => $state
                    })
                    ->colors([
                        'primary' => 'education',
                        'success' => 'healthcare',
                        'warning' => 'transportation',
                        'info' => 'shopping',
                        'gray' => 'recreation',
                        'danger' => 'dining',
                        'secondary' => 'financial',
                    ])
                    ->sortable(),

                Tables\Columns\TextColumn::make('pivot.distance')
                    ->label('Distance')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state) . ' meters' : 'N/A')
                    ->sortable()
                    ->alignCenter()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('pivot.walking_time')
                    ->label('Walking Time')
                    ->formatStateUsing(fn ($state) => $state ? $state . ' mins' : 'N/A')
                    ->sortable()
                    ->alignCenter()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(50)
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Added')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Amenity Type')
                    ->options([
                        'education' => 'Education',
                        'healthcare' => 'Healthcare',
                        'transportation' => 'Transportation',
                        'shopping' => 'Shopping',
                        'recreation' => 'Recreation',
                        'dining' => 'Dining',
                        'financial' => 'Financial',
                        'religious' => 'Religious',
                    ])
                    ->multiple(),
            ])
            ->headerActions([
                Tables\Actions\AttachAction::make()
                    ->label('Add Amenity')
                    ->icon('heroicon-o-plus')
                    ->form(fn (Tables\Actions\AttachAction $action): array => [
                        $action->getRecordSelect()
                            ->options(Amenity::all()->pluck('name', 'id'))
                            ->label('Amenity')
                            ->required(),

                    ]),
            ])
            ->actions([


                Tables\Actions\DetachAction::make()
                    ->icon('heroicon-o-trash')
                    ->color('danger'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DetachBulkAction::make()
                        ->label('Detach Selected')
                        ->icon('heroicon-o-trash'),

                    Tables\Actions\BulkAction::make('updateDistance')
                        ->label('Update Distance')
                        ->icon('heroicon-o-map-pin')
                        ->form([
                            Forms\Components\TextInput::make('distance')
                                ->label('Distance (meters)')
                                ->numeric()
                                ->minValue(0)
                                ->required(),
                        ])
                        ->action(function ($records, array $data) {
                            foreach ($records as $record) {
                                $this->getRelationship()->updateExistingPivot($record->id, [
                                    'distance' => $data['distance']
                                ]);
                            }
                        }),
                ]),
            ])
            ->emptyStateHeading('No amenities attached')
            ->emptyStateDescription('Add amenities to show location advantages for this developer.')
            ->emptyStateIcon('heroicon-o-map-pin')
            ->emptyStateActions([
                Tables\Actions\AttachAction::make()
                    ->label('Add First Amenity')
                    ->icon('heroicon-o-plus')
                    ->form(fn (Tables\Actions\AttachAction $action): array => [
                        $action->getRecordSelect()
                            ->options(Amenity::all()->pluck('name', 'id'))
                            ->label('Amenity')
                            ->required(),

                        Forms\Components\TextInput::make('distance')
                            ->label('Distance (meters)')
                            ->numeric()
                            ->minValue(0)
                            ->suffix('meters'),

                        Forms\Components\TextInput::make('walking_time')
                            ->label('Walking Time')
                            ->numeric()
                            ->minValue(0)
                            ->suffix('minutes'),
                    ]),
            ])
            ->deferLoading();
    }
}
