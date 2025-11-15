{{-- resources/views/exports/pdf/monthly-sales-by-agent.blade.php --}}
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    @include('exports.pdf._style')
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom: 1px solid #f3f4f6; padding: 6px 8px; }
        th { background: #f9fafb; text-align: left; font-weight: 700; }
        .right { text-align: right; }
        .muted { color: #6b7280; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .sub { font-size: 10px; color: #6b7280; margin-bottom: 10px; }
    </style>
</head>
<body>

@php
    // --- SAFETY FALLBACKS ---
    $title = $title ?? 'Monthly Sales – By Agent/Broker';
    $range = $range ?? [null, null];
    $mode  = $mode ?? '';   // ✅ prevents "Undefined variable $mode"
    $rows  = $rows ?? [];

    $peso = fn($n) => '₱ ' . number_format((float)$n, 2);
@endphp

<h1>{{ $title }}</h1>
<div class="sub">
    Coverage: {{ $range[0] }} – {{ $range[1] }}
    @if(!empty($mode))
        • Attribution: <b>{{ strtoupper($mode) }}</b>
    @endif
</div>

<table>
    <thead>
    <tr>
        <th>Month</th>
        <th>User ID</th>
        <th>Name</th>
        <th>Role</th>
        <th class="right">Deals</th>
        <th class="right">Sales Amount</th>
    </tr>
    </thead>
    <tbody>
    @php $monthTotals = []; @endphp

    @forelse ($rows as $r)
        @php
            $month = $r['ym'] ?? 'Unknown';
            $amount = (float)($r['amount'] ?? 0);
            $monthTotals[$month] = ($monthTotals[$month] ?? 0) + $amount;
        @endphp
        <tr>
            <td>{{ $month }}</td>
            <td>{{ $r['user_id'] ?? '—' }}</td>
            <td>{{ $r['user_name'] ?? '—' }}</td>
            <td>{{ ucfirst($r['user_role'] ?? '—') }}</td>
            <td class="right">{{ $r['deals'] ?? 0 }}</td>
            <td class="right">{{ $peso($amount) }}</td>
        </tr>
    @empty
        <tr><td colspan="6" class="muted">No data found for this period.</td></tr>
    @endforelse
    </tbody>

    @if (!empty($monthTotals))
        <tfoot>
        <tr>
            <th colspan="5">Grand Total</th>
            <th class="right">{{ $peso(array_sum($monthTotals)) }}</th>
        </tr>
        </tfoot>
    @endif
</table>

</body>
</html>

