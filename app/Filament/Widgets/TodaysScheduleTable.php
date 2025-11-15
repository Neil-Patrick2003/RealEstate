<?php

namespace App\Filament\Widgets;

use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\CarbonImmutable;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class TodaysScheduleTable extends BaseWidget
{
    protected static ?string $heading = "Today's Schedule";
    protected static ?int $sort = -11;
    protected static ?string $pollingInterval = '60s';

    public string $agentId = 'all';
    public function setAgentId(string $id): void { $this->agentId = $id; }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 3];
    }

    protected function getTableQuery(): Builder|Relation|null
    {
        $tz = 'Asia/Manila';
        $now = CarbonImmutable::now($tz);
        $start = $now->startOfDay();
        $end   = $now->endOfDay();

        $dateColStart = \Schema::hasColumn((new PropertyTripping)->getTable(),'scheduled_start')
            ? 'scheduled_start' : (\Schema::hasColumn((new PropertyTripping)->getTable(),'scheduled_at') ? 'scheduled_at' : 'created_at');

        $q = PropertyTripping::query()
            ->with([
                'agent:id,name',
                'property:id,title',
                'buyer:id,name,contact_number',
            ])
            ->whereBetween($dateColStart, [$start, $end])
            ->orderBy($dateColStart, 'asc');

        if ($this->agentId !== 'all' && \Schema::hasColumn((new PropertyTripping)->getTable(),'agent_id')) {
            $q->where('agent_id', (int) $this->agentId);
        }

        return $q;
    }

    public function table(Table $table): Table
    {
        // Agent filter dropdown (header)
        $agents = User::query()->where('role','agent')->orderBy('name')->pluck('name','id')->toArray();

        return $table
            ->query($this->getTableQuery())
            ->headerActions([
                Tables\Actions\Action::make('agentFilter')
                    ->label('Agent')
                    ->form([
                        \Filament\Forms\Components\Select::make('agent_id')
                            ->label('Agent')
                            ->options(['all' => 'All Agents'] + array_combine(array_map('strval', array_keys($agents)), array_values($agents)))
                            ->default($this->agentId)
                    ])
                    ->action(function (array $data) {
                        $this->setAgentId($data['agent_id'] ?? 'all');
                    })
            ])
            ->columns([
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Time')
                    ->state(function ($record) {
                        $col = \Schema::hasColumn($record->getTable(),'scheduled_start') ? 'scheduled_start' :
                            (\Schema::hasColumn($record->getTable(),'scheduled_at') ? 'scheduled_at' : 'created_at');
                        return optional($record->{$col})->timezone('Asia/Manila')->format('h:ia');
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('propertyListing.title')
                    ->label('Property')
                    ->limit(40)
                    ->wrap(),

                Tables\Columns\TextColumn::make('agent.name')
                    ->label('Agent')
                    ->toggleable()
                    ->wrap(),

                Tables\Columns\TextColumn::make('buyer.name')
                    ->label('Client')
                    ->limit(30)
                    ->wrap(),

                Tables\Columns\TextColumn::make('buyer.contact_number')
                    ->label('Phone')
                    ->copyable()
                    ->toggleable(),
            ])
            ->actions([
                // Quick Call
                Tables\Actions\Action::make('call')
                    ->label('Call')
                    ->icon('heroicon-o-phone')
                    ->url(fn ($record): ?string => $record->buyer?->contact_number ? 'tel:' . $record->buyer->contact_number : null)
                    ->openUrlInNewTab()
                    ->visible(fn ($record): bool => filled($record->buyer?->contact_number))
                    ->color('success'),

                // Quick SMS
                Tables\Actions\Action::make('sms')
                    ->label('SMS')
                    ->icon('heroicon-o-chat-bubble-bottom-center-text')
                    ->url(fn ($record): ?string => $record->buyer?->contact_number ? 'sms:' . $record->buyer->contact_number : null)
                    ->openUrlInNewTab()
                    ->visible(fn ($record): bool => filled($record->buyer?->contact_number))
                    ->color('gray'),

//                // View (optional)
//                Tables\Actions\Action::make('view')
//                    ->label('Open')
//                    ->icon('heroicon-o-eye')
//                    ->url(fn ($record): ?string => route('filament.admin.resources.property-trippings.view', ['record' => $record]) )
//                    ->openUrlInNewTab()
//                    ->color('primary'),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10);
    }
}
