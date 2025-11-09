<?php

namespace App\Filament\Resources\TransactionResource\Pages;

use App\Filament\Resources\TransactionResource;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Pages\ListRecords;

class ListTransactions extends ListRecords
{
    protected static string $resource = TransactionResource::class;

    protected function getHeaderActions(): array
    {
        $tz    = 'Asia/Manila';
        $end   = now($tz)->endOfMonth();
        $start = $end->copy()->subMonths(11)->startOfMonth();

        $rangeDefaults = [
            'from' => $start->toDateString(),
            'to'   => $end->toDateString(),
        ];

        return [
            // ✅ ONE action to generate any report with a single date range
            Actions\Action::make('generateReports')
                ->label('Generate Reports (Range)')
                ->icon('heroicon-o-document-text')
                ->color('primary')
                ->form([
                    Forms\Components\Section::make('Report Range')
                        ->schema([
                            Forms\Components\Grid::make(6)->schema([
                                Forms\Components\DatePicker::make('from')
                                    ->label('From')
                                    ->native(false)
                                    ->displayFormat('Y-m-d')
                                    ->closeOnDateSelection()
                                    ->required()
                                    ->default($rangeDefaults['from'])
                                    ->columnSpan(3),

                                Forms\Components\DatePicker::make('to')
                                    ->label('To')
                                    ->native(false)
                                    ->displayFormat('Y-m-d')
                                    ->closeOnDateSelection()
                                    ->required()
                                    ->default($rangeDefaults['to'])
                                    ->columnSpan(3),
                            ]),
                            Forms\Components\Select::make('report')
                                ->label('Report Type')
                                ->native(false)
                                ->options([
                                    'transactions'   => '📄 Transactions PDF',
                                    'by-agent'       => '👥 Agents/Brokers PDF',
                                    'by-role'        => '🏷️ Sales by Role PDF',
                                    'handled-vs-sold'=> '📊 Handled vs Sold (Agent/Broker)',
                                ])
                                ->required()
                                ->default('transactions'),
                        ]),
                ])
                ->action(function (array $data) {
                    $qs = http_build_query([
                        'from' => $data['from'],
                        'to'   => $data['to'],
                    ]);

                    $routeName = match ($data['report']) {
                        'transactions'    => 'export.pdf.transactions',
                        'by-agent'        => 'export.pdf.by-agent',
                        'by-role'         => 'export.pdf.by-role',
                        'handled-vs-sold' => 'export.pdf.handled-vs-sold',
                        default           => 'export.pdf.transactions',
                    };

                    return redirect()->away(route($routeName) . '?' . $qs);
                }),

            // (Optional) keep your regular Create action
            Actions\CreateAction::make(),
        ];
    }
}
