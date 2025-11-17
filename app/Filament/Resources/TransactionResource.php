<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Property;
use App\Models\Inquiry;
use App\Models\Deal;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\TernaryFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Sales & Deals';
    protected static ?string $navigationLabel = 'Transactions';
    protected static ?string $modelLabel = 'Transaction';
    protected static ?string $pluralModelLabel = 'Transactions';
    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Transaction Details')->tabs([
                    Forms\Components\Tabs\Tab::make('Basic Information')
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Forms\Components\Section::make('Transaction Details')
                                ->description('Core transaction information')
                                ->schema([
                                    Forms\Components\TextInput::make('reference_no')
                                        ->label('Reference Number')
                                        ->maxLength(100)
                                        ->unique(ignoreRecord: true)
                                        ->required()
                                        ->placeholder('TRX-'.now()->format('Ymd-His'))
                                        ->default('TRX-'.now()->format('Ymd-His')),

                                    Forms\Components\Select::make('status')
                                        ->options([
                                            'reserved'  => '🟡 Reserved',
                                            'booked'    => '🔵 Booked',
                                            'closed'    => '🟢 Closed',
                                            'cancelled' => '🔴 Cancelled',
                                        ])
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(function ($state, Forms\Set $set) {
                                            if ($state === 'cancelled') {
                                                $set('cancelled_at', now());
                                            } elseif ($state === 'closed') {
                                                $set('closed_at', now());
                                            } elseif ($state === 'booked') {
                                                $set('booked_at', now());
                                            }
                                        }),

                                    Forms\Components\Select::make('mode_of_payment')
                                        ->options([
                                            'cash'         => '💵 Cash',
                                            'installment'  => '📅 Installment',
                                            'bank'         => '🏦 Bank Financing',
                                            'gcash'        => '📱 GCash',
                                            'check'        => '📋 Check',
                                            'credit_card'  => '💳 Credit Card',
                                        ])
                                        ->required(),

                                    Forms\Components\Textarea::make('remarks')
                                        ->rows(2)
                                        ->placeholder('Additional transaction notes...')
                                        ->columnSpanFull(),
                                ])->columns(2),
                        ]),

                    Forms\Components\Tabs\Tab::make('Parties Involved')
                        ->icon('heroicon-o-user-group')
                        ->schema([
                            Forms\Components\Section::make('Related Parties')
                                ->description('Connect transaction to related entities')
                                ->schema([
                                    Forms\Components\Select::make('inquiry_id')
                                        ->label('Inquiry')
                                        ->options(function () {
                                            return Inquiry::query()
                                                ->limit(50)
                                                ->get()
                                                ->mapWithKeys(fn ($inquiry) => [$inquiry->id => "Inquiry #{$inquiry->id}"])
                                                ->toArray();
                                        })
                                        ->searchable()
                                        ->nullable(),

                                    Forms\Components\Select::make('property_id')
                                        ->label('Property')
                                        ->options(function () {
                                            return Property::query()
                                                ->limit(50)
                                                ->get()
                                                ->mapWithKeys(fn ($property) => [$property->id => "#{$property->id} - {$property->title}"])
                                                ->toArray();
                                        })
                                        ->searchable()
                                        ->nullable(),

                                    Forms\Components\Select::make('deal_id')
                                        ->label('Deal')
                                        ->options(function () {
                                            return Deal::query()
                                                ->limit(50)
                                                ->get()
                                                ->mapWithKeys(fn ($deal) => [$deal->id => "Deal #{$deal->id}"])
                                                ->toArray();
                                        })
                                        ->searchable()
                                        ->nullable(),

                                    Forms\Components\Select::make('buyer_id')
                                        ->label('Buyer')
                                        ->options(function () {
                                            return User::where('role', 'buyer')
                                                ->limit(50)
                                                ->get()
                                                ->mapWithKeys(fn ($user) => [$user->id => $user->name])
                                                ->toArray();
                                        })
                                        ->searchable()
                                        ->required(),

                                    Forms\Components\Select::make('primary_agent_id')
                                        ->label('Primary Agent')
                                        ->options(function () {
                                            return User::where('role', 'agent')
                                                ->limit(50)
                                                ->get()
                                                ->mapWithKeys(fn ($user) => [$user->id => $user->name])
                                                ->toArray();
                                        })
                                        ->searchable()
                                        ->required(),
                                ])->columns(2),
                        ]),

                    Forms\Components\Tabs\Tab::make('Financial Details')
                        ->icon('heroicon-o-currency-dollar')
                        ->schema([
                            Forms\Components\Section::make('Pricing & Payments')
                                ->description('Transaction financial breakdown')
                                ->schema([
                                    Forms\Components\TextInput::make('base_price')
                                        ->label('Base Price')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->required()
                                        ->minValue(0),

                                    Forms\Components\TextInput::make('discount_amount')
                                        ->label('Discount Amount')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->default(0)
                                        ->minValue(0),

                                    Forms\Components\TextInput::make('fees_amount')
                                        ->label('Additional Fees')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->default(0)
                                        ->minValue(0),

                                    Forms\Components\TextInput::make('tcp')
                                        ->label('Total Contract Price (TCP)')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->required()
                                        ->minValue(0)
                                        ->helperText('Base Price - Discount + Fees'),

                                    Forms\Components\TextInput::make('reservation_amount')
                                        ->label('Reservation Amount')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->default(0)
                                        ->minValue(0),

                                    Forms\Components\TextInput::make('downpayment_amount')
                                        ->label('Downpayment Amount')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->default(0)
                                        ->minValue(0),

                                    Forms\Components\TextInput::make('balance_amount')
                                        ->label('Balance Amount')
                                        ->numeric()
                                        ->prefix('₱')
                                        ->default(0)
                                        ->minValue(0)
                                        ->helperText('TCP - Reservation - Downpayment'),

                                    Forms\Components\TextInput::make('financing')
                                        ->label('Financing Details')
                                        ->maxLength(255)
                                        ->placeholder('e.g., Bank Name, Loan Terms'),
                                ])->columns(2),

                            Forms\Components\Section::make('Payment Terms')
                                ->schema([
                                    Forms\Components\Textarea::make('payment_terms_json')
                                        ->label('Payment Terms (JSON)')
                                        ->rows(3)
                                        ->helperText('Structured payment schedule in JSON format')
                                        ->columnSpanFull(),
                                ]),
                        ]),

                    Forms\Components\Tabs\Tab::make('Timeline')
                        ->icon('heroicon-o-calendar')
                        ->schema([
                            Forms\Components\Section::make('Transaction Timeline')
                                ->description('Key dates and milestones')
                                ->schema([
                                    Forms\Components\DateTimePicker::make('reserved_at')
                                        ->label('Reserved Date'),

                                    Forms\Components\DateTimePicker::make('booked_at')
                                        ->label('Booked Date'),

                                    Forms\Components\DateTimePicker::make('closed_at')
                                        ->label('Closed Date'),

                                    Forms\Components\DateTimePicker::make('cancelled_at')
                                        ->label('Cancelled Date')
                                        ->hidden(fn (Forms\Get $get) => $get('status') !== 'cancelled'),

                                    Forms\Components\DateTimePicker::make('expires_at')
                                        ->label('Expiry Date'),
                                ])->columns(2),

                            Forms\Components\Section::make('Cancellation Details')
                                ->schema([
                                    Forms\Components\Textarea::make('cancel_reason')
                                        ->label('Cancellation Reason')
                                        ->rows(2)
                                        ->placeholder('Reason for cancellation...')
                                        ->hidden(fn (Forms\Get $get) => $get('status') !== 'cancelled')
                                        ->columnSpanFull(),
                                ]),
                        ]),
                ])->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('reference_no')
                    ->label('Ref No')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->description(fn ($record) => $record->created_at?->format('M j, Y'))
                    ->weight('bold')
                    ->color('primary'),

                Tables\Columns\TextColumn::make('buyer_id')
                    ->label('Buyer ID')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('primary_agent_id')
                    ->label('Agent ID')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'reserved' => '🟡 Reserved',
                        'booked' => '🔵 Booked',
                        'closed' => '🟢 Closed',
                        'cancelled' => '🔴 Cancelled',
                        default => $state
                    })
                    ->colors([
                        'warning' => 'reserved',
                        'info' => 'booked',
                        'success' => 'closed',
                        'danger' => 'cancelled',
                    ])
                    ->sortable(),

                Tables\Columns\TextColumn::make('tcp')
                    ->label('Total Amount')
                    ->money('PHP')
                    ->sortable()
                    ->weight('semibold')
                    ->color('success')
                    ->alignEnd(),

                Tables\Columns\TextColumn::make('mode_of_payment')
                    ->label('Payment')
                    ->formatStateUsing(fn ($state) => match($state) {
                        'cash' => '💵 Cash',
                        'installment' => '📅 Installment',
                        'bank' => '🏦 Bank',
                        'gcash' => '📱 GCash',
                        'check' => '📋 Check',
                        'credit_card' => '💳 Credit Card',
                        default => $state
                    })
                    ->badge()
                    ->color('gray')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('closed_at')
                    ->label('Closed Date')
                    ->date('M j, Y')
                    ->sortable()
                    ->toggleable()
                    ->color('success')
                    ->weight('medium'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'reserved'  => 'Reserved',
                        'booked'    => 'Booked',
                        'closed'    => 'Closed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->label('Transaction Status'),

                SelectFilter::make('mode_of_payment')
                    ->options([
                        'cash'         => 'Cash',
                        'installment'  => 'Installment',
                        'bank'         => 'Bank Financing',
                        'gcash'        => 'GCash',
                        'check'        => 'Check',
                        'credit_card'  => 'Credit Card',
                    ])
                    ->label('Payment Method'),

                Filter::make('amount_range')
                    ->form([
                        Forms\Components\TextInput::make('min_amount')
                            ->label('Min Amount')
                            ->numeric()
                            ->prefix('₱'),
                        Forms\Components\TextInput::make('max_amount')
                            ->label('Max Amount')
                            ->numeric()
                            ->prefix('₱'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['min_amount'] ?? null, fn ($q, $amount) => $q->where('tcp', '>=', $amount))
                            ->when($data['max_amount'] ?? null, fn ($q, $amount) => $q->where('tcp', '<=', $amount));
                    })
                    ->label('Amount Range'),

                Filter::make('date_range')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('From Date'),
                        Forms\Components\DatePicker::make('to')->label('To Date'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['to'] ?? null,   fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    })
                    ->label('Created Date Range'),

                TernaryFilter::make('has_cancellation')
                    ->label('Has Cancellation')
                    ->placeholder('All Transactions')
                    ->trueLabel('Cancelled Transactions')
                    ->falseLabel('Active Transactions')
                    ->queries(
                        true: fn (Builder $query) => $query->where('status', 'cancelled'),
                        false: fn (Builder $query) => $query->where('status', '!=', 'cancelled'),
                        blank: fn (Builder $query) => $query,
                    ),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->color('primary'),
                    Tables\Actions\EditAction::make()
                        ->color('warning'),
                    Tables\Actions\Action::make('mark_closed')
                        ->label('Mark as Closed')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->action(fn (Transaction $record) => $record->update(['status' => 'closed', 'closed_at' => now()]))
                        ->hidden(fn (Transaction $record) => $record->status === 'closed'),
                    Tables\Actions\DeleteAction::make()
                        ->color('danger'),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('mark_closed')
                        ->label('Mark as Closed')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['status' => 'closed', 'closed_at' => now()])),
                    Tables\Actions\BulkAction::make('mark_cancelled')
                        ->label('Mark as Cancelled')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn ($records) => $records->each->update(['status' => 'cancelled', 'cancelled_at' => now()])),
                ]),
            ])
            ->emptyStateHeading('No transactions found')
            ->emptyStateDescription('Create your first transaction to get started.')
            ->emptyStateIcon('heroicon-o-banknotes')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->label('Create Transaction')
                    ->icon('heroicon-o-plus'),
            ])
            ->deferLoading()
            ->striped();
    }

    public static function getRelations(): array
    {
        return [
            // You can add relations like payments, documents, etc.
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTransactions::route('/'),
            'create' => Pages\CreateTransaction::route('/create'),
            'edit'   => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }
}
