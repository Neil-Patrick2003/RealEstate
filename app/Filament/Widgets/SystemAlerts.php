<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class SystemAlerts extends Widget
{
    protected static ?string $heading = 'System Alerts';
    protected static ?int $sort = -16;
    protected static string $view = 'filament.widgets.system-alerts';
    protected static ?string $pollingInterval = '300s';

    public function getColumnSpan(): int|string|array
    {
        return ['default' => 1, 'md' => 1, 'xl' => 3];
    }

    protected function getViewData(): array
    {
        // Count records by status
        $pendingListings   = DB::table('property_listings')
            ->where('status', 'Unassigned')
            ->count();

        $cancelledInquiries = DB::table('inquiries')
            ->where('status', 'LIKE', 'Cancelled')
            ->count();

        $pendingDeals = DB::table('deals')
            ->where('status', 'Pending')
            ->count();

        // Optionally include system log checks
        // $recentErrors = DB::table('system_logs')
        //     ->where('level', 'error')
        //     ->where('created_at', '>=', now()->subDay())
        //     ->count();

        // Build the alerts array
        $items = [];

        if ($pendingListings > 0) {
            $items[] = [
                'icon'  => '📝',
                'label' => 'Listings pending approval',
                'count' => $pendingListings,
                'tone'  => 'warning',
            ];
        }

        if ($pendingDeals > 0) {
            $items[] = [
                'icon'  => '🤝',
                'label' => 'Deals awaiting approval',
                'count' => $pendingDeals,
                'tone'  => 'warning',
            ];
        }

        if ($cancelledInquiries > 0) {
            $items[] = [
                'icon'  => '⚠️',
                'label' => 'Cancelled inquiries',
                'count' => $cancelledInquiries,
                'tone'  => 'danger',
            ];
        }

        return ['items' => $items];
    }
}
