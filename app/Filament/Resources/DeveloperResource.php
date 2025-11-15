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
use Filament\Forms\Get;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

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
            Section::make('Identity')
                ->schema([
                    FileUpload::make('company_logo')
                        ->label('Company Logo')
                        ->disk('public')
                        ->directory('company_logo')
                        ->image()->imageEditor()
                        ->imageCropAspectRatio('1:1')
                        ->imagePreviewHeight('150')
                        ->openable()->downloadable()
                        ->columnSpanFull(),

                    TextInput::make('name')->label('Developer Name')->required()->maxLength(255),
                    TextInput::make('trade_name')->label('Trade Name')->maxLength(255),

                    Select::make('status')->label('Status')->required()
                        ->options(['pending'=>'Pending','verified'=>'Verified','inactive'=>'Inactive'])
                        ->default('pending')->native(false),

                    TextInput::make('email')->email()->required()->maxLength(255),
                ])
                ->columns(2)
                ->compact(),

            Section::make('Contact & Compliance')
                ->schema([
                    TextInput::make('head_office_address')->label('Head Office Address')->maxLength(255)->columnSpan(3),
                    TextInput::make('registration_number')->label('Registration No.')->required()->maxLength(255),
                    TextInput::make('license_number')->label('License No.')->required()->maxLength(255),
                    Hidden::make('broker_id')->default(fn () => auth()->id()),
                ])
                ->columns(3)
                ->compact(),

            Section::make('Links')
                ->schema([
                    TextInput::make('website_url')->label('Website')->url()->maxLength(255),
                    TextInput::make('facebook_url')->label('Facebook Page')->url()->maxLength(255),
                ])
                ->columns(2)
                ->collapsible()
                ->compact(),

            Section::make('About')
                ->schema([
                    RichEditor::make('description')
                        ->toolbarButtons(['bold','italic','strike','bulletList','orderedList','link','blockquote','redo','undo'])
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
                ImageColumn::make('company_logo')->label('Logo')->disk('public')->height(40)->width(40)->circular(),
                TextColumn::make('name')->label('Developer')->searchable()->sortable()->weight('semibold'),
                BadgeColumn::make('status')
                    ->colors(['warning'=>'pending','success'=>'verified','gray'=>'inactive'])
                    ->icons(['heroicon-o-clock'=>'pending','heroicon-o-check-circle'=>'verified','heroicon-o-pause-circle'=>'inactive'])
                    ->sortable(),
                TextColumn::make('email')->searchable()->copyable(),
                TextColumn::make('trade_name')->toggleable(isToggledHiddenByDefault: true)->searchable()->wrap(),
                TextColumn::make('website_url')->label('Website')->url(fn ($r) => $r->website_url, true)
                    ->openUrlInNewTab()->copyable()->limit(30)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('facebook_url')->label('Facebook')->url(fn ($r) => $r->facebook_url, true)
                    ->openUrlInNewTab()->copyable()->limit(30)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('registration_number')->label('Reg. No.')->limit(18)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('license_number')->label('License No.')->limit(18)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')->dateTime('Y-m-d H:i')->sortable()->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')->dateTime('Y-m-d H:i')->sortable()->toggleable(isToggledHiddenByDefault: true),
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

                Tables\Actions\Action::make('setupProjectAndUnits')
                    ->label('Setup Project & Units')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->modalHeading('Create Project, House Types & Units')
                    ->form([
                        /* Project */
                        Section::make('Project Info')->schema([
                            FileUpload::make('project.project_img')
                                ->label('Project Cover Image')
                                ->disk('public')->directory('projects')->visibility('public')
                                ->image()->imageEditor()->imageCropAspectRatio('16:9')
                                ->imagePreviewHeight('180')
                                ->preserveFilenames()
                                ->openable()->downloadable()
                                ->columnSpanFull(),

                            TextInput::make('project.name')->label('Project Name')->required()->maxLength(150),
                            Select::make('project.type')->label('Project Type')->options([
                                'subdivision'=>'Subdivision','condo'=>'Condo','mixed'=>'Mixed Use',
                            ])->required()->native(false),
                            TextInput::make('project.address')->label('Address')->maxLength(255),
                            TextInput::make('project.city')->label('City')->maxLength(100),
                            TextInput::make('project.province')->label('Province')->maxLength(100),
                            Select::make('project.status')->label('Status')
                                ->options(['active'=>'Active','draft'=>'Draft'])->default('active')->native(false),
                        ])->columns(2),

                        /* Blocks */
                        Section::make('Blocks / Towers')->description('Add block codes (B1, B2) or tower names.')
                            ->schema([
                                Repeater::make('blocks')->schema([
                                    TextInput::make('block_code')
                                        ->label('Block / Tower Code')
                                        ->required()->maxLength(50),
                                ])->minItems(0)->addActionLabel('Add Block / Tower')->columns(1),
                            ]),

                        /* House Types (labels only) */
                        Section::make('House Types / Models')->description('Labels only (code + display name).')
                            ->schema([
                                Repeater::make('house_types')->schema([
                                    TextInput::make('code')->label('Code')
                                        ->placeholder('SINGLE / DUPLEX / STUDIO')
                                        ->required()->maxLength(50),
                                    TextInput::make('name')->label('Display Name')
                                        ->placeholder('Single / Duplex / Studio')
                                        ->required()->maxLength(120),
                                ])->minItems(0)->addActionLabel('Add House Type')->columns(2),
                            ]),

                        /* Units → Properties (with images & features) */
                        Section::make('Units → Properties')
                            ->description('Define units per block. Will create Property rows with images & features.')
                            ->schema([
                                Repeater::make('units')->schema([
                                    /* Select block from previous section */
                                    Select::make('block_code')->label('Block / Tower')
                                        ->options(fn (Get $get) => collect($get('../../blocks') ?? [])
                                            ->pluck('block_code', 'block_code')
                                            ->filter()
                                            ->all())
                                        ->native(false)->searchable()->required(),

                                    TextInput::make('count')->label('How many units?')
                                        ->numeric()->minValue(1)->required()->default(1),

                                    /* Tie to house type (code) from labels section */
                                    Select::make('house_type_code')->label('House Type')
                                        ->options(fn (Get $get) => collect($get('../../house_types') ?? [])
                                            ->pluck('code', 'code')
                                            ->filter()
                                            ->all())
                                        ->native(false)->searchable()->preload(),

                                    /* Specs → go straight to properties */
                                    TextInput::make('lot_area')->label('Lot Area (sqm)')->numeric()->minValue(0)->step(0.01),
                                    TextInput::make('floor_area')->label('Floor Area (sqm)')->numeric()->minValue(0)->step(0.01),
                                    TextInput::make('bedrooms')->label('Bedrooms')->numeric()->minValue(0)->step(1),
                                    TextInput::make('bathrooms')->label('Bathrooms')->numeric()->minValue(0)->step(1),
                                    TextInput::make('car_slots')->label('Car Slots')->numeric()->minValue(0)->step(1),

                                    TextInput::make('price')->label('List Price')->numeric()->prefix('₱')->minValue(0)->step(0.01),
                                    TextInput::make('reservation')->label('Reservation Fee')->numeric()->prefix('₱')->minValue(0)->step(0.01),

                                    Forms\Components\Toggle::make('isPresell')->default(true)->label('Pre-Sell'),
                                    Forms\Components\Toggle::make('isFixPrice')->default(true)->label('Fixed Price'),

                                    /* Main image → properties.image_url */
                                    FileUpload::make('main_image')
                                        ->label('Main Image')
                                        ->disk('public')->directory('properties')
                                        ->visibility('public')
                                        ->image()->imageEditor()
                                        ->imagePreviewHeight('140')
                                        ->openable()->downloadable(),

                                    /* Gallery → property_images.image_url[] */
                                    FileUpload::make('gallery')
                                        ->label('Gallery Images')
                                        ->disk('public')->directory('properties/gallery')
                                        ->visibility('public')
                                        ->image()->imageEditor()
                                        ->multiple()
                                        ->imagePreviewHeight('100')
                                        ->openable()->downloadable(),

                                    /* Features → property_features.name[] */
                                    Repeater::make('features')
                                        ->label('Features')
                                        ->schema([
                                            TextInput::make('name')->label('Feature')->maxLength(120)->required(),
                                        ])
                                        ->minItems(0)
                                        ->addActionLabel('Add Feature')
                                        ->columns(1),

                                ])->minItems(1)->addActionLabel('Add Unit Row')->columns(3),
                            ]),
                    ])
                    ->action(function (array $data, Developer $record) {

                        DB::transaction(function () use ($data, $record) {

                            /* 1) Project */
                            $p = Arr::get($data, 'project', []);
                            $project = Project::create([
                                'developer_id' => $record->id,
                                'name'         => $p['name'] ?? 'Untitled Project',
                                'type'         => $p['type'] ?? 'subdivision', // harmless if you later drop property_type
                                'address'      => $p['address'] ?? null,
                                'city'         => $p['city'] ?? null,
                                'province'     => $p['province'] ?? null,
                                'status'       => $p['status'] ?? 'active',
                                'project_img'  => $p['project_img'] ?? null,
                            ]);

                            /* 2) Blocks (normalize code to uppercase) */
                            $blocksInput = collect($data['blocks'] ?? []);
                            $blocksInput->each(function ($b) use ($project) {
                                $code = strtoupper(trim((string)($b['block_code'] ?? '')));
                                if ($code === '') return;
                                Block::firstOrCreate([
                                    'project_id' => $project->id,
                                    'block_code' => $code,
                                ]);
                            });

                            /* 3) House Types (labels only, in-memory map) */
                            $typesInput = collect($data['house_types'] ?? []);
                            $typesByCode = []; // code => name
                            $typesInput->each(function ($t) use (&$typesByCode) {
                                $code = trim((string)($t['code'] ?? ''));
                                if ($code === '') return;
                                $typesByCode[$code] = $t['name'] ?? $code;
                            });

                            /* 4) Units → create Properties (+ images + features) */
                            $createdCount = 0;
                            $unitsInput = collect($data['units'] ?? []);

                            $unitsInput->each(function ($u) use ($project, $typesByCode, &$createdCount) {

                                $blockCode   = strtoupper(trim((string)($u['block_code'] ?? '')));
                                $count       = (int)($u['count'] ?? 0);

                                $typeCode    = trim((string)($u['house_type_code'] ?? ''));
                                $typeName    = $typeCode ? ($typesByCode[$typeCode] ?? $typeCode) : null;

                                $lotArea     = $u['lot_area'] ?? null;
                                $floorArea   = $u['floor_area'] ?? null;
                                $bedrooms    = $u['bedrooms'] ?? null;
                                $bathrooms   = $u['bathrooms'] ?? null;
                                $carSlots    = $u['car_slots'] ?? null;

                                $price       = $u['price'] ?? null;
                                $reservation = $u['reservation'] ?? null;
                                $isPresell   = (bool)($u['isPresell'] ?? true);
                                $isFixPrice  = (bool)($u['isFixPrice'] ?? true);

                                // Files/arrays coming from FileUpload / Repeater
                                $mainImage   = $u['main_image'] ?? null;               // single string or null
                                $gallery     = collect($u['gallery'] ?? [])->filter();  // array of strings
                                $features    = collect($u['features'] ?? [])           // array of ['name'=>...]
                                ->pluck('name')->filter();

                                if ($count <= 0 || $blockCode === '') return;

                                // existing lot numbers for this project+block+(typeCode if provided)
                                $existingLots = Property::query()
                                    ->where('project_id', $project->id)
                                    ->where('block_code', $blockCode)
                                    ->when($typeCode !== '', fn($q) => $q->where('sub_type', $typeCode))
                                    ->pluck('lot_no')
                                    ->filter()
                                    ->map(fn($v) => (string)$v)
                                    ->all();

                                $taken  = array_flip($existingLots);
                                $made   = 0;
                                $cursor = 1;

                                while ($made < $count && $cursor <= ($count * 3)) {
                                    $lotNo = (string)$cursor;
                                    if (!isset($taken[$lotNo])) {

                                        // Create property row
                                        $prop = Property::create([
                                            'seller_id'     => null,            // set default if required
                                            'project_id'    => $project->id,
                                            'block_code'    => $blockCode,
                                            'lot_no'        => $lotNo,
                                            'property_type' => $project->type,

                                            'title'         => trim(
                                                $project->name
                                                . ($typeName ? " • {$typeName}" : '')
                                                . " • B{$blockCode} L{$lotNo}"
                                            ),
                                            'description'   => "Auto-generated unit under {$project->name}.",

                                            // Only sub_type used (house type code)
                                            'sub_type'      => $typeCode ?: null,

                                            // pricing & flags
                                            'price'         => $price ?? 0,
                                            'reservation'   => $reservation,
                                            'isFixPrice'    => $isFixPrice ? 1 : 0,
                                            'isPresell'     => $isPresell ? 1 : 0,

                                            // specs
                                            'address'       => $project->address,
                                            'lot_area'      => $lotArea,
                                            'floor_area'    => $floorArea,
                                            'bedrooms'      => $bedrooms,
                                            'bathrooms'     => $bathrooms,
                                            'car_slots'     => $carSlots,

                                            // images/state
                                            'image_url'     => $mainImage,
                                            'status'        => 'Published',
                                            'views'         => 0,
                                            'allow_multi_agents' => 0,
                                        ]);

                                        // Gallery → property_images rows
                                        if ($gallery->isNotEmpty()) {
                                            $rows = $gallery->map(fn ($path) => [
                                                'property_id' => $prop->id,
                                                'image_url'   => $path,
                                                'created_at'  => now(),
                                                'updated_at'  => now(),
                                            ])->all();
                                            PropertyImage::insert($rows);
                                        }

                                        // Features → property_features rows
                                        if ($features->isNotEmpty()) {
                                            $frows = $features->map(fn ($name) => [
                                                'property_id' => $prop->id,
                                                'name'        => $name,
                                                'created_at'  => now(),
                                                'updated_at'  => now(),
                                            ])->all();
                                            PropertyFeature::insert($frows);
                                        }

                                        $made++;
                                        $createdCount++;
                                        $taken[$lotNo] = true;
                                    }
                                    $cursor++;
                                }
                            });

                            Notification::make()
                                ->title('Setup complete')
                                ->body("Project created. Generated {$createdCount} properties (with images & features).")
                                ->success()
                                ->send();
                        });

                        Notification::make()
                            ->title('Project saved')
                            ->body('Your project, house types, and units were created successfully.')
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
