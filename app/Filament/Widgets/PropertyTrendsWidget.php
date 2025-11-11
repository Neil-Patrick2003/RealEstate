<?php

namespace App\Filament\Widgets;

use App\Services\PropertyTrendsService;
use Filament\Forms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Widgets\Widget;
use Illuminate\Contracts\Support\Htmlable;

class PropertyTrendsWidget extends Widget implements HasForms
{
    use InteractsWithForms;

    protected static string $view = 'filament.widgets.property-trends-widget';
    protected static ?string $heading = 'Property Trends (Smart Insights)';
    protected static ?int $sort = -5;

    /** Bindable form properties (must exist to avoid "No property found" error) */
    public ?string $from = null;
    public ?string $to   = null;
    public ?string $quick = null; // <-- this was missing

    public function getHeading(): string|Htmlable|null
    {
        return static::$heading;
    }


    public function getColumnSpan(): int|string|array
    {
        return 'full';
    }

    /** Filament v3 form schema */
    protected function getFormSchema(): array
    {
        return [
            Forms\Components\Grid::make()
                ->columns(['default' => 1, 'sm' => 3, 'lg' => 4])
                ->schema([
                    Forms\Components\DatePicker::make('from')
                        ->label('From')
                        ->native(false)
                        ->placeholder('Start date'),

                    Forms\Components\DatePicker::make('to')
                        ->label('To')
                        ->native(false)
                        ->placeholder('End date'),

                    Forms\Components\Select::make('quick')
                        ->label('Quick Range')
                        ->options([
                            'last_30'  => 'Last 30 days',
                            'last_60'  => 'Last 60 days',
                            'last_90'  => 'Last 90 days',
                            'last_180' => 'Last 180 days',
                        ])
                        ->live()
                        ->afterStateUpdated(function ($state, callable $set) {
                            // optional: clear manual dates when a quick range is chosen
                            if ($state) {
                                $set('from', null);
                                $set('to', null);
                            }
                        }),

                    Forms\Components\Actions::make([
                        Forms\Components\Actions\Action::make('apply')
                            ->label('Apply')
                            ->color('primary')
                            ->button()
                            ->icon('heroicon-o-check')
                            ->action('applyFilters'), // <-- use action(), not submit()
                    ])->columnSpan(['default' => 1, 'sm' => 3, 'lg' => 1]),
                ]),
        ];
    }

    /** Button handler */
    public function applyFilters(): void
    {
        $this->dispatch('$refresh');
    }

    /** Compute date range from bound properties */
    private function computeRange(): array
    {
        if ($this->quick) {
            $days = match ($this->quick) {
                'last_60'  => 60,
                'last_90'  => 90,
                'last_180' => 180,
                default    => 30,
            };
            $to   = now('Asia/Manila')->endOfDay()->toDateString();
            $from = now('Asia/Manila')->subDays($days - 1)->startOfDay()->toDateString();
            return [$from, $to];
        }

        // fall back to manual date pickers
        return [$this->from, $this->to];
    }

    /** Provide data to the Blade view */
    protected function getViewData(): array
    {
        [$from, $to] = $this->computeRange();

        $service = app(PropertyTrendsService::class);
        $data    = $service->summarize($from, $to);

        $gender = $data['sold_by_gender'] ?? ['male' => 0, 'female' => 0, 'unspecified' => 0];
        $age    = collect($data['sold_by_age_band'] ?? [])->sortByDesc('count')->values()->all();
        $best   = $data['best_seller'] ?? null;
        $traits = $data['characteristics'] ?? [];

        return compact('data', 'gender', 'age', 'best', 'traits', 'from', 'to');
    }
}
