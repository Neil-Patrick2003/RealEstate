<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\CarbonImmutable;

class TrippingHeatmap extends Widget
{
    protected static ?string $heading = 'Property Coverage Map (30d activity)';
    protected static ?int $sort = -29;
    protected static ?string $pollingInterval = '300s';
    protected static string $view = 'filament.widgets.tripping-heatmap';

    protected function getViewData(): array
    {
        $tz   = 'Asia/Manila';
        $to   = CarbonImmutable::now($tz)->endOfDay();
        $from = $to->subDays(29)->startOfDay();

        // Safety checks
        if (!Schema::hasTable('properties') || !Schema::hasColumn('properties', 'coordinates')) {
            return ['features' => []];
        }

        // Limit results for performance (adjust as needed)
        $limit = 300;

        // Prefer properties tied to recent trippings -> listings -> properties
        $rows = collect();

        if (Schema::hasTable('property_trippings') && Schema::hasTable('property_listings') && Schema::hasTable('properties')) {
            $rows = DB::table('property_trippings as t')
                ->join('property_listings as pl', 'pl.id', '=', 't.property_listing_id')
                ->join('properties as p', 'p.id', '=', 'pl.property_id')
                ->whereBetween('t.created_at', [$from, $to])
                ->whereNotNull('p.coordinates')
                ->select('p.id', 'p.title', 'p.coordinates')
                ->distinct()
                ->limit($limit)
                ->get();
        }

        // Fallback: if no trippings, just take recent properties with coordinates
        if ($rows->isEmpty()) {
            $rows = DB::table('properties as p')
                ->whereNotNull('p.coordinates')
                ->select('p.id', 'p.title', 'p.coordinates')
                ->orderByDesc('p.updated_at')
                ->limit($limit)
                ->get();
        }

        $features = [];

        foreach ($rows as $r) {
            $geojson = null;

            // coordinates column may hold full GeoJSON or just geometry
            // Try decode as object
            $decoded = json_decode($r->coordinates, true);
            if (!is_array($decoded)) {
                continue;
            }

            // Normalize to GeoJSON Feature
            if (isset($decoded['type']) && $decoded['type'] === 'Feature') {
                $geojson = $decoded; // already a Feature
            } elseif (isset($decoded['type']) && in_array($decoded['type'], ['Polygon', 'MultiPolygon'], true)) {
                $geojson = [
                    'type' => 'Feature',
                    'geometry' => $decoded,
                    'properties' => [],
                ];
            } elseif (isset($decoded['geometry']['type'])) {
                $geojson = [
                    'type' => 'Feature',
                    'geometry' => $decoded['geometry'],
                    'properties' => $decoded['properties'] ?? [],
                ];
            } else {
                continue; // unknown format
            }

            // Convert lon/lat strings -> float [lat, lng] for Leaflet
            $geometry = $geojson['geometry'] ?? null;
            if (!$geometry || !isset($geometry['type']) || !isset($geometry['coordinates'])) {
                continue;
            }

            $type = $geometry['type'];
            $coords = $geometry['coordinates'];

            $latlngs = [];

            if ($type === 'Polygon') {
                // Coordinates: [ [ [lon,lat], ... ] ]  (rings)
                foreach ($coords as $ring) {
                    $latlngRing = [];
                    foreach ($ring as $pair) {
                        // your sample stores strings; cast & flip
                        $lon = isset($pair[0]) ? (float) $pair[0] : null;
                        $lat = isset($pair[1]) ? (float) $pair[1] : null;
                        if ($lat === null || $lon === null) continue;
                        $latlngRing[] = [$lat, $lon]; // Leaflet expects [lat, lng]
                    }
                    if (!empty($latlngRing)) {
                        $latlngs[] = $latlngRing;
                    }
                }
            } elseif ($type === 'MultiPolygon') {
                // Coordinates: [ [ [ [lon,lat], ... ] ], [ ... ], ... ]
                foreach ($coords as $poly) {
                    $polyRings = [];
                    foreach ($poly as $ring) {
                        $latlngRing = [];
                        foreach ($ring as $pair) {
                            $lon = isset($pair[0]) ? (float) $pair[0] : null;
                            $lat = isset($pair[1]) ? (float) $pair[1] : null;
                            if ($lat === null || $lon === null) continue;
                            $latlngRing[] = [$lat, $lon];
                        }
                        if (!empty($latlngRing)) {
                            $polyRings[] = $latlngRing;
                        }
                    }
                    if (!empty($polyRings)) {
                        // Leaflet supports multi by passing array of rings per polygon
                        // We will render each polygon separately on the JS side
                        $latlngs[] = $polyRings;
                    }
                }
            } else {
                continue; // unsupported type
            }

            if (empty($latlngs)) {
                continue;
            }

            $features[] = [
                'id' => (int) $r->id,
                'title' => $r->title ?? ('Property #'.$r->id),
                'type' => $type,
                'latlngs' => $latlngs, // already [lat,lng]
            ];

            dd($features);
        }

        return ['features' => $features];
    }
}
