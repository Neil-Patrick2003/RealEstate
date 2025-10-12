<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeveloperResource\Pages;
use App\Filament\Resources\DeveloperResource\RelationManagers\PropertiesRelationManager;
use App\Models\Developer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class DeveloperResource extends Resource
{
    protected static ?string $model = Developer::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Directory';
    protected static ?string $modelLabel = 'Developer';
    protected static ?string $pluralModelLabel = 'Developers';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Company Info')
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->label('Registered Name')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('trade_name')
                            ->label('Trade Name')
                            ->maxLength(255),

                        TextInput::make('email')
                            ->email()
                            ->required()
                            ->maxLength(255),

                        Select::make('status')
                            ->options([
                                'pending'  => 'Pending',
                                'verified' => 'Verified',
                                'suspended'=> 'Suspended',
                            ])
                            ->required()
                            ->default('pending')
                            ->native(false),

                        // ✅ Added Broker Selection
                        Select::make('broker_id')
                            ->label('Assigned Broker')
                            ->relationship('broker', 'name') // assumes Developer belongsTo Broker model
                            ->searchable()
                            ->preload()
                            ->required()
                            ->helperText('Select the main broker responsible for this developer.'),

                        TextInput::make('registration_number')
                            ->label('Registration #')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('license_number')
                            ->label('License #')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('head_office_address')
                            ->label('Head Office Address')
                            ->required()
                            ->maxLength(255),
                    ]),

                Section::make('Brand & Online Presence')
                    ->columns(2)
                    ->schema([
                        FileUpload::make('company_logo')
                            ->label('Company Logo')
                            ->image()
                            ->directory('developers/logos')
                            ->imageEditor()
                            ->imageCropAspectRatio('1:1')
                            ->imageResizeTargetWidth('512')
                            ->imageResizeTargetHeight('512')
                            ->imageResizeMode('contain')
                            ->maxSize(1024)
                            ->downloadable()
                            ->openable()
                            ->columnSpanFull()
                            ->helperText('PNG/JPG, ≤ 1MB. Will be resized to 512×512.'),

                        TextInput::make('website_url')
                            ->label('Website')
                            ->url()
                            ->prefix('https://')
                            ->maxLength(255),

                        TextInput::make('facebook_url')
                            ->label('Facebook Page')
                            ->url()
                            ->prefix('https://')
                            ->maxLength(255),
                    ]),

                Section::make('Description')
                    ->schema([
                        Textarea::make('description')
                            ->rows(6)
                            ->placeholder('Short description about the developer…')
                            ->columnSpanFull(),
                    ]),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                ImageColumn::make('company_logo')
                    ->label('Logo')
                    ->square()
                    ->size(40),

                TextColumn::make('name')
                    ->label('Name')
                    ->searchable()
                    ->sortable()
                    ->wrap(),

                TextColumn::make('trade_name')
                    ->label('Trade Name')
                    ->toggleable()
                    ->searchable(),

                TextColumn::make('email')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('website_url')
                    ->label('Website')
                    ->url(fn ($record) => $record->website_url ?: null, shouldOpenInNewTab: true)
                    ->icon('heroicon-m-globe-alt')
                    ->toggleable()
                    ->limit(24),

                TextColumn::make('facebook_url')
                    ->label('Facebook')
                    ->url(fn ($record) => $record->facebook_url ?: null, shouldOpenInNewTab: true)
                    ->icon('heroicon-m-link')
                    ->toggleable()
                    ->limit(24),

                TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'verified',
                        'danger'  => 'suspended',
                    ])
                    ->sortable()
                    ->searchable(),

                TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('broker.name')
                    ->label('Broker')
                    ->sortable()
                    ->searchable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'  => 'Pending',
                        'verified' => 'Verified',
                        'suspended'=> 'Suspended',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            PropertiesRelationManager::class
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListDevelopers::route('/'),
            'create' => Pages\CreateDeveloper::route('/create'),
            'edit'   => Pages\EditDeveloper::route('/{record}/edit'),
        ];
    }
}
