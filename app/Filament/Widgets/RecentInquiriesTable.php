<?php

namespace App\Filament\Widgets;

use App\Models\Inquiry;
use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class RecentInquiriesTable extends BaseWidget
{
    protected static ?string $heading = 'Recent Inquiries';
    protected static ?int $sort = -19;
    protected static ?string $pollingInterval = '30s';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 6];
    }

    protected function getTableQuery(): Builder|Relation|null
    {
        return Inquiry::query()
            ->with(['buyer:id,name,email'])  // ✅ eager-load buyer
            ->latest('created_at');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')->sortable()->toggleable(),

                Tables\Columns\TextColumn::make('buyer.name')       // ✅ from buyer relation
                ->label('Buyer')->searchable()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('buyer.email')      // ✅ from buyer relation
                ->label('Email')->copyable()->toggleable()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('notes')
                    ->label('Message')->limit(40),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('When')->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('reply')
                    ->label('Quick Reply')
                    ->icon('heroicon-o-envelope')
                    ->url(fn (Inquiry $record): ?string =>
                    $record->buyer?->email
                        ? 'mailto:' . $record->buyer->email
                        . '?subject=' . rawurlencode('Regarding your inquiry')
                        . '&body=' . rawurlencode('Hi ' . ($record->buyer->name ?? 'there') . ',')
                        : null
                    )
                    ->openUrlInNewTab()
                    ->color('primary')
                    ->visible(fn (Inquiry $record): bool => filled($record->buyer?->email)),

//                Tables\Actions\Action::make('view')
//                    ->label('Open')
//                    ->icon('heroicon-o-eye')
//                    ->url(fn (Inquiry $record): string =>
//                    route('filament.admin.resources.inquiries.view', ['record' => $record])
//                    )
//                    ->openUrlInNewTab()
//                    ->color('gray'),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10);
    }
}
