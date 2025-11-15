<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    @include('exports.pdf._style')
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color:#374151; }
        .brand { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid #111827;}
        h1 { margin:0; font-size:18px; color:#111827; }
        .muted { color:#6b7280; }
        table { width:100%; border-collapse: collapse; margin-top:10px; }
        th, td { padding:8px; border-bottom:1px solid #e5e7eb; vertical-align: middle; }
        thead th { background:#f9fafb; font-weight:700; }
        .right { text-align:right; }
        .subtotal { background:#f3f4f6; font-weight:700; }
        .grand { background:#eef2ff; font-weight:800; border-top:2px solid #4f46e5;}
    </style>
</head>
<body>
@php
    $safe = fn($v, $fallback='—') => isset($v) && $v!=='' ? $v : $fallback;
    $phpCurrency = fn($n) => number_format((float)$n, 2);

    $rows   = $rows ?? collect();        // can be Collection or array
    $rows   = $rows instanceof \Illuminate\Support\Collection ? $rows : collect($rows);
    $group  = $rows->groupBy('ym');      // group by month (object property)
    $gDeals = 0;
    $gAmt   = 0.0;
@endphp

<div class="brand">
    <div>
        <h1>{{ $safe($title ?? 'Monthly Sales – By Role') }}</h1>
        <div class="muted">Period: <strong>{{ $range[0] ?? '' }}</strong> – <strong>{{ $range[1] ?? '' }}</strong></div>
    </div>
    <div class="muted">Generated: {{ \Carbon\Carbon::now('Asia/Manila')->format('Y-m-d H:i') }} PH</div>
</div>

@if($rows->isEmpty())
    <p>No data found for this period.</p>
@else
    <table>
        <thead>
        <tr>
            <th style="width:120px;">Month</th>
            <th>Role</th>
            <th class="right" style="width:100px;">Deals</th>
            <th class="right" style="width:140px;">Amount (₱)</th>
        </tr>
        </thead>
        <tbody>
        @foreach($group as $month => $items)
            @php
                $mDeals = 0; $mAmt = 0.0;
            @endphp
            <tr><td colspan="4" style="background:#f9fafb; font-weight:700;">{{ $month }}</td></tr>

            @foreach($items as $r)
                @php
                    // $r is stdClass; use ->property
                    $deals = (int)($r->deals ?? $r->total_deals ?? 0);
                    $amt   = (float)($r->amount ?? $r->total_amount ?? 0);
                    $mDeals += $deals; $mAmt += $amt;
                    $gDeals += $deals; $gAmt += $amt;
                @endphp
                <tr>
                    <td>{{ $safe($r->ym ?? $month) }}</td>
                    <td>{{ ucfirst(strtolower($r->role ?? $r->user_role ?? '')) }}</td>
                    <td class="right">{{ number_format($deals) }}</td>
                    <td class="right">{{ $phpCurrency($amt) }}</td>
                </tr>
            @endforeach

            <tr class="subtotal">
                <td colspan="2" class="right">Subtotal ({{ $month }})</td>
                <td class="right">{{ number_format($mDeals) }}</td>
                <td class="right">₱ {{ $phpCurrency($mAmt) }}</td>
            </tr>
        @endforeach
        </tbody>
        <tfoot>
        <tr class="grand">
            <td colspan="2" class="right">GRAND TOTAL</td>
            <td class="right">{{ number_format($gDeals) }}</td>
            <td class="right">₱ {{ $phpCurrency($gAmt) }}</td>
        </tr>
        </tfoot>
    </table>
@endif

<script type="text/php">
    if (isset($pdf)) {
      $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
      $font = $fontMetrics->get_font("Helvetica", "normal");
      $pdf->page_text(520, 810, $text, $font, 9, [0,0,0]);
    }
</script>
</body>
</html>
