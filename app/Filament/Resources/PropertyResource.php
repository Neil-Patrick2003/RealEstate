<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PropertyFeatureResource\RelationManagers\FeaturesRelationManager;
use App\Filament\Resources\PropertyImageResource\RelationManagers\ImagesRelationManager;
use App\Filament\Resources\PropertyResource\Pages;
use App\Filament\Resources\PropertyResource\RelationManagers\AgentsRelationManager;
use App\Models\Property;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\HtmlString;

class PropertyResource extends Resource
{
    protected static ?string $model = Property::class;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Listings';
    protected static ?string $modelLabel = 'Property';
    protected static ?string $pluralModelLabel = 'Properties';

    private const PLACEHOLDER = 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=1200&auto=format&fit=crop';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Basic Info')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('title')
                        ->label('Title')
                        ->required()
                        ->maxLength(150)
                        ->placeholder('e.g., Modern 3BR House & Lot in Lipa City'),

                    Forms\Components\Select::make('property_type')
                        ->label('Property Type')
                        ->options([
                            'House & Lot'   => 'House & Lot',
                            'Condo'         => 'Condo',
                            'Lot Only'      => 'Lot Only',
                            'Townhouse'     => 'Townhouse',
                            'Commercial'    => 'Commercial',
                            'Agricultural'  => 'Agricultural',
                        ])
                        ->searchable()
                        ->native(false)
                        ->required(),

                    Forms\Components\Select::make('sub_type')
                        ->label('Sub Type')
                        ->options([
                            'House & Lot'   => 'House & Lot',
                            'Condo'         => 'Condo',
                            'Lot Only'      => 'Lot Only',
                            'Townhouse'     => 'Townhouse',
                            'Commercial'    => 'Commercial',
                            'Agricultural'  => 'Agricultural',
                        ])
                        ->searchable()
                        ->native(false)
                        ->required(),

                    Forms\Components\Select::make('seller_id')
                        ->label('Seller / Owner')
                        ->relationship(name: 'seller', titleAttribute: 'name')
                        ->searchable()
                        ->preload()
                        ->native(false)
                        ->required(),

                    Forms\Components\Select::make('status')
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
                ]),

            Forms\Components\Section::make('Media')
                ->columns(2)
                ->schema([
                    Forms\Components\FileUpload::make('image_url')
                        ->label('Cover Photo')
                        ->image()
                        ->directory('properties')
                        ->disk('public')
                        ->visibility('public')
                        ->imageEditor()
                        ->imagePreviewHeight('200')
                        ->maxSize(4096)
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                        ->helperText('Use a clear, landscape image (4:3 or 16:9).')
                        ->columnSpanFull(),

                ]),

            Forms\Components\Section::make('Specs')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('lot_area')
                        ->label('Lot Area')
                        ->numeric()
                        ->minValue(0)
                        ->suffix(' ㎡')
                        ->nullable(),

                    Forms\Components\TextInput::make('floor_area')
                        ->label('Floor Area')
                        ->numeric()
                        ->minValue(0)
                        ->suffix(' ㎡')
                        ->nullable(),

                    Forms\Components\TextInput::make('bedrooms')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->nullable(),

                    Forms\Components\TextInput::make('bathrooms')
                        ->numeric()
                        ->minValue(0)
                        ->step(1)
                        ->nullable(),


                    RichEditor::make('description')
                    ->label('Description')
                    ->columnSpanFull()
                ]),

            Forms\Components\Section::make('Pricing')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('price')
                        ->label('Price')
                        ->numeric()
                        ->minValue(0)
                        ->prefix('₱')
                        ->required(),

                    Forms\Components\TextInput::make('reservation_fee')
                        ->label('Reservation Fee')
                        ->numeric()
                        ->minValue(0)
                        ->prefix('₱')
                        ->nullable(),

                    Forms\Components\TextInput::make('monthly_amortization')
                        ->label('Est. Monthly')
                        ->numeric()
                        ->minValue(0)
                        ->prefix('₱')
                        ->nullable(),
                ]),

            Forms\Components\Section::make('Location')
                ->columns(2)
                ->schema([
                    Forms\Components\Textarea::make('address')
                        ->label('Street-Barangay-Municipality-Province')
                        ->maxLength(255)
                        ->rows(3)
                        ->required()
                        ->columnSpanFull()
                        ->nullable(),


                    Forms\Components\TextInput::make('latitude')
                        ->numeric()
                        ->step('any')
                        ->nullable(),

                    Forms\Components\TextInput::make('longitude')
                        ->numeric()
                        ->step('any')
                        ->nullable(),
                ]),

        ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['seller']))
            ->columns([
                /* ─── Photo ───────────────────────────────────────────── */
                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Photo')
                    ->getStateUsing(function ($record) {
                        $raw = $record->image_url;
                        if (blank($raw)) return self::PLACEHOLDER;

                        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                            return $raw;
                        }

                        if (str_starts_with($raw, '/storage') || str_starts_with($raw, 'storage')) {
                            return asset(ltrim($raw, '/'));
                        }

                        return Storage::disk('public')->url($raw);
                    })
                    ->width(72)
                    ->height(54)
                    ->extraImgAttributes(['class' => 'object-cover rounded-md border border-gray-200 dark:border-gray-700']),

                /* ─── Title + Type + Price ─────────────────────────────── */
                Tables\Columns\TextColumn::make('title')
                    ->label('Property')
                    ->html()
                    ->sortable()
                    ->searchable()
                    ->formatStateUsing(function ($state, $record) {
                        $title = e($record->title ?? '—');
                        $location = e($record->address ?? '-');
                        $type  = e($record->property_type ?? '—');
                        $price = $record->price ? '₱' . number_format($record->price, 0) : '₱0';

                        return new HtmlString("
                            <div class='leading-tight text-left'>
                                <div class='font-semibold text-gray-900 dark:text-gray-100'>{$title}</div>
                                <div class='font-xs text-gray-600 dark:text-gray-100'>{$location}</div>
                                <div class='text-sm text-gray-600 dark:text-gray-400'>{$type} • <span class='font-medium text-green-600 dark:text-green-400'>{$price}</span></div>
                            </div>
                        ");
                    }),

                /* ─── Seller + Email ───────────────────────────────────── */
                Tables\Columns\TextColumn::make('seller.name')
                    ->label('Seller')
                    ->html()
                    ->sortable()
                    ->alignStart()
                    ->searchable(query: function (Builder $query, string $search) {
                        $query->whereHas('seller', fn ($q) =>
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                    })
                    ->formatStateUsing(function ($state, $record) {
                        $name  = e(optional($record->seller)->name ?? '—');
                        $email = e(optional($record->seller)->email ?? '—');
                        $mail  = $email !== '—' ? "<a href='mailto:{$email}' class='text-primary-600 dark:text-primary-400 hover:underline'>{$email}</a>" : '—';

                        return new HtmlString("
                            <div class='leading-tight text-left'>
                                <div class='font-semibold text-gray-900 dark:text-gray-100'>{$name}</div>
                                <div class='text-sm text-gray-500 dark:text-gray-400'>{$mail}</div>
                            </div>
                        ");
                    }),

                Tables\Columns\TextColumn::make('views')
                    ->label('Views')
                    ->sortable(),

                /* ─── Status ───────────────────────────────────────────── */
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'success' => 'Published',
                        'warning' => 'Pending',
                        'gray'    => 'Draft',
                        'danger'  => 'Archived',
                        'info'    => 'Sold',
                    ])
                    ->sortable(),

                /* ─── Lot / Floor Areas ────────────────────────────────── */
                Tables\Columns\TextColumn::make('lot_area')
                    ->label('Lot (㎡)')
                    ->numeric(decimalPlaces: 0)
                    ->suffix(' ㎡')
                    ->alignRight()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('floor_area')
                    ->label('Floor (㎡)')
                    ->numeric(decimalPlaces: 0)
                    ->suffix(' ㎡')
                    ->alignRight()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('published_at')
                    ->label('Published')
                    ->dateTime('M d, Y h:i A')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'Draft'     => 'Draft',
                        'Pending'   => 'Pending',
                        'Published' => 'Published',
                        'Archived'  => 'Archived',
                        'Sold'      => 'Sold',
                    ])
                    ->label('Status'),

                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'House & Lot'   => 'House & Lot',
                        'Condo'         => 'Condo',
                        'Lot Only'      => 'Lot Only',
                        'Townhouse'     => 'Townhouse',
                        'Commercial'    => 'Commercial',
                        'Agricultural'  => 'Agricultural',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->icon('heroicon-o-eye')
                    ->iconButton()
                    ->tooltip('View'),

                Tables\Actions\EditAction::make()
                    ->icon('heroicon-o-pencil-square')
                    ->iconButton()
                    ->tooltip('Edit'),

            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('mark_published')
                        ->label('Mark as Published')
                        ->icon('heroicon-o-check')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update([
                            'status' => 'Published',
                            'published_at' => now(),
                        ])),

                    Tables\Actions\BulkAction::make('mark_archived')
                        ->label('Mark as Archived')
                        ->icon('heroicon-o-archive-box')
                        ->color('gray')
                        ->action(fn ($records) => $records->each->update(['status' => 'Archived'])),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            ImagesRelationManager::class,
            FeaturesRelationManager::class,
            AgentsRelationManager::class

        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProperties::route('/'),
            'create' => Pages\CreateProperty::route('/create'),
            'edit'   => Pages\EditProperty::route('/{record}/edit'),
        ];
    }
}
