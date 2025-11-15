<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonImmutable;

class HotLeadsTable extends BaseWidget
{
    protected static ?string $heading = 'Hot Leads (≥3 in 30d) 🔥';
    protected static ?int $sort = -58;
    protected static ?string $pollingInterval = '60s';

    /** MUST match TableWidget signature */
    protected function getTableQuery(): Builder|Relation|null
    {
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        // Group inquiries by buyer_id in last 30d (Query Builder subquery)
        $agg = DB::table('inquiries')
            ->selectRaw('buyer_id, COUNT(*) as cnt, MAX(created_at) as last_at')
            ->whereNotNull('buyer_id')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('buyer_id')
            ->havingRaw('COUNT(*) >= 3');

        // Return Eloquent builder: users JOIN subquery
        return User::query()
            ->joinSub($agg, 'iq', 'iq.buyer_id', '=', 'users.id')
            ->addSelect([
                'users.id',
                'users.name',
                'users.email',
                DB::raw('iq.cnt as inquiries_count'),
                DB::raw('iq.last_at as last_inquiry_at'),
            ])
            ->orderByDesc('inquiries_count');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Buyer')
                    ->searchable()
                    ->limit(40),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->copyable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('inquiries_count')
                    ->label('Inquiries')
                    ->badge()
                    ->color('warning')
                    ->sortable(),

                Tables\Columns\TextColumn::make('last_inquiry_at')
                    ->label('Last')
                    ->since()
                    ->sortable(),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10)
            ->striped();
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 2, 'xl' => 2];
    }
}
