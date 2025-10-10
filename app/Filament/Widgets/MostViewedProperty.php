<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Tables;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Storage;

class MostViewedProperty extends BaseWidget
{
    // A tiny placeholder image (feel free to swap in your own brand asset):
    private const PLACEHOLDER = 'https://via.placeholder.com/144x108?text=No+Image';

    protected static ?string $heading = 'Most Viewed Properties';
    protected static ?int $sort = 5;

    // Match Filament type (array|string|int), non-static
    protected array|string|int $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];
    protected function isTablePaginationEnabled(): bool
    {
        return false;
    }

    protected function isTableSearchable(): bool
    {
        return false;
    }



    /**
     * Query: top properties by views, with fast counts for inquiries & deals.
     *
     * Assumes:
     *  - Property::inquiries() -> hasMany(Inquiry::class, 'property_id')
     *  - Property::listing()   -> hasOne(PropertyListing::class, 'property_id')
     *  - PropertyListing::deals() -> hasMany(Deal::class, 'property_listing_id')
     */

    protected function getTableQuery(): Builder|Relation|null
    {
        return Property::query()
            ->select(['id', 'title', 'views', 'image_url'])
            ->withCount([
                'inquiries',                     // -> inquiries_count
//                'property_listing.deals as deals_count',  // -> deals_count
            ])
            ->orderByDesc('views');
    }



    protected function getTableColumns(): array
    {
        return [
            // Thumbnail
            Tables\Columns\ImageColumn::make('image_url')
                ->label('Photo')
                ->getStateUsing(fn ($record) => $this->resolveImageUrl($record->image_url))
                ->width(72)
                ->height(54)
                ->extraImgAttributes([
                    'class' => 'object-cover rounded-md border border-gray-200 dark:border-gray-700',
                ])
                ->toggleable(),

            // Title
            Tables\Columns\TextColumn::make('title')
                ->label('Property')
                ->limit(50)
                ->searchable()
                ->sortable(),

            // Views
            Tables\Columns\TextColumn::make('views')
                ->label('Views')
                ->numeric()
                ->sortable()
                ->alignRight(),

            // Inquiries (from withCount)
            Tables\Columns\TextColumn::make('inquiries_count')
                ->label('Inquiries')
                ->numeric()
                ->sortable()
                ->alignRight()
                ->badge()
                ->color('primary'),

//             Deals (from withCount alias)
//            Tables\Columns\TextColumn::make('property_listing.deals')
//                ->label('Deals')
//                ->numeric()
//                ->sortable()
//                ->alignRight()
//                ->badge()
//                ->color('success'),

        ];
    }



    // Default page size (still allows user to change via per-page selector)
    public function getDefaultTableRecordsPerPageSelectOption(): int
    {
        return 10;
    }

    protected function getTableEmptyStateHeading(): ?string
    {
        return 'No properties yet';
    }

    protected function getTableEmptyStateDescription(): ?string
    {
        return 'Once you have properties with views, they will show up here.';
    }

    /**
     * Normalize whatever is stored in image_url into a publicly-loadable URL.
     * Handles:
     *  - absolute URLs
     *  - /storage/... and storage/...
     *  - public/storage/... and common typos (public/storge)
     *  - plain public-disk paths (requires `php artisan storage:link`)
     */
    private function resolveImageUrl(?string $raw): string
    {
        $raw = trim((string) $raw);

        if ($raw === '') {
            return self::PLACEHOLDER;
        }

        // Already absolute
        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            return $raw;
        }

        // Fix common typo
        $raw = str_replace('public/storge/', 'public/storage/', $raw);

        // public/storage/... -> /storage/...
        if (str_starts_with($raw, 'public/storage/')) {
            $path = substr($raw, strlen('public/')); // "storage/..."
            return asset($path);
        }

        // /public/storage/... -> /storage/...
        if (str_starts_with($raw, '/public/storage/')) {
            return asset(ltrim(substr($raw, strlen('/public/')), '/'));
        }

        // /storage/... or storage/...
        if (str_starts_with($raw, '/storage/')) {
            return asset(ltrim($raw, '/'));
        }
        if (str_starts_with($raw, 'storage/')) {
            return asset($raw);
        }

        // Treat as public-disk path (e.g., "properties/foo.jpg")
        try {
            return Storage::disk('public')->url($raw);
        } catch (\Throwable $e) {
            // Last resort
            return self::PLACEHOLDER;
        }
    }
}
