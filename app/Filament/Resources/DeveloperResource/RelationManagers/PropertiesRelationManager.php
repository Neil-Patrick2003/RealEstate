<?php

namespace App\Filament\Resources\DeveloperResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class PropertiesRelationManager extends RelationManager
{
    protected static string $relationship = 'properties';
    protected static ?string $recordTitleAttribute = 'title';

    public function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Basic Info')
                ->columns(2)
                ->schema([
                    TextInput::make('title')
                        ->label('Listing Title')
                        ->required()
                        ->maxLength(150)
                        ->placeholder('Modern 3BR House & Lot in Lipa City'),

                    Select::make('property_type')
                        ->label('Property Type')
                        ->options([
                            'House & Lot'  => 'House & Lot',
                            'Condo'        => 'Condo',
                            'Lot Only'     => 'Lot Only',
                            'Townhouse'    => 'Townhouse',
                            'Commercial'   => 'Commercial',
                            'Agricultural' => 'Agricultural',
                        ])
                        ->searchable()
                        ->native(false)
                        ->required(),

                    Select::make('sub_type')
                        ->label('Sub Type')
                        ->options([
                            'House & Lot'  => 'House & Lot',
                            'Condo'        => 'Condo',
                            'Lot Only'     => 'Lot Only',
                            'Townhouse'    => 'Townhouse',
                            'Commercial'   => 'Commercial',
                            'Agricultural' => 'Agricultural',
                        ])
                        ->searchable()
                        ->native(false)
                        ->required(),

                    Select::make('status')
                        ->label('Status')
                        ->options([
                            'Draft'     => 'Draft',
                            'Pending'   => 'Pending',
                            'Published' => 'Published',
                            'Archived'  => 'Archived',
                            'Sold'      => 'Sold',
                        ])
                        ->default('Draft')
                        ->native(false)
                        ->required(),

                    Toggle::make('isPresell')
                        ->label('Pre-selling')
                        ->inline(false)
                        ->default(false),


                    Toggle::make('isFixPrice')
                        ->label('Fix Price')
                        ->inline(false)
                        ->default(false),
                ]),

            Section::make('Media')
                ->columns(2)
                ->schema([
                    FileUpload::make('image_url')
                        ->label('Cover Photo')
                        ->image()
                        ->disk('public')
                        ->directory('properties/covers')
                        ->visibility('public')
                        ->imageEditor()
                        ->imageCropAspectRatio('4:3')
                        ->imageResizeMode('contain')
                        ->imageResizeTargetWidth(1600)
                        ->imageResizeTargetHeight(1200)
                        ->imagePreviewHeight('200')
                        ->maxSize(4096)
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                        ->helperText('Use a clear, landscape image (4:3 or 16:9), ≤ 4MB.')
                        ->columnSpanFull(),
                ]),

            Section::make('Specs')
                ->columns(3)
                ->schema([
                    TextInput::make('lot_area')
                        ->label('Lot Area')
                        ->numeric()
                        ->minValue(0)
                        ->step('0.01')
                        ->suffix('㎡')
                        ->nullable(),

                    TextInput::make('floor_area')
                        ->label('Floor Area')
                        ->numeric()
                        ->minValue(0)
                        ->step('0.01')
                        ->suffix('㎡')
                        ->nullable(),

                    TextInput::make('bedrooms')
                        ->label('Bedrooms')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->reactive()
                        ->afterStateUpdated(function (Set $set, Get $get) {
                            $set('total_rooms', (int)($get('bedrooms') ?? 0) + (int)($get('bathrooms') ?? 0));
                        })
                        ->nullable(),

                    TextInput::make('bathrooms')
                        ->label('Bathrooms')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->reactive()
                        ->afterStateUpdated(function (Set $set, Get $get) {
                            $set('total_rooms', (int)($get('bedrooms') ?? 0) + (int)($get('bathrooms') ?? 0));
                        })
                        ->nullable(),

                    // ✅ NEW: Total Rooms (auto = bedrooms + bathrooms, but editable)
                    TextInput::make('total_rooms')
                        ->label('Total Rooms')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->helperText('Auto-calculated = Bedrooms + Bathrooms (you can override).')
                        ->nullable(),

                    TextInput::make('car_slots')
                        ->label('Parking Slots')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->reactive()
                        ->nullable(),

                    RichEditor::make('description')
                        ->label('Description')
                        ->toolbarButtons([
                            'bold','italic','underline','strike','bulletList','orderedList','link','blockquote'
                        ])
                        ->columnSpanFull(),
                ]),

            Section::make('Pricing')
                ->columns(2)
                ->schema([
                    TextInput::make('price')
                        ->label('List Price')
                        ->numeric()
                        ->minValue(0)
                        ->prefix('₱')
                        ->required(),

                    TextInput::make('reservation_fee')
                        ->label('Reservation Fee')
                        ->numeric()
                        ->minValue(0)
                        ->prefix('₱')
                        ->nullable(),

                ]),

            Section::make('Location')
                ->columns(2)
                ->schema([
                    Textarea::make('address')
                        ->label('Street — Barangay — City — Province')
                        ->rows(3)
                        ->maxLength(255)
                        ->required()
                        ->columnSpanFull(),

                    TextInput::make('latitude')
                        ->label('Latitude')
                        ->numeric()
                        ->minValue(-90)
                        ->maxValue(90)
                        ->step('any')
                        ->nullable(),

                    TextInput::make('longitude')
                        ->label('Longitude')
                        ->numeric()
                        ->minValue(-180)
                        ->maxValue(180)
                        ->step('any')
                        ->nullable(),
                ]),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->defaultSort('created_at','desc')
            ->columns([
                ImageColumn::make('image_url')->label('Cover')->square()->size(48),

                TextColumn::make('title')->label('Title')->limit(40)->searchable()->sortable(),

                TextColumn::make('property_type')->label('Type')->badge()->sortable()->searchable(),
                TextColumn::make('sub_type')->label('Sub Type')->toggleable()->sortable()->searchable(),

                // ✅ NEW: Pre-selling icon column
                IconColumn::make('isPresell')
                    ->label('Pre-selling')
                    ->boolean()
                    ->trueIcon('heroicon-m-check-circle')
                    ->falseIcon('heroicon-m-x-circle'),


                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'gray'   => 'Draft',
                        'warning'=> 'Pending',
                        'success'=> 'Published',
                        'danger' => 'Archived',
                        'info'   => 'Sold',
                    ])
                    ->sortable()
                    ->searchable(),

                TextColumn::make('price')
                    ->label('Price')
                    ->money('PHP', true)
                    ->sortable(),

                TextColumn::make('bedrooms')->label('BR')->sortable()->toggleable(),
                TextColumn::make('bathrooms')->label('BA')->sortable()->toggleable(),

                // ✅ NEW: Total Rooms column
                TextColumn::make('total_rooms')->label('Rooms')->sortable()->toggleable(),

                TextColumn::make('floor_area')->label('FA (㎡)')->sortable()->toggleable(),
                TextColumn::make('lot_area')->label('LA (㎡)')->sortable()->toggleable(),

                TextColumn::make('address')
                    ->label('Location')
                    ->formatStateUsing(fn ($state) => self::cityProvinceFromAddress($state))
                    ->limit(28)
                    ->toggleable(),

                TextColumn::make('created_at')->label('Created')->dateTime('Y-m-d H:i')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'Draft'     => 'Draft',
                    'Pending'   => 'Pending',
                    'Published' => 'Published',
                    'Archived'  => 'Archived',
                    'Sold'      => 'Sold',
                ]),

                SelectFilter::make('property_type')->label('Type')->options([
                    'House & Lot'  => 'House & Lot',
                    'Condo'        => 'Condo',
                    'Lot Only'     => 'Lot Only',
                    'Townhouse'    => 'Townhouse',
                    'Commercial'   => 'Commercial',
                    'Agricultural' => 'Agricultural',
                ]),

                // ✅ NEW: filter by Pre-selling
                TernaryFilter::make('is_pre_selling')
                    ->label('Pre-selling'),

                Filter::make('price_range')
                    ->form([
                        TextInput::make('min')->numeric()->label('Min ₱'),
                        TextInput::make('max')->numeric()->label('Max ₱'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['min'] ?? null, fn ($q, $v) => $q->where('price', '>=', (float) $v))
                            ->when($data['max'] ?? null, fn ($q, $v) => $q->where('price', '<=', (float) $v));
                    }),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\Action::make('quick_publish')
                    ->label('Publish')
                    ->icon('heroicon-m-bolt')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status !== 'Published')
                    ->action(fn ($record) => $record->update(['status' => 'Published'])),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('bulk_publish')
                        ->label('Publish Selected')
                        ->icon('heroicon-m-bolt')
                        ->requiresConfirmation()
                        ->action(fn ($records) => $records->each->update(['status' => 'Published'])),

                    Tables\Actions\BulkAction::make('bulk_archive')
                        ->label('Archive Selected')
                        ->icon('heroicon-m-archive-box')
                        ->requiresConfirmation()
                        ->action(fn ($records) => $records->each->update(['status' => 'Archived'])),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    /** Quick formatter for "City, Province" based on a dashed address pattern */
    protected static function cityProvinceFromAddress(?string $address): string
    {
        if (! $address) return '';
        // Expected: "Street — Barangay — City — Province"
        $parts = preg_split('/\s*[-—]\s*/u', $address);
        $city = $parts[2] ?? null;
        $prov = $parts[3] ?? null;
        return trim(($city ? $city : '') . ($prov ? (', ' . $prov) : ''));
    }
}
