<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    {{-- Base styles (your shared CSS) --}}
    @include('exports.pdf._style')

    <style>
        /* === Variables for Consistency === */
        :root {
            --color-primary: #1F2937; /* Dark Gray/Slate for text and strong borders */
            --color-accent: #3b82f6; /* Blue for key lines and headings */
            --color-muted: #6B7280; /* Standard muted text */
            --color-light-border: #E5E7EB; /* Very light gray border */
            --color-row-stripe: #F9FAFB; /* Light background for stripe */
        }

        /* =============== Modern Report Styles (Refined) =============== */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10.5px;
            color: var(--color-primary);
            line-height: 1.5;
        }
        .right { text-align: right; }
        .muted, .small { color: var(--color-muted); }

        /* Header */
        .brand-header {
            display:flex; justify-content:space-between; align-items:flex-start;
            padding-bottom:12px; margin-bottom:20px;
            border-bottom:3px solid var(--color-accent); /* Use accent color */
        }
        .brand-left { display:flex; align-items:flex-start; gap:12px; }
        .brand-logo { max-width:100px; max-height:40px; }
        .report-title h1 { margin:0; font-size:18px; color:var(--color-primary); font-weight:700; text-transform:uppercase; }
        .report-title .subtitle { color:var(--color-muted); font-size:10px; margin-top:3px; }
        .report-info { text-align:right; font-size:10px; }
        .report-info strong { color:var(--color-primary); }

        /* KPI / Summary (Simplified/Refined Style) */
        .kpi-row {
            display:flex;
            margin:0 0 20px;
            border:1px solid var(--color-light-border);
            border-radius:4px;
            overflow:hidden;
            background:#ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .kpi {
            flex:1;
            padding:10px 15px;
            border-right:1px solid var(--color-light-border);
            /* background:#f9fafb; -- Removed for cleaner white background */
        }
        .kpi:last-child { border-right:none; }
        .kpi .label {
            font-size:9px; /* Slightly smaller label */
            color:var(--color-muted);
            margin-bottom:2px;
            text-transform:uppercase;
            letter-spacing:0.5px;
            font-weight:600;
        }
        .kpi .value {
            font-size:16px; /* Slightly larger value */
            font-weight:800;
            color:var(--color-primary);
            font-variant-numeric: tabular-nums;
        }
        /* Color emphasis on key KPIs */
        .kpi-total { background:#eff6ff; border-left:4px solid var(--color-accent); }
        .kpi-paid  { background:#f0fdf4; border-left:4px solid #10b981; } /* Deep Green */
        .kpi-pending { background:#fff7ed; border-left:4px solid #fb923c; } /* Orange */

        /* Table */
        .section-title {
            font-size:14px;
            font-weight:700;
            color:var(--color-primary);
            margin-bottom:10px;
            padding-bottom:4px;
            border-bottom:1px solid var(--color-light-border);
        }
        .data-table { width:100%; border-collapse:collapse; margin-top:0; } /* Removed top margin */
        .data-table th, .data-table td { border-bottom:1px solid #f3f4f6; padding:8px 10px; vertical-align:top; } /* Increased padding */
        .data-table thead th {
            background:var(--color-row-stripe);
            font-size:10.5px;
            text-align:left;
            font-weight:600;
            color:var(--color-primary);
            border-bottom:2px solid var(--color-light-border);
            text-transform:uppercase;
        }
        .data-table tbody tr:nth-child(even) { background:var(--color-row-stripe); } /* Use variable */
        .data-table tbody tr:nth-child(odd) { background:#ffffff; }

        .property-title { font-weight:600; font-size:11px; line-height:1.3; color:var(--color-primary); }
        .property-id { font-size:9px; margin-top:2px; color:var(--color-muted); }
        .amount-cell {
            font-variant-numeric: tabular-nums;
            font-weight:700; /* Bolder amount */
            color:#059669; /* Use green for money */
            white-space:nowrap;
        }
        .col-id, .col-ref { font-family: monospace; }
        .col-date { white-space:nowrap; }

        /* Group & Totals */
        .monthly-group-header {
            background:var(--color-primary);
            color:#ffffff;
            font-weight:700;
            font-size:11px;
            padding:6px 10px !important;
            text-transform:uppercase;
        }
        .monthly-subtotal {
            background:#eff6ff; /* Light blue background for subtotal */
            font-weight:700;
            border-top:2px solid var(--color-accent);
            font-size:11px;
            color:var(--color-primary);
        }
        .monthly-subtotal .right { font-size:11px; font-weight:700; }

        /* Badges */
        .badge { display:inline-block; padding:2px 6px; border-radius:4px; font-size:8.5px; font-weight:600; line-height:1; border:1px solid transparent; text-transform:uppercase; white-space:nowrap; }
        .badge-paid { background:#dcfce7; color:#065f46; border-color:#a7f3d0; }
        .badge-pending { background:#fff7ed; color:#b45309; border-color:#fde68a; }
        .badge-cancelled { background:#fee2e2; color:#b91c1c; border-color:#fecaca; }
        .role-tag { font-size:9px; color:var(--color-muted); }

        .no-data { padding:12px; background:#fff7ed; color:#9a3412; border:1px solid #fdba74; border-radius:6px; text-align:center; }
        .footer { margin-top:14px; font-size:9px; color:var(--color-muted); text-align:center; }
    </style>
</head>
<body>
@php
    /* (All PHP Logic Remains Unchanged) */
    $safe = fn($v, $fallback = '—') => isset($v) && $v !== '' ? $v : $fallback;
    $peso = fn($n) => '₱ ' . number_format((float) $n, 2);

    $getMonth = function ($row) {
        return $row->month ?? $row->ym ?? 'Unknown';
    };
    $getTxDate = function ($row) {
        $dt = $row->transaction_date ?? $row->tx_date ?? null;
        try { return \Carbon\Carbon::parse($dt)->format('Y-m-d'); } catch (\Throwable $e) { return '—'; }
    };

    $rows   = isset($rows) && is_iterable($rows) ? $rows : [];
    $title  = $title  ?? 'Monthly Sales – Transactions';
    $range  = $range  ?? [null, null];
    $orgName= $orgName ?? config('app.name');
    $logoUrl= $logoUrl ?? null;

    $paidStatuses    = ['paid','accepted','completed','success'];
    $pendingStatuses = ['pending','processing','in_review'];
    $cancelStatuses  = ['cancelled','rejected','voided','failed'];

    $grouped      = [];
    $grandTotal   = 0.0;
    $totalCount   = 0;
    $statusTotals = [];
    $statusCounts = [];

    foreach ($rows as $r) {
        $month = $getMonth($r);
        $grouped[$month] = $grouped[$month] ?? [];
        $grouped[$month][] = $r;

        $amt = (float) ($r->amount ?? 0);
        $grandTotal += $amt;
        $totalCount++;

        $st = strtolower($r->status ?? 'unknown');
        $statusTotals[$st] = ($statusTotals[$st] ?? 0) + $amt;
        $statusCounts[$st] = ($statusCounts[$st] ?? 0) + 1;
    }

    $sumBy = function(array $keys) use ($statusTotals) {
        return array_reduce($keys, fn($c, $k) => $c + ($statusTotals[$k] ?? 0), 0.0);
    };
    $cntBy = function(array $keys) use ($statusCounts) {
        return array_reduce($keys, fn($c, $k) => $c + ($statusCounts[$k] ?? 0), 0);
    };

    $paidTotal    = $sumBy($paidStatuses);
    $paidCount    = $cntBy($paidStatuses);
    $pendingTotal = $sumBy($pendingStatuses);
    $pendingCount = $cntBy($pendingStatuses);
    $cancelTotal  = $sumBy($cancelStatuses);
    $cancelCount  = $cntBy($cancelStatuses);

    $avgTicket = $totalCount > 0 ? $grandTotal / $totalCount : 0;
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
        <p style="margin:0 0 2px;"><strong>{{ $safe($orgName) }}</strong></p>
        <p style="margin:0;">Generated: <strong>{{ \Carbon\Carbon::now('Asia/Manila')->format('Y-m-d H:i') }} PH</strong></p>
    </div>
</header>

{{-- ==== Detail Table ==== --}}
@if(empty($rows))
    <div class="no-data">No sales transactions found for this period.</div>
@else
    <div class="section-title">Detailed Transactions (Grouped by Month)</div>

    <table class="data-table">
        <thead>
        <tr>
            <th style="width: 5%;">Month</th>
            <th style="width: 8%;">Tx ID</th>
            <th style="width: 25%;">Property Details</th>
            <th class="col-amount right" style="width: 12%;">Amount</th>
            <th style="width: 10%;">Status</th>
            <th style="width: 8%;">Tx Date</th>
            <th style="width: 15%;">Primary Agent</th>
            <th style="width: 9%;">Ref No.</th>
            <th style="width: 8%;">Payment</th>
        </tr>
        </thead>
        <tbody>
        @foreach($grouped as $month => $items)
            @php
                // Sort each month by transaction date (fallback safe)
                usort($items, fn($a, $b) => strcmp((string)($a->tx_date ?? $a->transaction_date ?? ''), (string)($b->tx_date ?? $b->transaction_date ?? '')));
                $monthSubtotal = 0.0;
            @endphp

            {{-- Month header --}}
            <tr>
                <td colspan="9" class="monthly-group-header">{{ $safe($month) }} ({{ count($items) }} Transactions)</td>
            </tr>

            @foreach($items as $r)
                @php
                    $amt = (float) ($r->amount ?? 0);
                    $monthSubtotal += $amt;
                    $status = strtolower($r->status ?? 'unknown');
                    $badgeClass = in_array($status, $paidStatuses) ? 'badge-paid'
                               : (in_array($status, $pendingStatuses) ? 'badge-pending'
                               : (in_array($status, $cancelStatuses) ? 'badge-cancelled' : 'badge-pending'));
                @endphp
                <tr>
                    <td><span class="small">{{ \Carbon\Carbon::parse($month . '-01')->format('M Y') }}</span></td>
                    <td class="col-id">{{ $safe($r->transaction_id) }}</td>
                    <td>
                        <div class="property-title">{{ $safe($r->property_title) }}</div>
                        @php $propId = isset($r->property_id) ? $r->property_id : null; @endphp
                        @if(!is_null($propId) && $propId !== '')
                            <div class="property-id">ID: #{{ $safe($propId) }}</div>
                        @endif
                    </td>
                    <td class="col-amount right amount-cell">{{ $peso($amt) }}</td>
                    <td>
                        <span class="badge {{ $badgeClass }}">{{ strtoupper($safe($r->status)) }}</span>
                    </td>
                    <td class="col-date small">{{ $getTxDate($r) }}</td>
                    <td>
                        {{ $safe($r->primary_agent_name ?? $r->agent_name) }}
                        @php $role = $r->primary_agent_role ?? $r->agent_role ?? null; @endphp
                        @if(!empty($role))
                            <span class="role-tag">({{ $role }})</span>
                        @endif
                    </td>
                    <td class="col-ref small">{{ $safe($r->reference_no) }}</td>
                    <td class="col-payment small">{{ $safe($r->mode_of_payment) }}</td>
                </tr>
            @endforeach

            {{-- Month subtotal --}}
            <tr class="monthly-subtotal">
                <td colspan="3" class="right">Monthly Subtotal ({{ $safe($month) }})</td>
                <td class="col-amount right">{{ $peso($monthSubtotal) }}</td>
                <td colspan="5"></td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif

{{-- Dompdf page counter --}}
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
