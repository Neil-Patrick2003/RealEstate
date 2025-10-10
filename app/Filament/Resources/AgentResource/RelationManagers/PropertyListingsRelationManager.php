<?php

namespace App\Filament\Resources\AgentResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class PropertyListingsRelationManager extends RelationManager
{
    protected static string $relationship = 'property_listings';
    protected static ?string $title = 'Property Listings';

    public function table(Table $table): Table
    {
        return $table
            // Eager-load the nested relation(s) used in columns
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['property']))

            ->columns([
                // Thumbnail (robust URL resolver)
                Tables\Columns\ImageColumn::make('property.image_url')
                    ->label('Photo')
                    ->getStateUsing(function ($record) {
                        $raw = $record->property?->image_url;

                        if (empty($raw)) {
                            return 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg';
                        }

                        // If already absolute URL:
                        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                            return $raw;
                        }

                        // If saved as '/storage/...' or 'storage/...'
                        if (str_starts_with($raw, '/storage') || str_starts_with($raw, 'storage')) {
                            return asset(ltrim($raw, '/'));
                        }

                        // Else: treat as public disk path (e.g. 'properties/foo.jpg')
                        return Storage::disk('public')->url($raw);
                    })
                    ->width(64)
                    ->height(48)
                    ->extraImgAttributes(['class' => 'object-cover rounded-md border border-gray-200 dark:border-gray-700']),

                // Title
                Tables\Columns\TextColumn::make('property.title')
                    ->label('Title')
                    ->limit(50)
                    ->searchable()
                    ->sortable()
                    ->placeholder('—'),

                // Areas
                Tables\Columns\TextColumn::make('property.lot_area')
                    ->label('Lot (sqm)')
                    ->numeric(decimalPlaces: 0)
                    ->suffix(' ㎡')
                    ->alignRight()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('property.floor_area')
                    ->label('Floor (sqm)')
                    ->numeric(decimalPlaces: 0)
                    ->suffix(' ㎡')
                    ->alignRight()
                    ->placeholder('—'),

                // Price
                Tables\Columns\TextColumn::make('property.price')
                    ->label('Price')
                    ->money('PHP', true) // ₱ with thousands sep
                    ->alignRight()
                    ->sortable()
                    ->placeholder('—'),

                // Listing Status (badge)
                Tables\Columns\BadgeColumn::make('property.status')
                    ->label('Status')
                    ->colors([
                        'success' => 'Published',
                        'warning' => 'Pending',
                        'gray'    => 'Draft',
                        'danger'  => 'Archived',
                        'info'    => 'Sold',
                    ])
                    ->sortable()
                    ->placeholder('—'),

                // When the pivot (PropertyListing) link was created
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Linked')
                    ->dateTime('M d, Y')
                    ->since()
                    ->sortable(),
            ])

            // Optional: quick filters you can expand later
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'Published' => 'Published',
                        'Pending'   => 'Pending',
                        'Draft'     => 'Draft',
                        'Archived'  => 'Archived',
                        'Sold'      => 'Sold',
                    ])
                    ->query(function (Builder $query, array $data) {
                        if (! ($data['value'] ?? null)) return $query;
                        return $query->whereHas('property', fn ($q) =>
                        $q->where('status', $data['value'])
                        );
                    }),
            ])

            ->headerActions([
                // Attach existing listings to this Agent
                Tables\Actions\AttachAction::make()
                    ->label('Attach Property')
                    ->recordSelectSearchColumns(['title']) // columns on PropertyListing (not property.*)
                    ->preloadRecordSelect(),
                // If you have pivot fields, add ->form([...]) here and add ->withPivot([...]) on the relationship
            ])

            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DetachAction::make()->label('Detach'),
                // Avoid Delete here unless you truly want to delete the listing record
            ])

            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DetachBulkAction::make(),
                ]),
            ])

            ->defaultSort('created_at', 'desc');
    }
}
