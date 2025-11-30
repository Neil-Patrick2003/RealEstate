<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BlogResource\Pages;
use App\Models\Blog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use Filament\Forms\Set;

class BlogResource extends Resource
{
    protected static ?string $model = Blog::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'Blogs';
    protected static ?string $navigationGroup = 'Content Management';
    protected static ?string $modelLabel = 'Blog Post';
    protected static ?string $pluralModelLabel = 'Blog Posts';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make()
                    ->schema([
                        // Main Content Column
                        Forms\Components\Section::make('Blog Content')
                            ->schema([
                                Forms\Components\TextInput::make('title')
                                    ->label('Blog Title')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (Set $set, $state) {
                                        // Generate a URL-friendly version for internal reference
                                        $set('title_slug', Str::slug($state));
                                    })
                                    ->columnSpanFull(),

                                Forms\Components\TextInput::make('title_slug')
                                    ->label('URL Friendly Title')
                                    ->maxLength(255)
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->helperText('Auto-generated for reference')
                                    ->columnSpanFull(),

                                Forms\Components\RichEditor::make('content')
                                    ->label('Blog Content')
                                    ->required()
                                    ->columnSpanFull()
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory('blogs/attachments')
                                    ->toolbarButtons([
                                        'bold',
                                        'italic',
                                        'underline',
                                        'strike',
                                        'blockquote',
                                        'bulletList',
                                        'orderedList',
                                        'link',
                                        'heading',
                                        'h2',
                                        'h3',
                                        'codeBlock',
                                        'table',
                                        'undo',
                                        'redo',
                                    ])
                                    ->extraInputAttributes(['style' => 'min-height: 400px;']),
                            ])
                            ->columns(1)
                            ->columnSpan(['lg' => 2]),

                        // Sidebar Column
                        Forms\Components\Section::make('Media & Settings')
                            ->schema([
                                Forms\Components\FileUpload::make('img_url')
                                    ->label('Featured Image')
                                    ->image()
                                    ->disk('public')
                                    ->directory('blogs')
                                    ->imagePreviewHeight('200')
                                    ->imageResizeMode('cover')
                                    ->imageCropAspectRatio('16:9')
                                    ->imageResizeTargetWidth('800')
                                    ->openable()
                                    ->downloadable()
                                    ->nullable()
                                    ->helperText('Recommended size: 800x450 pixels')
                                    ->columnSpanFull(),

                                Forms\Components\Toggle::make('is_published')
                                    ->label('Published')
                                    ->default(true)
                                    ->helperText('Uncheck to hide from public view')
                                    ->columnSpanFull(),

                                Forms\Components\Placeholder::make('created_at')
                                    ->label('Created')
                                    ->content(fn ($record) => $record?->created_at ? $record->created_at->format('M d, Y g:i A') : 'N/A')
                                    ->hiddenOn('create'),

                                Forms\Components\Placeholder::make('updated_at')
                                    ->label('Last Updated')
                                    ->content(fn ($record) => $record?->updated_at ? $record->updated_at->format('M d, Y g:i A') : 'N/A')
                                    ->hiddenOn('create'),
                            ])
                            ->columnSpan(['lg' => 1]),
                    ])
                    ->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('img_url')
                    ->label('Image')
                    ->disk('public')
                    ->square()
                    ->size(60)
                    ->toggleable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('title')
                    ->label('Title')
                    ->searchable()
                    ->limit(50)
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= 50) {
                            return null;
                        }
                        return $state;
                    })
                    ->sortable()
                    ->weight('medium')
                    ->description(fn (Blog $record) => Str::limit(strip_tags($record->content), 80)),


                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('draft_posts')
                    ->label('Drafts')
                    ->query(fn ($query) => $query->where('is_published', false)),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('From date'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('Until date'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn ($query, $date) => $query->whereDate('created_at', '>=', $date)
                            )
                            ->when(
                                $data['created_until'],
                                fn ($query, $date) => $query->whereDate('created_at', '<=', $date)
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->icon('heroicon-o-pencil')
                    ->tooltip('Edit')
                    ->color('primary'),

                Tables\Actions\DeleteAction::make()
                    ->icon('heroicon-o-trash')
                    ->tooltip('Delete'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('publish_selected')
                        ->label('Publish Selected')
                        ->icon('heroicon-o-eye')
                        ->action(function ($records) {
                            $records->each->update(['is_published' => true]);
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('unpublish_selected')
                        ->label('Unpublish Selected')
                        ->icon('heroicon-o-eye-slash')
                        ->action(function ($records) {
                            $records->each->update(['is_published' => false]);
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->icon('heroicon-o-plus')
                    ->label('New Blog Post'),
            ])
            ->defaultSort('created_at', 'desc')
            ->reorderable('created_at')
            ->persistSortInSession()
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            // Relations can be added here when you expand your database structure
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListBlogs::route('/'),
            'create' => Pages\CreateBlog::route('/create'),
            'edit'   => Pages\EditBlog::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'primary';
    }
}
