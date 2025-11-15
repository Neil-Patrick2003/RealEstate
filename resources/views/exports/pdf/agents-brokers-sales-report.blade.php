{{-- resources/views/exports/pdf/agents-brokers-sales-report.blade.php --}}
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    @include('exports.pdf._style')
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 11px; color: #374151; }
        .right { text-align: right; }
        .muted, .small { color: #6b7280; }
        .brand-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; margin-bottom:20px; border-bottom:2px solid #1f2937; }
        .brand-left { display:flex; align-items:flex-start; }
        .brand-logo { max-width:100px; max-height:40px; margin-right:15px; }
        .report-title h1 { margin:0; font-size:18px; color:#1f2937; }
        .report-info { text-align:right; font-size:10px; }
        .report-info strong { color:#4b5563; }

        .kpi-row { display:flex; margin:0 0 20px; border:1px solid #d1d5db; border-radius:6px; overflow:hidden; }
        .kpi { flex:1; padding:10px 12px; border-right:1px solid #d1d5db; background:#f9fafb; }
        .kpi:last-child { border-right:none; }
        .kpi .label { font-size:10px; color:#6b7280; margin-bottom:2px; text-transform:uppercase; letter-spacing:.5px; }
        .kpi .value { font-size:15px; font-weight:800; color:#1f2937; }
        .kpi-total { background:#eef2ff; border-left:3px solid #4f46e5; }

        .section-title { font-size:14px; font-weight:700; color:#1f2937; margin:12px 0 8px; padding-bottom:4px; border-bottom:1px solid #e5e7eb; }
        .data-table { width:100%; border-collapse:collapse; margin-top:6px; }
        .data-table th, .data-table td { border-bottom:1px solid #f3f4f6; padding:7px 8px; vertical-align:middle; }
        .data-table thead th { background:#f9fafb; font-size:11px; text-align:left; font-weight:700; border-bottom:2px solid #e5e7eb; }
        .data-table tbody tr:nth-child(even) { background:#fcfcfc; }
        .amount-cell { font-variant-numeric:tabular-nums; font-weight:600; color:#1f2937; }
        .footer { position:fixed; bottom:24px; left:40px; right:40px; font-size:10px; color:#6b7280; text-align:right; }
        .mini { font-size:10px; }
    </style>
</head>
<body>
@php
    // Normalize to objects
    $rows     = collect($rows ?? [])->map(fn($r) => is_array($r) ? (object) $r : $r);
    $agents   = collect($agents ?? [])->map(fn($r) => is_array($r) ? (object) $r : $r);
    $brokers  = collect($brokers ?? [])->map(fn($r) => is_array($r) ? (object) $r : $r);
    $months   = $months ?? [];
    $byRoleMonthly = $byRoleMonthly ?? collect();

    $safe = fn($v, $f='—') => isset($v) && $v!=='' ? $v : $f;
    $phpCurrency = fn($n) => number_format((float)$n, 2);

    $orgName = $orgName ?? config('app.name');
    $title   = $title ?? 'Agents & Brokers Sales Report';
    $range   = $range ?? [null, null];
    $logoUrl = $logoUrl ?? null;

    $grandTotal = (float) ($grandTotal ?? 0);
    $totalDeals = (int)  ($totalDeals ?? 0);
    $avgTicket  = (float) ($avgTicket ?? 0);
@endphp

<header class="brand-header">
    <div class="brand-left">
        @if(!empty($logoUrl))
            <img src="{{ $logoUrl }}" class="brand-logo" alt="Logo">
        @endif
        <div class="report-title">
            <h1>{{ $safe($title) }}</h1>
            <div class="subtitle">
                Report Period: <strong>{{ $safe($range[0]) }}</strong> – <strong>{{ $safe($range[1]) }}</strong>
            </div>
        </div>
    </div>
    <div class="report-info">
        <p style="margin:0 0 2px;">**{{ $orgName }}**</p>
        <p style="margin:0;">Generated: <strong>{{ \Carbon\Carbon::now('Asia/Manila')->format('Y-m-d H:i') }} PH</strong></p>
    </div>
</header>

{{-- KPI Summary --}}
<div class="kpi-row">
    <div class="kpi kpi-total">
        <div class="label">Grand Total Value</div>
        <div class="value">₱ {{ $phpCurrency($grandTotal) }}</div>
    </div>
    <div class="kpi">
        <div class="label">Total Deals</div>
        <div class="value">{{ number_format($totalDeals) }}</div>
    </div>
    <div class="kpi">
        <div class="label">Average Ticket</div>
        <div class="value">₱ {{ $phpCurrency($avgTicket) }}</div>
    </div>
</div>

{{-- Top Agents --}}
<div class="section-title">Top Agents (by Amount)</div>
@if($agents->isEmpty())
    <div class="mini muted">No agent sales in this period.</div>
@else
    <table class="data-table">
        <thead>
        <tr>
            <th>Agent</th>
            <th class="right">Deals</th>
            <th class="right">Amount</th>
        </tr>
        </thead>
        <tbody>
        @foreach($agents as $a)
            <tr>
                <td>{{ $safe($a->user_name) }}</td>
                <td class="right">{{ number_format((int) ($a->deals ?? 0)) }}</td>
                <td class="right amount-cell">₱ {{ $phpCurrency($a->amount ?? 0) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

{{-- Top Brokers --}}
<div class="section-title" style="margin-top:14px;">Top Brokers (by Amount)</div>
@if($brokers->isEmpty())
    <div class="mini muted">No broker sales in this period.</div>
@else
    <table class="data-table">
        <thead>
        <tr>
            <th>Broker</th>
            <th class="right">Deals</th>
            <th class="right">Amount</th>
        </tr>
        </thead>
        <tbody>
        @foreach($brokers as $b)
            <tr>
                <td>{{ $safe($b->user_name) }}</td>
                <td class="right">{{ number_format((int) ($b->deals ?? 0)) }}</td>
                <td class="right amount-cell">₱ {{ $phpCurrency($b->amount ?? 0) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

{{-- Monthly Summary by Role --}}
<div class="section-title" style="margin-top:14px;">Monthly Summary by Role</div>
@if(empty($months))
    <div class="mini muted">No months in range.</div>
@else
    <table class="data-table mini">
        <thead>
        <tr>
            <th>Month</th>
            <th class="right">Agent Deals</th>
            <th class="right">Agent Amount</th>
            <th class="right">Broker Deals</th>
            <th class="right">Broker Amount</th>
        </tr>
        </thead>
        <tbody>
        @foreach($months as $ym)
            @php
                $roleMap = $byRoleMonthly->get($ym) ?? collect();
                $agentRow  = $roleMap->get('Agent') ?? $roleMap->get('agent') ?? null;
                $brokerRow = $roleMap->get('Broker') ?? $roleMap->get('broker') ?? null;

                $ad = (int)   (($agentRow->deals  ?? 0));
                $aa = (float) (($agentRow->amount ?? 0));
                $bd = (int)   (($brokerRow->deals  ?? 0));
                $ba = (float) (($brokerRow->amount ?? 0));
            @endphp
            <tr>
                <td>{{ $ym }}</td>
                <td class="right">{{ number_format($ad) }}</td>
                <td class="right amount-cell">₱ {{ $phpCurrency($aa) }}</td>
                <td class="right">{{ number_format($bd) }}</td>
                <td class="right amount-cell">₱ {{ $phpCurrency($ba) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

{{-- Detailed Rows (optional) --}}
<div class="section-title" style="margin-top:14px;">Detailed Deals (All)</div>
@if($rows->isEmpty())
    <div class="mini muted">No detailed rows.</div>
@else
    <table class="data-table mini">
        <thead>
        <tr>
            <th>Month</th>
            <th>User</th>
            <th>Role</th>
            <th class="right">Deals</th>
            <th class="right">Amount</th>
        </tr>
        </thead>
        <tbody>
        @foreach($rows as $r)
            <tr>
                <td>{{ $r->ym }}</td>
                <td>{{ $r->user_name }}</td>
                <td>{{ $r->user_role }}</td>
                <td class="right">{{ number_format((int) ($r->deals ?? 0)) }}</td>
                <td class="right amount-cell">₱ {{ $phpCurrency($r->amount ?? 0) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

<div class="footer">
    Confidential Sales Report | **{{ $orgName }}**
</div>

<script type="text/php">
    if (isset($pdf)) {
        $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
        $size = 9;
        $font = $fontMetrics->get_font("Helvetica", "normal");
        $pdf->page_text(520, 810, $text, $font, $size, [0,0,0]);
    }
</script>
</body>
</html>
