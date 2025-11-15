<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Sales & Deals';
    protected static ?string $navigationLabel = 'Transactions';
    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Basic Info')->schema([
                Forms\Components\TextInput::make('inquiry_id')->numeric()->label('Inquiry'),
                Forms\Components\TextInput::make('property_id')->numeric()->label('Property'),
                Forms\Components\TextInput::make('deal_id')->numeric()->label('Deal'),
                Forms\Components\TextInput::make('buyer_id')->numeric()->label('Buyer'),
                Forms\Components\TextInput::make('primary_agent_id')->numeric()->label('Primary Agent'),
                Forms\Components\Select::make('status')
                    ->options([
                        'reserved'  => 'Reserved',
                        'booked'    => 'Booked',
                        'closed'    => 'Closed',
                        'cancelled' => 'Cancelled',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('cancel_reason')->rows(2)->columnSpanFull(),
                Forms\Components\TextInput::make('reference_no')->maxLength(100),
                Forms\Components\Select::make('mode_of_payment')
                    ->options([
                        'cash'         => 'Cash',
                        'installment'  => 'Installment',
                        'bank'         => 'Bank Financing',
                        'gcash'        => 'GCash',
                    ]),
            ])->columns(2),

            Forms\Components\Section::make('Dates')->schema([
                Forms\Components\DateTimePicker::make('reserved_at'),
                Forms\Components\DateTimePicker::make('booked_at'),
                Forms\Components\DateTimePicker::make('closed_at'),
                Forms\Components\DateTimePicker::make('cancelled_at'),
                Forms\Components\DateTimePicker::make('expires_at'),
            ])->columns(3),

            Forms\Components\Section::make('Financials')->schema([
                Forms\Components\TextInput::make('base_price')->numeric()->prefix('₱'),
                Forms\Components\TextInput::make('discount_amount')->numeric()->default(0)->prefix('₱'),
                Forms\Components\TextInput::make('fees_amount')->numeric()->default(0)->prefix('₱'),
                Forms\Components\TextInput::make('tcp')->numeric()->prefix('₱')->helperText('Total Contract Price'),
                Forms\Components\TextInput::make('reservation_amount')->numeric()->default(0)->prefix('₱'),
                Forms\Components\TextInput::make('downpayment_amount')->numeric()->default(0)->prefix('₱'),
                Forms\Components\TextInput::make('balance_amount')->numeric()->default(0)->prefix('₱'),
                Forms\Components\TextInput::make('financing'),
                Forms\Components\Textarea::make('payment_terms_json')->rows(3)->columnSpanFull(),
                Forms\Components\Textarea::make('remarks')->rows(3)->columnSpanFull(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('buyer_id')->label('Buyer')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('primary_agent_id')->label('Agent')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'closed',
                        'warning' => 'booked',
                        'info'    => 'reserved',
                        'danger'  => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('tcp')->label('TCP')->money('PHP', true)->sortable(),
                Tables\Columns\TextColumn::make('mode_of_payment')->label('Payment'),
                Tables\Columns\TextColumn::make('closed_at')->date()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'reserved'  => 'Reserved',
                    'booked'    => 'Booked',
                    'closed'    => 'Closed',
                    'cancelled' => 'Cancelled',
                ]),
                Filter::make('created_range')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('Created From'),
                        Forms\Components\DatePicker::make('to')->label('Created To'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['to'] ?? null,   fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTransactions::route('/'),
            'create' => Pages\CreateTransaction::route('/create'),
            'edit'   => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }
}
