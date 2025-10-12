<?php

namespace App\Filament\Resources\PropertyImageResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images'; // from Property::images()

    protected static ?string $title = 'Gallery';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\FileUpload::make('image_url')
                ->label('Property Image')
                ->image()
                ->directory('properties/gallery')
                ->disk('public')
                ->visibility('public')
                ->imageEditor()
                ->imagePreviewHeight('220')
                ->maxSize(4096)
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                ->required()
                ->helperText('Upload clear property photos (JPG, PNG, WebP).')
                ->columnSpanFull(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->contentGrid([
                'md' => 3,  // 3 columns on medium screens
                'lg' => 5,  // 5 columns on large screens
            ])
            ->columns([
                Tables\Columns\ImageColumn::make('image_url')
                    ->label(' ')
                    ->getStateUsing(function ($record) {
                        $raw = $record->image_url;

                        if (blank($raw)) return null;

                        if (str_starts_with($raw, 'http')) {
                            return $raw;
                        }

                        if (str_starts_with($raw, '/storage') || str_starts_with($raw, 'storage')) {
                            return asset(ltrim($raw, '/'));
                        }

                        return Storage::disk('public')->url($raw);
                    })
                    ->height(160)
                    ->width('100%')
                    ->extraImgAttributes([
                        'class' => 'object-cover rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm transition-transform duration-200 hover:scale-105',
                    ])
                    ->openUrlInNewTab(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add Image')
                    ->icon('heroicon-o-photo')
                    ->button()
                    ->color('primary'),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make()
                    ->icon('heroicon-o-trash')
                    ->color('danger')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }
}
