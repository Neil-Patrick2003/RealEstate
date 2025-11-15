<?php

namespace App\Filament\Resources\DeveloperResource\RelationManagers;

use App\Models\Block;
use App\Models\HouseType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;

class ProjectsRelationManager extends RelationManager
{
    protected static string $relationship = 'projects';   // Developer::projects()
    protected static ?string $title = 'Projects';
    protected static ?string $icon  = 'heroicon-o-home-modern';

    public function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Project Info')->schema([
                FileUpload::make('project_img')
                    ->label('Project Cover Image')
                    ->disk('public')
                    ->directory('projects')
                    ->visibility('public')
                    ->image()
                    ->imageEditor()
                    ->imageCropAspectRatio('16:9')
                    ->imagePreviewHeight('180')
                    ->preserveFilenames()
                    ->openable()
                    ->downloadable()
                    ->columnSpanFull(),

                Grid::make(2)->schema([
                    TextInput::make('name')
                        ->label('Project Name')
                        ->required()
                        ->maxLength(150),

                    Select::make('type')
                        ->label('Type')
                        ->options([
                            'subdivision' => 'Subdivision',
                            'condo'       => 'Condo',
                            'mixed'       => 'Mixed Use',
                        ])
                        ->required()
                        ->native(false),

                    TextInput::make('address')->label('Address')->maxLength(255)->columnSpanFull(),

                    Grid::make(2)->schema([
                        TextInput::make('city')->label('City')->maxLength(100),
                        TextInput::make('province')->label('Province')->maxLength(100),
                    ]),

                    Select::make('status')
                        ->label('Status')
                        ->options(['active' => 'Active', 'draft' => 'Draft'])
                        ->default('active')
                        ->native(false),
                ]),
            ])->columns(1),

            // 🔹 NEW: Inline Inventory Pools editor
            Section::make('Inventory Pools')
                ->description('Manage per Block × House Type supply and status counts.')
                ->schema([
                    Repeater::make('inventoryPools')
                        ->relationship('inventoryPools')  // binds to Project::inventoryPools()
                        ->addActionLabel('Add Pool')
                        ->reorderable(false)
                        ->defaultItems(0)
                        ->schema([
                            Grid::make(4)->schema([
                                // Block (optional)
                                Select::make('block_id')
                                    ->label('Block / Tower')
                                    ->native(false)
                                    ->searchable()
                                    // Uses the current Project record to limit options:
                                    ->options(function (?Get $get, $livewire) {
                                        /** @var \Filament\Resources\RelationManagers\RelationManager $livewire */
                                        $project = $livewire->getMountedTableActionRecord() ?? $livewire->getMountedFormModel();
                                        $projectId = optional($project)->id;
                                        if (!$projectId) return [];
                                        return Block::query()
                                            ->where('project_id', $projectId)
                                            ->orderBy('block_code')
                                            ->pluck('block_code', 'id')
                                            ->all();
                                    })
                                    ->placeholder('— None / Project-wide —'),

                                // House Type (required)
                                Select::make('house_type_id')
                                    ->label('House Type')
                                    ->required()
                                    ->native(false)
                                    ->searchable()
                                    ->options(function (?Get $get, $livewire) {
                                        /** @var \Filament\Resources\RelationManagers\RelationManager $livewire */
                                        $project = $livewire->getMountedTableActionRecord() ?? $livewire->getMountedFormModel();
                                        $projectId = optional($project)->id;
                                        if (!$projectId) return [];
                                        return HouseType::query()
                                            ->where('project_id', $projectId)
                                            ->orderBy('code')
                                            ->pluck('code', 'id')
                                            ->all();
                                    }),

                                // Totals
                                TextInput::make('total')
                                    ->label('Total Released')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->required(),

                                // For readability
                                TextInput::make('held')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->label('Held'),
                            ]),

                            Grid::make(3)->schema([
                                TextInput::make('reserved')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->label('Reserved'),

                                TextInput::make('sold')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->label('Sold'),

                                TextInput::make('available')
                                    ->label('Available (auto)')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->afterStateHydrated(function (TextInput $component, Get $get) {
                                        $total = (int) $get('total');
                                        $held = (int) $get('held');
                                        $reserved = (int) $get('reserved');
                                        $sold = (int) $get('sold');
                                        $component->state(max(0, $total - ($held + $reserved + $sold)));
                                    })
                                    ->reactive()
                                    ->suffixIcon('heroicon-o-calculator'),
                            ]),
                        ])
                        // Basic guard that counts cannot exceed total
                        ->afterStateUpdated(function ($state, callable $set) {
                            foreach ((array) $state as $i => $row) {
                                $total    = (int) ($row['total'] ?? 0);
                                $held     = (int) ($row['held'] ?? 0);
                                $reserved = (int) ($row['reserved'] ?? 0);
                                $sold     = (int) ($row['sold'] ?? 0);
                                $used     = $held + $reserved + $sold;

                                if ($used > $total) {
                                    // clamp the last-edited field by pushing reserved down
                                    $diff = $used - $total;
                                    $row['reserved'] = max(0, $reserved - $diff);
                                }

                                $available = max(0, $total - ($row['held'] + $row['reserved'] + $row['sold']));
                                $row['available'] = $available;

                                // write back
                                $state[$i] = $row;
                            }
                            $set('inventoryPools', $state);
                        })
                        ->columns(1),
                ])
                ->collapsible()
                ->compact(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->defaultSort('created_at', 'desc')
            ->columns([
                ImageColumn::make('project_img')
                    ->label('Cover')
                    ->disk('public')
                    ->height(48)
                    ->width(86)
                    ->extraImgAttributes(['class' => 'rounded-md object-cover'])
                    ->toggleable(),

                TextColumn::make('name')
                    ->label('Project')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                BadgeColumn::make('type')
                    ->colors([
                        'primary' => 'subdivision',
                        'info'    => 'condo',
                        'warning' => 'mixed',
                    ])
                    ->sortable(),

                BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'gray'    => 'draft',
                    ])
                    ->icon(fn ($state) => $state === 'active'
                        ? 'heroicon-o-check-badge'
                        : 'heroicon-o-pause-circle')
                    ->sortable(),

                TextColumn::make('city')->toggleable(),
                TextColumn::make('province')->toggleable(),
                TextColumn::make('created_at')->dateTime('Y-m-d H:i')->toggleable()->sortable(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
