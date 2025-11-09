<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    {{-- @include('exports.pdf._style') - Assuming this contains basic reset/normalize styles --}}
    <style>
        /* Define a subtle primary color for accents */
        :root {
            --color-primary: #1F2937; /* Dark Gray/Slate for text and strong borders */
            --color-accent: #3b82f6; /* Blue for key lines and headings */
            --color-muted: #6B7280; /* Standard muted text */
            --color-light-border: #E5E7EB; /* Very light gray border */
            --color-row-stripe: #F9FAFB; /* Light background for stripe */
            --font-stack: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        body {
            font-family: var(--font-stack);
            font-size: 10.5px; /* Slightly smaller for density */
            color: var(--color-primary);
            line-height: 1.5;
        }

        /* --- Header Section --- */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid var(--color-accent); /* Use accent color for main separator */
        }

        .h1 {
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            color: var(--color-primary);
            text-transform: uppercase;
        }

        .muted {
            color: var(--color-muted);
            font-size: 10px;
        }

        /* --- Table Section --- */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Subtle shadow for a lifted effect */
        }

        /* Table Cell Styling */
        th, td {
            padding: 10px 12px; /* Increased padding */
            border-bottom: 1px solid var(--color-light-border);
            vertical-align: middle;
        }

        /* Table Header Styling */
        thead th {
            background: var(--color-row-stripe);
            font-weight: 600;
            font-size: 11px;
            text-align: left;
            color: var(--color-primary);
            border-bottom: 2px solid var(--color-light-border);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Table Body Rows (Zebra Striping) */
        tbody tr:nth-child(even) {
            background-color: var(--color-row-stripe);
        }

        /* Monthly Group Row */
        .group {
            background: var(--color-primary);
            color: #FFFFFF;
            font-weight: 700;
            font-size: 12px;
            text-align: left;
            padding: 8px 12px;
            border-bottom: 1px solid var(--color-primary);
        }

        /* Utility Classes */
        .right {
            text-align: right;
            font-family: monospace; /* Use monospace for numbers for alignment */
        }

        /* Subtotal Row Styling */
        .subtotal-row td {
            font-weight: 700;
            background-color: #F3F4F6; /* Slightly darker than row stripe */
            border-top: 2px solid var(--color-muted);
            border-bottom: none;
            color: var(--color-primary);
            font-size: 11px;
        }

        .no-data {
            padding: 20px;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>

<header class="header">
    <div>
        <div class="h1">{{ $title ?? 'Monthly Handled vs Sold — Agents & Brokers' }}</div>
        <div class="muted">Performance Analysis Report</div>
        <div class="muted" style="margin-top: 4px;">Period: **{{ $range[0] ?? '' }}** – **{{ $range[1] ?? '' }}**</div>
    </div>
    <div style="text-align: right;">
        {{-- You could add a logo here --}}
        {{-- <img src="path/to/logo.png" style="width: 100px; height: auto;"> --}}
        <div class="muted">Report Generated:</div>
        <div class="muted">{{ \Carbon\Carbon::now('Asia/Manila')->format('Y-m-d H:i') }} PH</div>
    </div>
</header>

@php
    $rows = $rows ?? collect();
    // group by month
    $byMonth = $rows->groupBy('ym');
@endphp

@if($rows->isEmpty())
    <p class="muted no-data">No data available for the specified period.</p>
@else
    @foreach($byMonth as $ym => $items)
        <table>
            <thead>
            <tr><th colspan="5" class="group">MONTH: {{ strtoupper($ym) }}</th></tr>
            <tr>
                <th>User</th>
                <th>Role</th>
                <th class="right">Handled Count</th>
                <th class="right">Sold Count</th>
                <th class="right">Sell-through %</th>
            </tr>
            </thead>
            <tbody>
            @php
                $sumH = 0; $sumS = 0;
            @endphp
            @foreach($items as $r)
                @php
                    $h = (int)($r->handled ?? 0);
                    $s = (int)($r->sold ?? 0);
                    $pct = $h > 0 ? round(($s/$h)*100, 1) : 0;
                    $sumH += $h; $sumS += $s;
                @endphp
                <tr>
                    <td>{{ $r->user_name }}</td>
                    <td>{{ $r->user_role }}</td>
                    <td class="right">{{ number_format($h) }}</td>
                    <td class="right">{{ number_format($s) }}</td>
                    <td class="right">{{ $pct }}%</td>
                </tr>
            @endforeach
            <tr class="subtotal-row">
                <td colspan="2" style="text-align:right;">Monthly Subtotal</td>
                <td class="right">{{ number_format($sumH) }}</td>
                <td class="right">{{ number_format($sumS) }}</td>
                <td class="right">
                    {{ $sumH > 0 ? round(($sumS/$sumH)*100, 1) : 0 }}%
                </td>
            </tr>
            </tbody>
        </table>

        {{-- Use a subtle space, not just a div --}}
        <div style="height:15px; page-break-after: always;"></div>
    @endforeach
@endif

</body>
</html>
