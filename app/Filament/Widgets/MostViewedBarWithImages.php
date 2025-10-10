<?php

namespace App\Filament\Widgets;

use App\Models\Property;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MostViewedBarWithImages extends ChartWidget
{
    protected static ?string $heading = 'Most Viewed    ';
    protected static ?int $sort = 6;

    // Must be non-static; type must match Filament (array|string|int)
    protected array|string|int $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];

    // Instance prop is fine for height
    protected int|string|null $chartHeight = 420;

    protected function getData(): array
    {
        $props = Property::query()
            ->select(['id', 'title', 'views', 'image_url'])
            ->orderByDesc('views')
            ->limit(6)
            ->get();

        $labels = $props->map(fn ($p) => Str::limit((string) $p->title, 18))->all();
        $data   = $props->pluck('views')->map(fn ($v) => (int) $v)->all();
        $images = $props->map(fn ($p) => $this->resolveImageUrl($p->image_url))->all();

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Views',
                'data' => $data,
                'backgroundColor' => 'rgba(59, 130, 246, 0.25)', // blue-500 @ 25%
                'borderColor' => 'rgba(59, 130, 246, 0.9)',
                'borderWidth' => 2,
                'barThickness' => 36,
                'borderRadius' => 8,
                // pass images to plugin
                'images' => $images,
            ]],
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    // Register plugin correctly (root-level, via getPlugins)
    protected function getPlugins(): array
    {
        return [
            RawJs::make(<<<'JS'
                ({
                    id: 'imgOnTop',
                    afterDatasetsDraw(chart, args, pluginOptions) {
                        try {
                            const { ctx } = chart;
                            const meta = chart.getDatasetMeta(0);
                            const dataset = chart.config.data?.datasets?.[0] ?? {};
                            const images = dataset.images || [];
                            const size = (chart.options?.plugins?.imgOnTop?.size ?? 36);
                            const gap  = (chart.options?.plugins?.imgOnTop?.gap  ?? 8);

                            if (!meta || !meta.data) return;

                            images.forEach((src, i) => {
                                const elem = meta.data[i];
                                if (!elem || !src) return;

                                const pos = elem.tooltipPosition(); // center-top of bar
                                const x = pos.x;
                                const y = pos.y - gap - size;

                                const img = new Image();
                                img.crossOrigin = 'anonymous';
                                img.onload = () => {
                                    // circular mask
                                    ctx.save();
                                    ctx.beginPath();
                                    const r = size / 2;
                                    ctx.arc(x, y + r, r, 0, Math.PI * 2);
                                    ctx.closePath();
                                    ctx.clip();
                                    ctx.drawImage(img, x - r, y, size, size);
                                    ctx.restore();

                                    // subtle ring
                                    ctx.beginPath();
                                    ctx.arc(x, y + r, r, 0, Math.PI * 2);
                                    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                                    ctx.lineWidth = 2;
                                    ctx.stroke();
                                };
                                img.src = src;
                            });
                        } catch (e) {
                            console.error('imgOnTop plugin error:', e);
                        }
                    },
                })
            JS),
        ];
    }

    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'plugins' => [
                // plugin config (read by the plugin above)
                'imgOnTop' => [
                    'size' => 36,
                    'gap'  => 8,
                ],
                'legend' => [
                    'display' => false,
                ],
                'tooltip' => [
                    'mode' => 'index',
                    'intersect' => false,
                ],
            ],
            'scales' => [
                'x' => [
                    'grid'  => ['display' => false],
                    'ticks' => ['font' => ['size' => 12]],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => ['precision' => 0],
                    'grid'  => ['color' => 'rgba(200,200,200,0.15)'],
                ],
            ],
        ];
    }

    /**
     * Turn whatever is stored in image_url into a publicly loadable URL.
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
            return 'https://via.placeholder.com/64?text=No+Img';
        }

        // Absolute
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

        // Treat as public-disk path (e.g. "properties/foo.jpg")
        try {
            return Storage::disk('public')->url($raw);
        } catch (\Throwable $e) {
            return asset('storage/' . ltrim($raw, '/'));
        }
    }
}
