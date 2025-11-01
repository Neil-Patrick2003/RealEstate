<?php

namespace App\Filament\Resources\DeveloperResource\RelationManagers;

use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;

class ProjectsRelationManager extends RelationManager
{
    protected static string $relationship = 'projects';   // Developer::projects()

    protected static ?string $title = 'Projects';
    protected static ?string $icon = 'heroicon-o-home-modern';

    public function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Project Info')->schema([
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
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Project')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                Tables\Columns\BadgeColumn::make('type')
                    ->colors([
                        'primary' => 'subdivision',
                        'info'    => 'condo',
                        'warning' => 'mixed',
                    ])
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'gray'    => 'draft',
                    ])
                    ->icon(fn ($state) => $state === 'active'
                        ? 'heroicon-o-check-badge'
                        : 'heroicon-o-pause-circle')
                    ->sortable(),

                Tables\Columns\TextColumn::make('city')->toggleable(),
                Tables\Columns\TextColumn::make('province')->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime('Y-m-d H:i')->toggleable()->sortable(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),  // create project inline, auto-links to this developer
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
