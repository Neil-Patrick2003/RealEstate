<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeveloperAmenityResource\RelationManagers\AmenitiesRelationManager;
use App\Filament\Resources\DeveloperResource\Pages;
use App\Models\Developer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Placeholder;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BadgeColumn;
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
        return $form->schema([
            // 1) Identity (3 columns)
            Section::make('Identity')
                ->schema([
                    FileUpload::make('company_logo')
                        ->label('Company Logo')
                        ->disk('public')
                        ->directory('company_logo') // /public/storage/company_logo
                        ->image()
                        ->imageEditor()
                        ->imageCropAspectRatio('1:1')
                        ->imagePreviewHeight('150')
                        ->openable()
                        ->downloadable()
                        ->columnSpanFull(),

                    TextInput::make('name')
                        ->label('Developer Name')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('e.g., Santa Lucia Land, Inc.')
                        ->columnSpan(1),

                    TextInput::make('trade_name')
                        ->label('Trade Name')
                        ->maxLength(255)
                        ->placeholder('e.g., Sta. Lucia')
                        ->columnSpan(1),

                    Select::make('status')
                        ->label('Status')
                        ->required()
                        ->options([
                            'pending'  => 'Pending',
                            'verified' => 'Verified',
                            'inactive' => 'Inactive',
                        ])
                        ->native(false)
                        ->default('pending')
                        ->columnSpan(1),

                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->maxLength(255)
                        ->placeholder('contact@company.com')
                        ->columnSpan(1),
                ])
                ->columns(2)
                ->compact(),

            // 2) Contact & Compliance (3 columns)
            Section::make('Contact & Compliance')
                ->schema([
                    TextInput::make('head_office_address')
                        ->label('Head Office Address')
                        ->maxLength(255)
                        ->placeholder('e.g., 123 Main St, Quezon City, Metro Manila')
                        ->columnSpan(3),

                    TextInput::make('registration_number')
                        ->label('Registration No.')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('e.g., SEC Reg No.')
                        ->columnSpan(1),

                    TextInput::make('license_number')
                        ->label('License No.')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('e.g., DHSUD / HLURB License No.')
                        ->columnSpan(1),

                    // Auto-assign broker silently
                    Hidden::make('broker_id')->default(fn () => auth()->id()),
                ])
                ->columns(3)
                ->compact(),

            // 3) Links (2 columns)
            Section::make('Links')
                ->schema([
                    TextInput::make('website_url')
                        ->label('Website')
                        ->url()
                        ->maxLength(255)
                        ->placeholder('https://example.com')
                        ->columnSpan(1),

                    TextInput::make('facebook_url')
                        ->label('Facebook Page')
                        ->url()
                        ->maxLength(255)
                        ->placeholder('https://facebook.com/yourpage')
                        ->columnSpan(1),
                ])
                ->columns(2)
                ->collapsible()
                ->compact(),

            // 4) About (full width)
            Section::make('About')
                ->schema([
                    RichEditor::make('description')
                        ->toolbarButtons([
                            'bold','italic','strike','bulletList','orderedList','link','blockquote','redo','undo',
                        ])
                        ->placeholder('Describe the developer, projects, and credentials...')
                        ->columnSpanFull(),
                ])
                ->columns(1)
                ->compact(),
        ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                ImageColumn::make('company_logo')
                    ->label('Logo')
                    ->disk('public')
                    ->height(40)
                    ->width(40)
                    ->circular(),

                TextColumn::make('name')
                    ->label('Developer')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'verified',
                        'gray'    => 'inactive',
                    ])
                    ->icons([
                        'heroicon-o-clock' => 'pending',
                        'heroicon-o-check-circle' => 'verified',
                        'heroicon-o-pause-circle' => 'inactive',
                    ])
                    ->sortable(),

                TextColumn::make('email')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('trade_name')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->searchable()
                    ->wrap(),

                TextColumn::make('website_url')
                    ->label('Website')
                    ->url(fn ($r) => $r->website_url, true)
                    ->openUrlInNewTab()
                    ->copyable()
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('facebook_url')
                    ->label('Facebook')
                    ->url(fn ($r) => $r->facebook_url, true)
                    ->openUrlInNewTab()
                    ->copyable()
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('registration_number')
                    ->label('Reg. No.')
                    ->limit(18)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('license_number')
                    ->label('License No.')
                    ->limit(18)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'pending'  => 'Pending',
                    'verified' => 'Verified',
                    'inactive' => 'Inactive',
                ]),
            ])
            ->actions([
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
        return [ AmenitiesRelationManager::class ];
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
