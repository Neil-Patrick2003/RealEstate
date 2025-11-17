<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeveloperAmenityResource\RelationManagers\AmenitiesRelationManager;
use App\Filament\Resources\DeveloperResource\Pages;
use App\Filament\Resources\DeveloperResource\RelationManagers\ProjectsRelationManager;
use App\Models\Developer;
use App\Models\Project;
use App\Models\Block;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyFeature;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\Action;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeveloperResource extends Resource
{
    protected static ?string $model = Developer::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = '🏢 Directory';
    protected static ?string $modelLabel = 'Developer';
    protected static ?string $pluralModelLabel = 'Developers';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Developer Information')->tabs([
                Forms\Components\Tabs\Tab::make('Company Profile')
                    ->icon('heroicon-o-building-office')
                    ->schema([
                        Section::make('Company Identity')
                            ->description('Basic company information and branding')
                            ->schema([
                                FileUpload::make('company_logo')
                                    ->label('Company Logo')
                                    ->disk('public')
                                    ->directory('developers/logos')
                                    ->image()
                                    ->imageEditor()
                                    ->imageCropAspectRatio('1:1')
                                    ->imageResizeTargetWidth(200)
                                    ->imageResizeTargetHeight(200)
                                    ->imagePreviewHeight('120')
                                    ->openable()
                                    ->downloadable()
                                    ->columnSpanFull()
                                    ->helperText('Upload a square logo for best results'),

                                TextInput::make('name')
                                    ->label('Developer Name')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('e.g., Ayala Land, Inc.')
                                    ->columnSpan(2),

                                TextInput::make('trade_name')
                                    ->label('Trade Name')
                                    ->maxLength(255)
                                    ->placeholder('e.g., Alveo, Avida')
                                    ->columnSpan(2),

                                Select::make('status')
                                    ->label('Status')
                                    ->required()
                                    ->options([
                                        'pending' => '🟡 Pending Review',
                                        'verified' => '🟢 Verified & Active',
                                        'inactive' => '🔴 Inactive'
                                    ])
                                    ->default('pending')
                                    ->native(false)
                                    ->columnSpan(1),

                                TextInput::make('email')
                                    ->email()
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('company@email.com')
                                    ->columnSpan(1),
                            ])->columns(4),
                    ]),

                Forms\Components\Tabs\Tab::make('Contact & Compliance')
                    ->icon('heroicon-o-document-text')
                    ->schema([
                        Section::make('Business Information')
                            ->description('Legal and compliance details')
                            ->schema([
                                TextInput::make('head_office_address')
                                    ->label('Head Office Address')
                                    ->maxLength(255)
                                    ->placeholder('Complete business address')
                                    ->columnSpanFull(),

                                TextInput::make('registration_number')
                                    ->label('Registration Number')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('SEC/DTI Registration No.')
                                    ->columnSpan(2),

                                TextInput::make('license_number')
                                    ->label('License Number')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('HLURB/LGU License No.')
                                    ->columnSpan(2),

                                Hidden::make('broker_id')->default(fn () => auth()->id()),
                            ])->columns(4),
                    ]),

                Forms\Components\Tabs\Tab::make('Online Presence')
                    ->icon('heroicon-o-globe-alt')
                    ->schema([
                        Section::make('Digital Channels')
                            ->description('Company websites and social media')
                            ->schema([
                                TextInput::make('website_url')
                                    ->label('Official Website')
                                    ->url()
                                    ->maxLength(255)
                                    ->placeholder('https://company-website.com')
                                    ->prefixIcon('heroicon-o-globe-alt')
                                    ->columnSpan(2),

                                TextInput::make('facebook_url')
                                    ->label('Facebook Page')
                                    ->url()
                                    ->maxLength(255)
                                    ->placeholder('https://facebook.com/company-page')
                                    ->prefixIcon('heroicon-o-face-smile')
                                    ->columnSpan(2),
                            ])->columns(4),
                    ]),

                Forms\Components\Tabs\Tab::make('Company Story')
                    ->icon('heroicon-o-book-open')
                    ->schema([
                        Section::make('About the Developer')
                            ->description('Tell the story and vision of your company')
                            ->schema([
                                RichEditor::make('description')
                                    ->label('Company Description')
                                    ->toolbarButtons([
                                        'bold', 'italic', 'underline', 'strike',
                                        'bulletList', 'orderedList',
                                        'link', 'blockquote',
                                        'h2', 'h3', 'paragraph',
                                        'redo', 'undo'
                                    ])
                                    ->fileAttachmentsDirectory('developers/attachments')
                                    ->maxLength(5000)
                                    ->columnSpanFull()
                                    ->helperText('Describe your company history, vision, and key achievements (max 5000 characters)'),
                            ]),
                    ]),
            ])->columnSpanFull(),
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
                    ->height(50)
                    ->width(50)
                    ->circular()
                    ->defaultImageUrl(asset('images/default-company-logo.png')),

                TextColumn::make('name')
                    ->label('Developer')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold')
                    ->description(fn ($record) => $record->trade_name)
                    ->wrap(),

                BadgeColumn::make('status')
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => '🟡 Pending',
                        'verified' => '🟢 Verified',
                        'inactive' => '🔴 Inactive',
                        default => $state
                    })
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'verified',
                        'danger' => 'inactive'
                    ])
                    ->sortable(),

                TextColumn::make('email')
                    ->searchable()
                    ->copyable()
                    ->icon('heroicon-o-envelope')
                    ->color('gray')
                    ->toggleable(),

                TextColumn::make('projects_count')
                    ->label('Projects')
                    ->counts('projects')
                    ->badge()
                    ->color('info')
                    ->sortable(),

                TextColumn::make('registration_number')
                    ->label('Reg. No.')
                    ->limit(12)
                    ->copyable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('website_url')
                    ->label('Website')
                    ->url(fn ($record) => $record->website_url, true)
                    ->openUrlInNewTab()
                    ->copyable()
                    ->limit(20)
                    ->icon('heroicon-o-link')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'  => 'Pending Review',
                        'verified' => 'Verified & Active',
                        'inactive' => 'Inactive',
                    ])
                    ->label('Status'),

            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->color('primary')
                        ->icon('heroicon-o-eye'),

                    Tables\Actions\EditAction::make()
                        ->color('warning')
                        ->icon('heroicon-o-pencil'),

                    Action::make('setupProjectAndUnits')
                        ->label('Quick Setup')
                        ->icon('heroicon-o-rocket-launch')
                        ->color('success')
                        ->modalHeading('Create Complete Project Structure')
                        ->modalDescription('Set up projects, blocks, house types, and units in one go')
                        ->form([
                            Section::make('🏢 Project Information')
                                ->description('Basic project details and location')
                                ->schema([
                                    FileUpload::make('project.project_img')
                                        ->label('Project Cover Image')
                                        ->disk('public')
                                        ->directory('projects/covers')
                                        ->image()
                                        ->imageEditor()
                                        ->imageCropAspectRatio('16:9')
                                        ->imagePreviewHeight('160')
                                        ->columnSpanFull()
                                        ->helperText('Recommended ratio 16:9 for best display'),

                                    TextInput::make('project.name')
                                        ->label('Project Name')
                                        ->required()
                                        ->maxLength(150)
                                        ->placeholder('e.g., Avida Settings Cebu')
                                        ->columnSpan(2),

                                    Select::make('project.type')
                                        ->label('Project Type')
                                        ->options([
                                            'subdivision' => '🏡 Subdivision',
                                            'condo' => '🏢 Condominium',
                                            'mixed' => '🏬 Mixed Use',
                                            'commercial' => '🏪 Commercial',
                                        ])
                                        ->required()
                                        ->native(false)
                                        ->columnSpan(2),

                                    TextInput::make('project.address')
                                        ->label('Complete Address')
                                        ->maxLength(255)
                                        ->placeholder('Street, Barangay, City')
                                        ->columnSpan(3),


                                    Select::make('project.status')
                                        ->label('Project Status')
                                        ->options([
                                            'active' => '🟢 Active',
                                            'draft' => '🟡 Draft',
                                            'upcoming' => '🔵 Upcoming'
                                        ])
                                        ->default('active')
                                        ->native(false)
                                        ->columnSpan(1),
                                ])->columns(4),

                            Section::make('🏗️ Project Structure')
                                ->description('Define blocks/towers and house types')
                                ->schema([
                                    Repeater::make('blocks')
                                        ->label('Blocks / Towers')
                                        ->schema([
                                            TextInput::make('block_code')
                                                ->label('Block/Tower Code')
                                                ->required()
                                                ->maxLength(50)
                                                ->placeholder('e.g., B1, TOWER-A')
                                                ->hintIcon('heroicon-o-information-circle', 'Use codes like B1, B2 for blocks or T1, T2 for towers'),
                                        ])
                                        ->minItems(1)
                                        ->defaultItems(1)
                                        ->addActionLabel('Add Block/Tower')
                                        ->columns(1),

                                    Repeater::make('house_types')
                                        ->label('House Types / Unit Models')
                                        ->schema([
                                            TextInput::make('code')
                                                ->label('Model Code')
                                                ->required()
                                                ->maxLength(50)
                                                ->placeholder('e.g., SINGLE, DUPLEX, STUDIO')
                                                ->hint('Internal code for reference'),

                                            TextInput::make('name')
                                                ->label('Display Name')
                                                ->required()
                                                ->maxLength(120)
                                                ->placeholder('e.g., Single Family Home, Duplex, Studio Unit')
                                                ->hint('Customer-facing name'),
                                        ])
                                        ->minItems(1)
                                        ->defaultItems(1)
                                        ->addActionLabel('Add House Type')
                                        ->columns(2),
                                ])->columns(1),

                            Section::make('🏠 Unit Configuration')
                                ->description('Define unit specifications and pricing')
                                ->schema([
                                    Repeater::make('units')
                                        ->label('Unit Templates')
                                        ->schema([
                                            Select::make('block_code')
                                                ->label('Block / Tower')
                                                ->options(fn (Get $get) => collect($get('../../blocks') ?? [])
                                                    ->pluck('block_code', 'block_code')
                                                    ->filter()
                                                    ->mapWithKeys(fn ($code) => [$code => "Block {$code}"])
                                                    ->all())
                                                ->required()
                                                ->native(false)
                                                ->searchable()
                                                ->columnSpan(1),

                                            TextInput::make('count')
                                                ->label('Number of Units')
                                                ->numeric()
                                                ->minValue(1)
                                                ->maxValue(100)
                                                ->required()
                                                ->default(1)
                                                ->columnSpan(1)
                                                ->helperText('How many units of this type?'),

                                            Select::make('house_type_code')
                                                ->label('House Type')
                                                ->options(fn (Get $get) => collect($get('../../house_types') ?? [])
                                                    ->pluck('code', 'code')
                                                    ->filter()
                                                    ->mapWithKeys(fn ($code, $index) => [
                                                        $code => $get("../../house_types.{$index}.name") ?? $code
                                                    ])
                                                    ->all())
                                                ->required()
                                                ->native(false)
                                                ->searchable()
                                                ->columnSpan(1),

                                            Forms\Components\Grid::make(3)
                                                ->schema([
                                                    TextInput::make('lot_area')
                                                        ->label('Lot Area (sqm)')
                                                        ->numeric()
                                                        ->minValue(0)
                                                        ->step(0.01)
                                                        ->suffix('sqm'),

                                                    TextInput::make('floor_area')
                                                        ->label('Floor Area (sqm)')
                                                        ->numeric()
                                                        ->minValue(0)
                                                        ->step(0.01)
                                                        ->suffix('sqm'),

                                                    TextInput::make('price')
                                                        ->label('List Price')
                                                        ->numeric()
                                                        ->prefix('₱')
                                                        ->minValue(0)
                                                        ->step(0.01)
                                                        ->required(),
                                                ]),

                                            Forms\Components\Grid::make(4)
                                                ->schema([
                                                    TextInput::make('bedrooms')
                                                        ->label('Bedrooms')
                                                        ->numeric()
                                                        ->minValue(0)
                                                        ->step(1)
                                                        ->suffixIcon('heroicon-o-home'),

                                                    TextInput::make('bathrooms')
                                                        ->label('Bathrooms')
                                                        ->numeric()
                                                        ->minValue(0)
                                                        ->step(1)
                                                        ->suffixIcon('heroicon-o-home'),

                                                    TextInput::make('car_slots')
                                                        ->label('Car Slots')
                                                        ->numeric()
                                                        ->minValue(0)
                                                        ->step(1)
                                                        ->suffixIcon('heroicon-o-truck'),

                                                    TextInput::make('reservation')
                                                        ->label('Reservation Fee')
                                                        ->numeric()
                                                        ->prefix('₱')
                                                        ->minValue(0)
                                                        ->step(0.01),
                                                ]),

                                            Forms\Components\Grid::make(2)
                                                ->schema([
                                                    Toggle::make('isPresell')
                                                        ->label('Pre-Sell Unit')
                                                        ->default(true)
                                                        ->inline()
                                                        ->helperText('Available for pre-selling'),

                                                    Toggle::make('isFixPrice')
                                                        ->label('Fixed Price')
                                                        ->default(true)
                                                        ->inline()
                                                        ->helperText('Price is non-negotiable'),
                                                ]),

                                            FileUpload::make('main_image')
                                                ->label('Unit Main Image')
                                                ->disk('public')
                                                ->directory('properties/units')
                                                ->image()
                                                ->imageEditor()
                                                ->imagePreviewHeight('120')
                                                ->columnSpan(1)
                                                ->helperText('Primary display image for this unit type'),

                                            FileUpload::make('gallery')
                                                ->label('Gallery Images')
                                                ->disk('public')
                                                ->directory('properties/gallery')
                                                ->multiple()
                                                ->image()
                                                ->imagePreviewHeight('80')
                                                ->maxFiles(10)
                                                ->columnSpan(1)
                                                ->helperText('Additional images (max 10)'),

                                            Repeater::make('features')
                                                ->label('Unit Features')
                                                ->schema([
                                                    TextInput::make('name')
                                                        ->label('Feature')
                                                        ->maxLength(120)
                                                        ->required()
                                                        ->placeholder('e.g., Swimming Pool, Garden, Balcony'),
                                                ])
                                                ->minItems(0)
                                                ->addActionLabel('Add Feature')
                                                ->columns(1)
                                                ->columnSpanFull(),
                                        ])
                                        ->minItems(1)
                                        ->defaultItems(1)
                                        ->addActionLabel('Add Unit Template')
                                        ->columns(1),
                                ]),
                        ])
                        ->action(function (array $data, Developer $record) {
                            DB::transaction(function () use ($data, $record) {
                                $createdCount = 0;
                                $projectData = Arr::get($data, 'project', []);

                                // 1) Create Project
                                $project = Project::create([
                                    'developer_id' => $record->id,
                                    'name'         => $projectData['name'] ?? 'Untitled Project',
                                    'type'         => $projectData['type'] ?? 'subdivision',
                                    'address'      => $projectData['address'] ?? null,
                                    'city'         => $projectData['city'] ?? null,
                                    'province'     => $projectData['province'] ?? null,
                                    'status'       => $projectData['status'] ?? 'active',
                                    'project_img'  => $projectData['project_img'] ?? null,
                                ]);

                                // 2) Create Blocks
                                $blocksInput = collect($data['blocks'] ?? []);
                                $blocksInput->each(function ($b) use ($project) {
                                    $code = strtoupper(trim((string)($b['block_code'] ?? '')));
                                    if ($code === '') return;
                                    Block::firstOrCreate([
                                        'project_id' => $project->id,
                                        'block_code' => $code,
                                    ]);
                                });

                                // 3) Prepare House Types Map
                                $typesInput = collect($data['house_types'] ?? []);
                                $typesByCode = [];
                                $typesInput->each(function ($t) use (&$typesByCode) {
                                    $code = trim((string)($t['code'] ?? ''));
                                    if ($code === '') return;
                                    $typesByCode[$code] = $t['name'] ?? $code;
                                });

                                // 4) Create Properties from Units
                                $unitsInput = collect($data['units'] ?? []);
                                $unitsInput->each(function ($unit) use ($project, $typesByCode, &$createdCount) {
                                    $blockCode = strtoupper(trim((string)($unit['block_code'] ?? '')));
                                    $count = (int)($unit['count'] ?? 0);
                                    $typeCode = trim((string)($unit['house_type_code'] ?? ''));
                                    $typeName = $typeCode ? ($typesByCode[$typeCode] ?? $typeCode) : null;

                                    if ($count <= 0 || $blockCode === '') return;

                                    // Get existing lot numbers to avoid duplicates
                                    $existingLots = Property::query()
                                        ->where('project_id', $project->id)
                                        ->where('block_code', $blockCode)
                                        ->when($typeCode !== '', fn($q) => $q->where('sub_type', $typeCode))
                                        ->pluck('lot_no')
                                        ->filter()
                                        ->map(fn($v) => (string)$v)
                                        ->all();

                                    $taken = array_flip($existingLots);
                                    $made = 0;
                                    $cursor = 1;

                                    while ($made < $count && $cursor <= ($count * 3)) {
                                        $lotNo = (string)$cursor;
                                        if (!isset($taken[$lotNo])) {
                                            // Create Property
                                            $prop = Property::create([
                                                'seller_id' => null,
                                                'project_id' => $project->id,
                                                'block_code' => $blockCode,
                                                'lot_no' => $lotNo,
                                                'property_type' => $project->type,
                                                'title' => trim(
                                                    $project->name .
                                                    ($typeName ? " • {$typeName}" : '') .
                                                    " • Block {$blockCode} Lot {$lotNo}"
                                                ),
                                                'description' => "Beautiful unit in {$project->name}. " .
                                                    ($typeName ? "This {$typeName} features " : "Features ") .
                                                    "spacious living areas and modern amenities.",
                                                'sub_type' => $typeCode ?: null,
                                                'price' => $unit['price'] ?? 0,
                                                'reservation' => $unit['reservation'] ?? null,
                                                'isFixPrice' => (bool)($unit['isFixPrice'] ?? true) ? 1 : 0,
                                                'isPresell' => (bool)($unit['isPresell'] ?? true) ? 1 : 0,
                                                'address' => $project->address,
                                                'lot_area' => $unit['lot_area'] ?? null,
                                                'floor_area' => $unit['floor_area'] ?? null,
                                                'bedrooms' => $unit['bedrooms'] ?? null,
                                                'bathrooms' => $unit['bathrooms'] ?? null,
                                                'car_slots' => $unit['car_slots'] ?? null,
                                                'image_url' => $unit['main_image'] ?? null,
                                                'status' => 'Published',
                                                'views' => 0,
                                                'allow_multi_agents' => 0,
                                            ]);

                                            // Create Gallery Images
                                            $gallery = collect($unit['gallery'] ?? [])->filter();
                                            if ($gallery->isNotEmpty()) {
                                                $galleryRows = $gallery->map(fn ($path) => [
                                                    'property_id' => $prop->id,
                                                    'image_url' => $path,
                                                    'created_at' => now(),
                                                    'updated_at' => now(),
                                                ])->all();
                                                PropertyImage::insert($galleryRows);
                                            }

                                            // Create Features
                                            $features = collect($unit['features'] ?? [])->pluck('name')->filter();
                                            if ($features->isNotEmpty()) {
                                                $featureRows = $features->map(fn ($name) => [
                                                    'property_id' => $prop->id,
                                                    'name' => $name,
                                                    'created_at' => now(),
                                                    'updated_at' => now(),
                                                ])->all();
                                                PropertyFeature::insert($featureRows);
                                            }

                                            $made++;
                                            $createdCount++;
                                            $taken[$lotNo] = true;
                                        }
                                        $cursor++;
                                    }
                                });

                                Notification::make()
                                    ->title('🎉 Project Setup Complete!')
                                    ->body("Successfully created '{$project->name}' with {$createdCount} properties, complete with images and features.")
                                    ->success()
                                    ->send();
                            });
                        }),

//                    Action::make('viewProjects')
//                        ->label('View Projects')
//                        ->icon('heroicon-o-building-storefront')
//                        ->color('info')
//                        ->url(fn ($record) => ProjectResource::getUrl('index', ['tableFilters[developer_id][value]' => $record->id])),

                    Tables\Actions\DeleteAction::make()
                        ->color('danger')
                        ->icon('heroicon-o-trash'),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('markVerified')
                        ->label('Mark as Verified')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['status' => 'verified'])),

                    Tables\Actions\BulkAction::make('markInactive')
                        ->label('Mark as Inactive')
                        ->icon('heroicon-o-pause-circle')
                        ->color('warning')
                        ->action(fn ($records) => $records->each->update(['status' => 'inactive'])),
                ]),
            ])
            ->emptyStateHeading('No developers found')
            ->emptyStateDescription('Once you add your first developer, it will appear here.')
            ->emptyStateIcon('heroicon-o-building-office-2')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add Developer')
                    ->icon('heroicon-o-plus'),
            ])
            ->deferLoading()
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            // Relations can be added here if needed
            AmenitiesRelationManager::class,
            ProjectsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDevelopers::route('/'),
            'create' => Pages\CreateDeveloper::route('/create'),
            'edit' => Pages\EditDeveloper::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }
}
