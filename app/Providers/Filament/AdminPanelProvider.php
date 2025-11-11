<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Analytics;
use App\Filament\Pages\Dashboard as AdminDashboard;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            // ── Identity ───────────────────────────────────────────────
            ->default()
            ->id('admin')
            ->path('admin')
            ->login() // keep Filament's login route enabled
            ->brandName('RealSync')                       // ⬅︎ set your brand
            ->brandLogo(asset('images/logo.svg'))           // ⬅︎ 160×160 SVG/PNG
            ->favicon(asset('favicon.ico'))                 // ⬅︎ optional


            ->colors([
                'primary' => Color::Amber,                  // use Filament palette helper
            ])
//            ->viteTheme('resources/css/filament.css')       // main theme entry (import your extras here)
            ->font('Inter')                              // optional if you added this in Tailwind
            ->maxContentWidth('full')                       // full-width content area
            ->sidebarCollapsibleOnDesktop()              // enable if you like a collapsible sidebar
            ->darkMode(true)

            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')

            ->pages([
                AdminDashboard::class,
                Analytics::class,
            ])
            ->widgets([
                Widgets\AccountWidget::class,
                Widgets\FilamentInfoWidget::class,
            ])

            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])

            ->databaseNotifications()
            ->unsavedChangesAlerts()
            ->spa()               ;
    }
}
