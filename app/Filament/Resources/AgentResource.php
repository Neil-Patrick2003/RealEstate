<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AgentResource\Pages;
use App\Filament\Resources\AgentResource\RelationManagers\PropertyListingsRelationManager;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\HtmlString;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str; // fixed: use Illuminate\Support\Str

class AgentResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon   = 'heroicon-o-user';
    protected static ?string $modelLabel       = 'Agent';
    protected static ?string $pluralModelLabel = 'Agents';

    /** Default avatar used in table + form previews */
    protected const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg';

    public static function getEloquentQuery(): Builder
    {
        // Show only users with role=agent
        return parent::getEloquentQuery()->where('role', 'agent');
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) User::where('role', 'agent')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'info';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Account')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('email')
                        ->label('Email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->maxLength(255)
                        ->afterStateUpdated(fn ($state, callable $set) => $set('email', Str::lower($state))), // normalize

                    Forms\Components\Hidden::make('role')
                        ->default('Agent')
                        ->dehydrated(),

                    Forms\Components\TextInput::make('password')
                        ->password()
                        ->revealable()
                        ->rule(Password::defaults())
                        ->required(fn (string $context) => $context === 'create')
                        ->dehydrated(fn ($state) => filled($state))
                        ->dehydrateStateUsing(fn ($state) => filled($state) ? Hash::make($state) : null)
                        ->helperText('Leave blank to keep current password'),
                ]),

            Forms\Components\Section::make('Profile')
                ->columns(2)
                ->schema([
                    Forms\Components\FileUpload::make('photo_url')
                        ->label('Avatar')
                        ->image()
                        ->directory('avatar')
                        ->disk('public')
                        ->visibility('public')
                        ->imagePreviewHeight('150')
                        ->maxSize(2048)
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                        ->openable()
                        ->downloadable()
                        ->hint('Square images look best'),

                    Forms\Components\TextInput::make('contact_number')
                        ->label('Contact Number')
                        ->tel()
                        ->maxLength(50)
                        ->nullable(),

                    Forms\Components\Select::make('gender')
                        ->label('Gender')
                        ->options([
                            'male'              => 'Male',
                            'female'            => 'Female',
                            'nonbinary'         => 'Non-binary',
                            'prefer_not_to_say' => 'Prefer not to say',
                            'other'             => 'Other',
                        ])
                        ->native(false)
                        ->nullable(),

                    Forms\Components\DatePicker::make('birth_date')
                        ->label('Birth Date')
                        ->native(false)
                        ->displayFormat('Y-m-d')
                        ->maxDate(now())
                        ->minDate(now()->subYears(100))
                        ->nullable(),

                    Forms\Components\Select::make('broker_id')
                        ->label('Broker')
                        ->options(fn () => User::query()
                            ->where('role', 'broker')
                            ->orderBy('name')
                            ->pluck('name', 'id')
                            ->all())
                        ->searchable()
                        ->preload()
                        ->native(false)
                        ->placeholder('Select a broker')
                        ->nullable()
                        ->rules([
                            Rule::exists('users', 'id')->where('role', 'broker'),
                        ]),

                    Forms\Components\TextInput::make('rating')
                        ->numeric()
                        ->suffix('%')
                        ->label('Commission Rate')
                        ->nullable(),

                    Forms\Components\Textarea::make('address')
                        ->rows(2)
                        ->columnSpanFull()
                        ->nullable(),

                    Forms\Components\Textarea::make('bio')
                        ->rows(3)
                        ->columnSpanFull()
                        ->nullable(),

                    Forms\Components\Select::make('status')
                        ->options([
                            'active'   => 'Active',
                            'inactive' => 'Inactive',
                            'pending'  => 'Pending',
                        ])
                        ->default('active')
                        ->native(false),

                    Forms\Components\DateTimePicker::make('email_verified_at')
                        ->label('Email Verified At')
                        ->native(false)
                        ->nullable(),

                    Forms\Components\DateTimePicker::make('last_login')
                        ->label('Last Login')
                        ->native(false)
                        ->nullable(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // Avatar
                Tables\Columns\ImageColumn::make('photo_url')
                    ->disk('public')
                    ->circular()
                    ->width(36)
                    ->height(36)
                    ->defaultImageUrl(self::DEFAULT_AVATAR),

                // Name + email + phone (custom HTML block)
                Tables\Columns\TextColumn::make('name')
                    ->label('Agent')
                    ->alignLeft()
                    ->html()
                    ->sortable(query: fn (Builder $q, $dir) => $q->orderBy('name', $dir))
                    ->searchable(query: function (Builder $query, string $search) {
                        $query->where(fn ($q) => $q
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('contact_number', 'like', "%{$search}%"));
                    })
                    ->formatStateUsing(function ($state, $record) {
                        $email = e($record->email ?? '—');
                        $phoneRaw = $record->contact_number ?? null;
                        $phone = e($phoneRaw ?: '—');

                        return new HtmlString("
                            <div class='flex items-start gap-3 text-left'>
                                <div class='flex flex-col leading-tight'>
                                    <div class='font-semibold text-gray-900 dark:text-gray-100'>".e($record->name ?? '—')."</div>
                                    <div class='text-sm'>
                                        <a href='mailto:{$email}' class='text-primary-600 dark:text-primary-400 hover:underline'>{$email}</a>
                                    </div>
                                    <div class='text-sm text-gray-500 dark:text-gray-400'>
                                        <a href='tel:".preg_replace('/[^+\d]/', '', $phoneRaw ?? '')."' class='hover:underline'>{$phone}</a>
                                    </div>
                                </div>
                            </div>
                        ");
                    }),

                Tables\Columns\TextColumn::make('gender')
                    ->placeholder('—')
                    ->toggleable(),

                // Broker (nice for teams)
                Tables\Columns\TextColumn::make('broker.name')
                    ->label('Broker')
                    ->placeholder('—')
                    ->sortable()
                    ->toggleable(),

                // Status as badges
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'pending',
                        'gray'    => 'inactive',
                    ])
                    ->sortable(),

                // Performance (Total / Active / Joined)
                Tables\Columns\TextColumn::make('property_listings')
                    ->label('Performance')
                    ->html()
                    ->alignCenter()
                    ->formatStateUsing(function ($state, $record) {
                        if (!method_exists($record, 'property_listings')) return '—';

                        $total  = (int) $record->property_listings()->count();
                        $active = (int) $record->property_listings()->where('status', 'Published')->count();
                        $date   = $record->created_at?->format('M d, Y') ?? '—';

                        if ($total === 0 && $active === 0 && $date === '—') return '—';

                        return new HtmlString("
                            <div class='leading-tight text-left'>
                                <span class='block text-gray-900 dark:text-gray-100 font-semibold text-sm'>Total: " . ($total ?: '—') . "</span>
                                <span class='block text-green-600 dark:text-green-400 text-sm'>Active: " . ($active ?: '—') . "</span>
                                <span class='block text-xs text-gray-500 dark:text-gray-400 italic'>Joined: {$date}</span>
                            </div>
                        ");
                    }),

                // Feedbacks (Stars + count)
                Tables\Columns\TextColumn::make('average_feedback')
                    ->label('Feedbacks')
                    ->alignCenter()
                    ->formatStateUsing(function ($state, $record) {
                        if (!$state) {
                            $count = (int) $record->feedbackAsReceiver()->count();
                            return $count > 0 ? "— ({$count})" : '—';
                        }

                        $count  = (int) $record->feedbackAsReceiver()->count();
                        $filled = (int) floor($state);
                        $half   = ($state - $filled) >= 0.5 ? 1 : 0;
                        $empty  = 5 - ($filled + $half);

                        $stars = str_repeat('⭐', $filled)
                            . str_repeat('✨', $half)
                            . str_repeat('☆', $empty);

                        return "{$stars} " . number_format((float) $state, 1) . " ({$count})";
                    }),

                Tables\Columns\TextColumn::make('rating')
                    ->label('Commission Rate')
                    ->numeric(decimalPlaces: 2)
                    ->suffix('%')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Joined')
                    ->date('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active'   => 'Active',
                        'inactive' => 'Inactive',
                        'pending'  => 'Pending',
                    ])
                    ->label('Status'),

                Tables\Filters\SelectFilter::make('gender')
                    ->options([
                        'male'              => 'Male',
                        'female'            => 'Female',
                        'nonbinary'         => 'Non-binary',
                        'prefer_not_to_say' => 'Prefer not to say',
                        'other'             => 'Other',
                    ])
                    ->label('Gender'),

                Tables\Filters\SelectFilter::make('broker_id')
                    ->label('Broker')
                    ->options(fn () => User::query()
                        ->where('role', 'broker')
                        ->orderBy('name')
                        ->pluck('name', 'id')
                        ->all())
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('email_verified_at')
                    ->label('Verified Email')
                    ->nullable()
                    ->boolean(),

                // Date range filter on created_at
                Tables\Filters\Filter::make('created_at_range')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')->label('Joined from'),
                        Forms\Components\DatePicker::make('created_until')->label('Joined until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['created_from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['created_until'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    }),
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

                // Quick status toggle
                Tables\Actions\Action::make('toggle_status')
                    ->icon('heroicon-o-adjustments-vertical')
                    ->iconButton()
                    ->tooltip('Toggle Active/Inactive')
                    ->action(function (User $record) {
                        $record->update([
                            'status' => $record->status === 'active' ? 'inactive' : 'active',
                        ]);
                    })
                    ->visible(fn (User $record) => in_array($record->status, ['active', 'inactive'])),

                Tables\Actions\DeleteAction::make()
                    ->icon('heroicon-o-trash')
                    ->iconButton()
                    ->tooltip('Delete')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No agents yet')
            ->emptyStateDescription('Create your first agent to get started.')
            ->defaultSort('created_at', 'desc')
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            PropertyListingsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListAgents::route('/'),
            'create' => Pages\CreateAgent::route('/create'),
            'edit'   => Pages\EditAgent::route('/{record}/edit'),
        ];
    }
}
