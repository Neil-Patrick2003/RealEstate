<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeveloperAmenityResource\RelationManagers\AmenitiesRelationManager;
use App\Filament\Resources\DeveloperResource\Pages;
use App\Filament\Resources\DeveloperResource\RelationManagers\ProjectsRelationManager;
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
use Filament\Forms\Components\Repeater;
use Filament\Forms\Get;
use Filament\Notifications\Notification;
use Illuminate\Support\Arr;
use App\Models\Project;
use App\Models\Block;
use App\Models\HouseType;
use App\Models\InventoryPool;
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
                Tables\Actions\Action::make('setupProjectAndInventory')
                    ->label('Setup Project & Inventory')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->modalHeading('Create Project & Inventory Pools')
                    ->form([
                        Section::make('Project Info')
                            ->schema([
                                TextInput::make('project.name')
                                    ->label('Project Name')
                                    ->required()
                                    ->maxLength(150),

                                Select::make('project.type')
                                    ->label('Project Type')
                                    ->options([
                                        'subdivision' => 'Subdivision',
                                        'condo'       => 'Condo',
                                        'mixed'       => 'Mixed Use',
                                    ])->required()->native(false),

                                TextInput::make('project.address')->label('Address')->maxLength(255),
                                TextInput::make('project.city')->label('City')->maxLength(100),
                                TextInput::make('project.province')->label('Province')->maxLength(100),

                                Select::make('project.status')
                                    ->label('Status')
                                    ->options(['active' => 'Active', 'draft' => 'Draft'])
                                    ->default('active')
                                    ->native(false),
                            ])
                            ->columns(2),

                        Section::make('Blocks / Towers')
                            ->description('Add block codes (e.g., B1, B2) or tower names (e.g., Tower A).')
                            ->schema([
                                Repeater::make('blocks')
                                    ->schema([
                                        TextInput::make('block_code')
                                            ->label('Block / Tower Code')
                                            ->required()
                                            ->maxLength(50),
                                    ])
                                    ->minItems(0)
                                    ->addActionLabel('Add Block / Tower')
                                    ->columns(1),
                            ]),

                        Section::make('House Types / Models')
                            ->description('Add unit types per project (e.g., Single, Double, Studio).')
                            ->schema([
                                Repeater::make('house_types')
                                    ->schema([
                                        TextInput::make('code')->label('Code')->placeholder('SINGLE / STUDIO')->required()->maxLength(50),
                                        TextInput::make('name')->label('Name')->placeholder('Single / Studio')->required()->maxLength(120),
                                        TextInput::make('base_price')->label('Base Price')->numeric()->prefix('₱')->minValue(0)->step(0.01),
                                        Forms\Components\Toggle::make('is_active')->default(true)->label('Active'),
                                    ])
                                    ->minItems(1)
                                    ->addActionLabel('Add House Type / Model')
                                    ->columns(2),
                            ]),

                        Section::make('Inventory Pools')
                            ->description('Define totals per Block × House Type. Counts Held/Reserved/Sold start at 0.')
                            ->schema([
                                Repeater::make('pools')
                                    ->schema([
                                        // Pick block by code to keep things simple
                                        Select::make('block_code')
                                            ->label('Block / Tower')
                                            ->options(fn (Get $get) => collect($get('../../blocks') ?? [])
                                                ->pluck('block_code', 'block_code')
                                                ->filter()
                                                ->all()
                                            )
                                            ->native(false)
                                            ->required()
                                            ->hint('Comes from the Blocks section above'),

                                        // Pick house type by code
                                        Select::make('house_type_code')
                                            ->label('House Type')
                                            ->options(fn (Get $get) => collect($get('../../house_types') ?? [])
                                                ->pluck('code', 'code')
                                                ->filter()
                                                ->all()
                                            )
                                            ->native(false)
                                            ->required()
                                            ->hint('Comes from the House Types section above'),

                                        TextInput::make('total')
                                            ->numeric()
                                            ->minValue(0)
                                            ->required()
                                            ->default(0)
                                            ->label('Total Released'),
                                    ])
                                    ->minItems(1)
                                    ->addActionLabel('Add Pool Row')
                                    ->columns(3),
                            ]),
                    ])
                    ->action(function (array $data, Developer $record) {
                        // 1) Create Project under this Developer
                        $p = Arr::get($data, 'project', []);
                        $project = Project::create([
                            'developer_id' => $record->id,
                            'name'         => $p['name'] ?? 'Untitled Project',
                            'type'         => $p['type'] ?? 'subdivision',
                            'address'      => $p['address'] ?? null,
                            'city'         => $p['city'] ?? null,
                            'province'     => $p['province'] ?? null,
                            'status'       => $p['status'] ?? 'active',
                        ]);

                        // 2) Create Blocks (unique per project by block_code)
                        $blocksInput = collect($data['blocks'] ?? []);
                        $blocksMap = []; // code => id
                        $blocksInput->each(function ($b) use ($project, &$blocksMap) {
                            if (!filled($b['block_code'] ?? null)) return;
                            $blk = Block::firstOrCreate([
                                'project_id' => $project->id,
                                'block_code' => $b['block_code'],
                            ]);
                            $blocksMap[$b['block_code']] = $blk->id;
                        });

                        // 3) Create House Types
                        $typesInput = collect($data['house_types'] ?? []);
                        $typesMap = []; // code => id
                        $typesInput->each(function ($t) use ($project, &$typesMap) {
                            if (!filled($t['code'] ?? null)) return;
                            $ht = HouseType::firstOrCreate(
                                ['project_id' => $project->id, 'code' => $t['code']],
                                ['name' => $t['name'] ?? $t['code'], 'base_price' => $t['base_price'] ?? null, 'is_active' => (bool)($t['is_active'] ?? true)]
                            );
                            $typesMap[$t['code']] = $ht->id;
                        });

                        // 4) Create Inventory Pools (Total / Held / Reserved / Sold)
                        $poolsInput = collect($data['pools'] ?? []);
                        $poolsInput->each(function ($row) use ($project, $blocksMap, $typesMap) {
                            $blockId = $blocksMap[$row['block_code']] ?? null;
                            $typeId  = $typesMap[$row['house_type_code']] ?? null;
                            if (!$typeId) return; // require house type; block can be null if you allow project-wide pools

                            InventoryPool::firstOrCreate(
                                [
                                    'project_id'    => $project->id,
                                    'block_id'      => $blockId,      // can be null if you don’t track by block
                                    'house_type_id' => $typeId,
                                ],
                                [
                                    'total'    => (int)($row['total'] ?? 0),
                                    'held'     => 0,
                                    'reserved' => 0,
                                    'sold'     => 0,
                                ]
                            );
                        });

                        Notification::make()
                            ->title('Project & Inventory created')
                            ->body("{$project->name} was set up successfully under {$record->name}.")
                            ->success()
                            ->send();
                    }),

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
            AmenitiesRelationManager::class,
            ProjectsRelationManager::class,
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
