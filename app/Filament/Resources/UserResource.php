<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Password;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon  = 'heroicon-o-user-group';
    protected static ?string $modelLabel      = 'User';
    protected static ?string $pluralModelLabel = 'Users';
    protected static ?int    $navigationSort  = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Account')
                ->schema([
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
                    Forms\Components\Select::make('role')
                        ->options([
                            'superadmin' => 'Super Admin',
                            'admin'      => 'Admin',
                            'broker'     => 'Broker',
                            'agent'      => 'Agent',
                            'seller'     => 'Seller',
                            'buyer'      => 'Buyer',
                        ])
                        ->required()
                        ->native(false),
                    Forms\Components\TextInput::make('password')
                        ->password()
                        ->revealable()
                        ->dehydrated(fn ($state) => filled($state))
                        ->helperText('Leave blank to keep current password'),
                ])->columns(2),

            Forms\Components\Section::make('Profile')
                ->schema([
                    Forms\Components\FileUpload::make('photo_url')
                        ->label('Avatar')
                        ->image()
                        ->disk('public')
                        ->visibility('public')
                        ->imagePreviewHeight('150')
                        ->maxSize(2048)
                        ->acceptedFileTypes(['image/jpeg','image/png','image/webp'])
                        ->openable()
                        ->downloadable()
                        ->hint('PNG/JPG/WebP up to 2MB'),

                    Forms\Components\TextInput::make('contact_number')->tel()->maxLength(50),

                    // 👇 NEW: Gender dropdown
                    Forms\Components\Select::make('gender')
                        ->label('Gender')
                        ->options([
                            'male'               => 'Male',
                            'female'             => 'Female',
                            'nonbinary'          => 'Non-binary',
                            'prefer_not_to_say'  => 'Prefer not to say',
                            'other'              => 'Other',
                        ])
                        ->native(false)
                        ->nullable(),

                    // 👇 NEW: Birth date picker
                    Forms\Components\DatePicker::make('birth_date')
                        ->label('Birth Date')
                        ->native(false)
                        ->displayFormat('Y-m-d')
                        ->maxDate(now())                 // can’t be in the future
                        ->minDate(now()->subYears(100))  // optional: limit to last 100 years
                        ->nullable(),

                    Forms\Components\Textarea::make('address')->rows(2)->columnSpanFull(),
                    Forms\Components\Textarea::make('bio')->rows(3)->columnSpanFull(),
                    Forms\Components\TextInput::make('broker_id')->numeric()->label('Broker ID'),
                    Forms\Components\Select::make('status')
                        ->options(['active'=>'Active','inactive'=>'Inactive','pending'=>'Pending'])
                        ->default('active')
                        ->native(false),
                    Forms\Components\DateTimePicker::make('email_verified_at')->label('Email Verified At')->native(false),
                    Forms\Components\DateTimePicker::make('last_login')->native(false),
                ])->columns(2),
        ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // Avatar if you store a URL
                Tables\Columns\ImageColumn::make('photo_url')
                    ->disk('public')
                    ->visibility('public')
                    ->default('https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg')
                    ->circular()
                    ->width(36)->height(36),

                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Email copied')
                    ->copyMessageDuration(1500),

                Tables\Columns\BadgeColumn::make('role')
                    ->colors([
                        'danger'  => 'superadmin',
                        'success' => 'admin',
                        'info'    => 'broker',
                        'warning' => 'agent',
                        'gray'    => fn ($state) => in_array($state, ['seller','buyer']),
                    ])
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'pending',
                        'gray'    => 'inactive',
                    ])
                    ->sortable(),

                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->tooltip(fn ($record) => $record->email_verified_at?->format('M d, Y H:i')),

                Tables\Columns\TextColumn::make('last_login')
                    ->dateTime()
                    ->since()
                    ->label('Last Login')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M d, Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'superadmin' => 'Super Admin',
                        'admin'      => 'Admin',
                        'broker'     => 'Broker',
                        'agent'      => 'Agent',
                        'seller'     => 'Seller',
                        'buyer'      => 'Buyer',
                    ])
                    ->label('Role'),

                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active'   => 'Active',
                        'inactive' => 'Inactive',
                        'pending'  => 'Pending',
                    ])
                    ->label('Status'),

                Tables\Filters\TernaryFilter::make('email_verified_at')
                    ->label('Verified Email')
                    ->nullable()
                    ->boolean(),
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
            ->defaultSort('created_at', 'desc')
            ->striped(); // subtle zebra rows for readability
    }

    public static function getRelations(): array
    {
        return [
            // If you want to attach relation managers (e.g., listings, deals), tell me which ones and I’ll add them.
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
