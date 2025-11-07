{{-- resources/views/exports/pdf/monthly-sales-by-role.blade.php --}}
    <!DOCTYPE html><html><head><meta charset="utf-8">@include('exports.pdf._style')</head><body>
<h1>{{ $title }}</h1>
<div class="sub">
    Coverage: {{ $range[0] }} – {{ $range[1] }} • Attribution: <b>{{ strtoupper($mode) }}</b>
</div>

<table>
    <thead>
    <tr>
        <th>Month</th>
        <th>Role</th>
        <th class="right">Deals</th>
        <th class="right">Sales Amount</th>
    </tr>
    </thead>
    <tbody>
    @php $monthTotals = []; @endphp
    @forelse ($rows as $r)
        @php
            $monthTotals[$r['ym']] = ($monthTotals[$r['ym']] ?? 0) + (float)$r['amount'];
        @endphp
        <tr>
            <td>{{ $r['ym'] }}</td>
            <td>{{ $r['role'] }}</td>
            <td class="right">{{ $r['deals'] }}</td>
            <td class="right">{{ number_format($r['amount'], 2) }}</td>
        </tr>
    @empty
        <tr><td colspan="4" class="muted">No data.</td></tr>
    @endforelse
    </tbody>
    @if (!empty($monthTotals))
        <tfoot>
        <tr>
            <th colspan="3">Grand Total</th>
            <th class="right">{{ number_format(array_sum($monthTotals), 2) }}</th>
        </tr>
        </tfoot>
    @endif
</table>
</body></html>
