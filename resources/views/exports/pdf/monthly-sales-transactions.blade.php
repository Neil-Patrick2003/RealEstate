{{-- resources/views/exports/pdf/monthly-sales-transactions.blade.php --}}
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    {{-- Assuming this file contains necessary core styles and utility classes --}}
    @include('exports.pdf._style')

    <style>
        /* Modern Report Styles (Refined) */

        /* 1. LAYOUT & TYPOGRAPHY */
        /* Use a modern font for PDFs. Inter is a good choice, but ensure the path is correct/available in your PDF library. */
        /* @font-face { font-family: 'Inter'; src: url('path/to/Inter-Regular.ttf'); } */
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 11px; color: #374151; }
        .right { text-align: right; }
        .muted, .small { color: #6b7280; }

        /* 2. HEADER & BRANDING */
        .brand-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            padding-bottom: 12px; margin-bottom: 20px; border-bottom: 2px solid #1f2937; /* Stronger accent line */
        }
        .brand-left { display: flex; align-items: flex-start; } /* Added for better alignment control if using logo */
        .brand-logo { max-width: 100px; max-height: 40px; margin-right: 15px; }
        .report-title h1 { margin: 0; font-size: 18px; color: #1f2937; }
        .report-info { text-align: right; font-size: 10px; }
        .report-info strong { color: #4b5563; }

        /* 3. KPI / SUMMARY PANEL */
        .kpi-row {
            display: flex; margin: 0 0 20px;
            border: 1px solid #d1d5db; border-radius: 6px;
            overflow: hidden;
        }
        .kpi {
            flex: 1; padding: 10px 12px;
            border-right: 1px solid #d1d5db;
            background: #f9fafb;
        }
        .kpi:last-child { border-right: none; }
        .kpi .label { font-size: 10px; color: #6b7280; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi .value { font-size: 15px; font-weight: 800; color: #1f2937; }
        .kpi-total { background: #eef2ff; border-left: 3px solid #4f46e5; }
        .kpi-paid { background: #ecfdf5; border-left: 3px solid #059669; }

        /* 4. DETAIL TABLE */
        .section-title { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { border-bottom: 1px solid #f3f4f6; padding: 7px 8px; vertical-align: middle; }
        .data-table thead th { background: #f9fafb; font-size: 11px; text-align: left; font-weight: 700; border-bottom: 2px solid #e5e7eb; }
        .data-table tbody tr:nth-child(even) { background: #fcfcfc; }

        .property-title { font-weight: 600; font-size: 11px; line-height: 1.3; }
        .property-id { font-size: 9px; margin-top: 2px; }
        .amount-cell { font-variant-numeric: tabular-nums; font-weight: 600; color: #1f2937; }

        /* 5. SUBTOTALS & FOOTER */
        .monthly-group-header { background: #f3f4f6; font-weight: 700; color: #4b5563; font-size: 10px; padding: 4px 8px !important; }
        .monthly-subtotal { background: #f0fdf4; font-weight: 700; border-top: 2px dashed #d1d5db; }
        .grand-total-row { background: #eef2ff; font-weight: 800; border-top: 3px solid #4f46e5; font-size: 12px; }
        .grand-total-row .col-amount { font-size: 14px; }
        .total-breakdown .breakdown-item { white-space: nowrap; }

        /* Existing badge styles for print-safe colors */
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; line-height: 1; border: 1px solid transparent; }
        .badge-paid { background:#dcfce7; color:#065f46; border-color:#a7f3d0; }
        .badge-pending { background:#fff7ed; color:#b45309; border-color:#fde68a; }
        .badge-cancelled { background:#fee2e2; color:#b91c1c; border-color:#fecaca; }

    </style>
</head>
<body>

@php
    // --- UTILITY FUNCTIONS ---
    $safe = fn($v, $fallback = '—') => isset($v) && $v !== '' ? $v : $fallback;
    // REFACTOR: This function now only formats the number, removing the hardcoded '₱ ' symbol.
    $phpCurrency = fn($n) => number_format((float) $n, 2);

    // --- DATA PROCESSING AND INITIALIZATION ---
    $rows = $rows ?? []; // Ensure rows is defined
    $grouped = [];
    $grandTotal = 0.0;
    $count = 0;
    $statusTotals = [];
    $statusCounts = [];

    // Define status groups
    $paidStatuses = ['paid','accepted','completed','success'];
    $pendingStatuses = ['pending','processing','in_review'];
    $cancelStatuses = ['cancelled','rejected','voided','failed'];

    // --- LOOP AND AGGREGATION ---
    foreach ($rows as $r) {
        $ym = $r->ym ?? 'Unknown';
        $grouped[$ym] = $grouped[$ym] ?? [];
        $grouped[$ym][] = $r;

        $amt = (float) ($r->amount ?? 0);
        $grandTotal += $amt;
        $count++;

        $st = strtolower($r->status ?? 'unknown');
        $statusTotals[$st] = ($statusTotals[$st] ?? 0) + $amt;
        $statusCounts[$st] = ($statusCounts[$st] ?? 0) + 1;
    }

    // --- KPI CALCULATIONS ---
    $avgTicket = $count > 0 ? $grandTotal / $count : 0;

    $sumBy = function(array $keys) use ($statusTotals) {
        $s = 0;
        foreach ($keys as $k) { $s += $statusTotals[$k] ?? 0; }
        return $s;
    };
    $cntBy = function(array $keys) use ($statusCounts) {
        $s = 0;
        foreach ($keys as $k) { $s += $statusCounts[$k] ?? 0; }
        return $s;
    };

    $paidTotal = $sumBy($paidStatuses);
    $paidCount = $cntBy($paidStatuses);
    $pendingTotal = $sumBy($pendingStatuses);
    $pendingCount = $cntBy($pendingStatuses);
    $cancelTotal = $sumBy($cancelStatuses);
    $cancelCount = $cntBy($cancelStatuses);

    // --- REPORT INFO VARS ---
    $orgName = $orgName ?? config('app.name');
    $title = $title ?? 'Monthly Sales Transactions';
    $range = $range ?? [null, null];
    $logoUrl = $logoUrl ?? null;
@endphp


<header class="brand-header">
    <div class="brand-left">
        @if(!empty($logoUrl))
            <img src="{{ $logoUrl }}" class="brand-logo" alt="Logo">
        @endif
        <div class="report-title">
            <h1 style="margin:0;">{{ $safe($title) }}</h1>
            <div class="subtitle">
                Report Period:
                <strong>{{ $safe($range[0]) }}</strong> – <strong>{{ $safe($range[1]) }}</strong>
            </div>
        </div>
    </div>
    <div class="report-info">
        <p style="margin:0 0 2px;">**{{ $orgName }}**</p>
        {{-- Use Carbon to format the date/time (assuming Carbon is available) --}}
        <p style="margin:0;">Generated: <strong>{{ \Carbon\Carbon::now('Asia/Manila')->format('Y-m-d H:i') }} PH</strong></p>
    </div>
</header>

{{--- KPI Summary Panel ---}}
<div class="kpi-row">
    <div class="kpi kpi-total">
        <div class="label">Grand Total Value</div>
        {{-- FIX: Peso Sign (₱) prepended here, outside the phpCurrency function --}}
        <div class="value">₱ {{ $phpCurrency($grandTotal) }}</div>
    </div>
    <div class="kpi">
        <div class="label">Total Transactions</div>
        <div class="value">{{ number_format($count) }}</div>
    </div>
    <div class="kpi">
        <div class="label">Average Ticket</div>
        {{-- FIX: Peso Sign (₱) prepended here --}}
        <div class="value">₱ {{ $phpCurrency($avgTicket) }}</div>
    </div>
    <div class="kpi kpi-paid">
        <div class="label">Paid / Completed</div>
        {{-- FIX: Peso Sign (₱) prepended here --}}
        <div class="value">₱ {{ $phpCurrency($paidTotal) }} <span class="muted small">({{ $paidCount }})</span></div>
    </div>
    <div class="kpi">
        <div class="label">Pending Value</div>
        {{-- FIX: Peso Sign (₱) prepended here --}}
        <div class="value">₱ {{ $phpCurrency($pendingTotal) }} <span class="muted small">({{ $pendingCount }})</span></div>
    </div>
</div>

{{--- Detail Table ---}}
@if(empty($rows))
    <div class="no-data">No sales transactions found for this period.</div>
@else
    <div class="section-title">Detailed Transactions (Grouped by Month)</div>
    <table class="data-table">
        <thead>
        <tr>
            <th class="col-month">Month</th>
            <th class="col-id">Tx ID</th>
            <th>Property Details</th>
            <th class="col-amount right">Amount</th>
            <th class="col-status">Status</th>
            <th class="col-date">Tx Date</th>
            <th>Primary Agent</th>
            <th class="col-ref">Ref No.</th>
            <th class="col-payment">Payment</th>
        </tr>
        </thead>
        <tbody>
        @foreach($grouped as $month => $items)
            @php
                $monthSubtotal = 0.0;
                // Sort inside month by tx_date asc (safe)
                usort($items, fn($a, $b) => strcmp((string)($a->tx_date ?? ''), (string)($b->tx_date ?? '')));
            @endphp

            {{-- Month label row --}}
            <tr>
                <td colspan="9" class="monthly-group-header">{{ $safe($month) }} ({{ count($items) }} Transactions)</td>
            </tr>

            @foreach($items as $r)
                @php
                    $amt = (float) ($r->amount ?? 0);
                    $monthSubtotal += $amt;
                    $st = strtolower($r->status ?? 'unknown');
                    $badgeClass = match(true) {
                        in_array($st, $paidStatuses) => 'badge-paid',
                        in_array($st, $pendingStatuses) => 'badge-pending',
                        in_array($st, $cancelStatuses) => 'badge-cancelled',
                        default => 'badge-pending',
                    };
                @endphp
                <tr>
                    <td class="col-month">{{ $safe($r->ym) }}</td>
                    <td class="col-id">{{ $safe($r->transaction_id) }}</td>
                    <td>
                        <div class="property-title">{{ $safe($r->property_title) }}</div>
                        <div class="muted small property-id">#{{ $safe($r->property_id) }}</div>
                    </td>
                    {{-- FIX: Peso Sign (₱) prepended here --}}
                    <td class="col-amount right amount-cell">₱ {{ $phpCurrency($amt) }}</td>
                    <td class="col-status">
                        <span class="badge {{ $badgeClass }}">{{ strtoupper($safe($r->status)) }}</span>
                    </td>
                    <td class="col-date small">
                        {{ \Carbon\Carbon::parse($r->tx_date ?? now())->format('Y-m-d') }}
                    </td>
                    <td>
                        {{ $safe($r->primary_agent_name) }}
                        @if(!empty($r->primary_agent_role))
                            <span class="role-tag">({{ $r->primary_agent_role }})</span>
                        @endif
                    </td>
                    <td class="col-ref small">{{ $safe($r->reference_no) }}</td>
                    <td class="col-payment small">{{ $safe($r->mode_of_payment) }}</td>
                </tr>
            @endforeach

            {{-- Month subtotal row --}}
            <tr class="monthly-subtotal">
                <td colspan="3" class="right">Monthly Subtotal ({{ $safe($month) }})</td>
                {{-- FIX: Peso Sign (₱) prepended here --}}
                <td class="col-amount right">₱ {{ $phpCurrency($monthSubtotal) }}</td>
                <td colspan="5"></td>
            </tr>
        @endforeach
        </tbody>

        <tfoot>
        <tr class="grand-total-row">
            <td colspan="3" class="right">GRAND TOTAL FOR PERIOD</td>
            {{-- FIX: Peso Sign (₱) prepended here --}}
            <td class="col-amount right">₱ {{ $phpCurrency($grandTotal) }}</td>
            <td colspan="5" class="total-breakdown small muted" style="padding-left:15px;">
                <div style="font-weight:600;">Monthly Breakdown:</div>
                @php $i=0; @endphp
                @foreach($grouped as $m => $items)
                    @php $t = array_sum(array_column($items, 'amount')); @endphp {{-- Cleaner sum calculation --}}
                    {{-- FIX: Peso Sign (₱) prepended here --}}
                    <span class="breakdown-item">{{ $m }}: ₱ {{ $phpCurrency($t) }}</span>@if(++$i < count($grouped)) &bull; @endif
                @endforeach
            </td>
        </tr>
        </tfoot>
    </table>
@endif

{{--- Footer (Page Numbers) ---}}
<div class="footer">
    Confidential Sales Report | **{{ $orgName }}**
</div>

{{--- Dompdf page counter script ---}}
<script type="text/php">
    if (isset($pdf)) {
        $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
        $size = 9;
        // Ensure you use a font supported by your PDF library (like 'Helvetica' or 'Arial' is often safe)
        $font = $fontMetrics->get_font("Helvetica", "normal");
        $pdf->page_text(520, 810, $text, $font, $size, [0,0,0]);
    }
</script>

</body>
</html>
