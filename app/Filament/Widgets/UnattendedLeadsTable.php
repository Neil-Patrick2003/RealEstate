<?php

namespace App\Filament\Widgets;

use App\Models\Inquiry;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class UnattendedLeadsTable extends BaseWidget
{
    protected static ?string $heading = 'Unattended Leads (No agent reply > 3 days)';
    protected static ?int $sort = -56;
    protected static ?string $pollingInterval = '60s';

    /** REQUIRED signature */
    protected function getTableQuery(): Builder|Relation|null
    {
        $ids = $this->unattendedInquiryIds();

        return empty($ids)
            ? Inquiry::query()->whereRaw('1=0')
            : Inquiry::query()
                ->whereIn('id', $ids)
                ->with(['buyer:id,name,email', 'agent:id,name']) // adjust if relation names differ
                ->latest('created_at');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('buyer.name')->label('Buyer')->limit(40)->placeholder('—')->searchable(),
                Tables\Columns\TextColumn::make('buyer.email')->label('Email')->copyable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('agent.name')->label('Assigned')->placeholder('Unassigned'),
                Tables\Columns\TextColumn::make('created_at')->label('Inquiry Date')->since()->sortable(),
                Tables\Columns\TextColumn::make('property_id')->label('Property ID')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->paginated([10])
            ->defaultPaginationPageOption(10)
            ->striped();
    }

    /**
     * Find inquiries (last 30d) whose channel’s first buyer msg has no agent/broker reply within 3 days.
     */
    private function unattendedInquiryIds(): array
    {
        $tz        = 'Asia/Manila';
        $now       = CarbonImmutable::now($tz)->endOfDay();
        $from      = $now->subDays(30)->startOfDay();
        $threshold = $now->subDays(3);

        if (!Schema::hasTable('inquiries') || !Schema::hasTable('channels') || !Schema::hasTable('messages')) {
            return [];
        }

        // 1) Pull recent inquiries
        $inqs = DB::table('inquiries')
            ->whereBetween('created_at', [$from, $now])
            ->select('id', 'property_id', 'created_at')
            ->get();

        if ($inqs->isEmpty()) {
            return [];
        }

        $inquiryIds   = $inqs->pluck('id')->all();
        $propertyIds  = $inqs->pluck('property_id')->filter()->unique()->values()->all();

        // 2) Resolve channels that belong to these inquiries using multiple mappings
        $channelsQ = DB::table('channels');

        // Collect conditions depending on available columns
        $chanIds = collect();

        // a) channels.inquiry_id = inquiries.id
        if (Schema::hasColumn('channels', 'inquiry_id')) {
            $chanIds = $chanIds->merge(
                DB::table('channels')->whereIn('inquiry_id', $inquiryIds)->pluck('id')
            );
        }

        // b) channels.subject_id = inquiries.id [subject is Inquiry? use subject_type if present]
        if (Schema::hasColumn('channels', 'subject_id')) {
            $q = DB::table('channels')->whereIn('subject_id', $inquiryIds);
            if (Schema::hasColumn('channels', 'subject_type')) {
                $q->whereIn('subject_type', ['inquiries', 'App\\Models\\Inquiry', 'Inquiry']);
            }
            $chanIds = $chanIds->merge($q->pluck('id'));
        }

        // c) channels.subject_id = inquiries.property_id [subject is Property]
        if (!empty($propertyIds) && Schema::hasColumn('channels', 'subject_id')) {
            $q = DB::table('channels')->whereIn('subject_id', $propertyIds);
            if (Schema::hasColumn('channels', 'subject_type')) {
                $q->whereIn('subject_type', ['properties', 'App\\Models\\Property', 'Property']);
            }
            $chanIds = $chanIds->merge($q->pluck('id'));
        }

        $chanIds = $chanIds->unique()->values();
        if ($chanIds->isEmpty()) {
            return [];
        }

        // Map channel_id -> inquiry_id (best-effort)
        $chanToInq = [];

        // a) direct inquiry_id
        if (Schema::hasColumn('channels', 'inquiry_id')) {
            $pairs = DB::table('channels')->whereIn('id', $chanIds)->pluck('inquiry_id', 'id');
            foreach ($pairs as $cid => $iid) {
                if ($iid) $chanToInq[(int)$cid] = (int)$iid;
            }
        }

        // b) subject_id = inquiry.id
        if (Schema::hasColumn('channels', 'subject_id')) {
            $pairs = DB::table('channels')->whereIn('id', $chanIds)->select('id','subject_id','subject_type')->get();
            $inquiryIdSet = array_flip($inquiryIds);
            $propIdSet    = array_flip($propertyIds);

            foreach ($pairs as $p) {
                // prefer direct inquiry match
                if (isset($inquiryIdSet[$p->subject_id])) {
                    if (!Schema::hasColumn('channels','subject_type') ||
                        in_array($p->subject_type, ['inquiries','App\\Models\\Inquiry','Inquiry', null], true)) {
                        $chanToInq[(int)$p->id] = (int)$p->subject_id;
                        continue;
                    }
                }
                // fallback: subject is Property -> map to first inquiry with that property_id (recent window)
                if (isset($propIdSet[$p->subject_id])) {
                    $inqId = $inqs->firstWhere('property_id', $p->subject_id)?->id;
                    if ($inqId) {
                        $chanToInq[(int)$p->id] = (int)$inqId;
                    }
                }
            }
        }

        if (empty($chanToInq)) {
            return [];
        }

        $useChanIds = array_keys($chanToInq);

        // 3) Pull messages for those channels (last 30d)
        $msgs = DB::table('messages')
            ->whereIn('channel_id', $useChanIds)
            ->whereBetween('created_at', [$from, $now])
            ->orderBy('channel_id')->orderBy('created_at')
            ->get(['channel_id','sender_id','created_at']);

        if ($msgs->isEmpty()) {
            // If there are channels but no messages, treat as unattended
            return array_values(array_unique(array_values($chanToInq)));
        }

        // Agent/broker ids
        $agentIds = DB::table('users')->whereIn('role', ['agent','broker'])->pluck('id')->toArray();

        // 4) Decide unattended per channel
        $unattendedInquiryIds = [];

        foreach ($msgs->groupBy('channel_id') as $cid => $list) {
            $list = $list->values();

            $firstBuyerAt = null;
            $firstAgentAt = null;

            foreach ($list as $m) {
                if (!in_array($m->sender_id, $agentIds, true)) {
                    $firstBuyerAt ??= $m->created_at;
                } elseif ($firstBuyerAt) {
                    $firstAgentAt = $m->created_at;
                    break;
                }
            }

            // If buyer wrote and agent reply is missing or later than threshold → unattended
            if ($firstBuyerAt) {
                if (!$firstAgentAt || CarbonImmutable::parse($firstAgentAt, $tz)->gt($threshold)) {
                    $inqId = $chanToInq[(int)$cid] ?? null;
                    if ($inqId) $unattendedInquiryIds[] = $inqId;
                }
            }
        }

        // Also: channels with no messages at all (already handled above -> mark as unattended)
        return array_values(array_unique($unattendedInquiryIds));
    }

    public function getColumnSpan(): int|string|array
    {
        return ['default'=>1,'md'=>2,'xl'=>2];
    }
}
