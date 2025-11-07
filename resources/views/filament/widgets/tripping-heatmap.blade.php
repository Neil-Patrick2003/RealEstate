<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold">Property Coverage Map (Last 30 Days)</h3>
            <span class="text-xs text-gray-500">Polygons from properties.coordinates</span>
        </div>

        <div id="prop-polygons-map" style="height: 480px; width: 100%; border-radius: .75rem; overflow: hidden;"></div>
    </x-filament::section>
</x-filament-widgets::widget>

@push('scripts')
    {{-- Leaflet CSS/JS --}}
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

    <script>
        document.addEventListener('livewire:navigated', renderPropPolys);
        document.addEventListener('DOMContentLoaded', renderPropPolys);

        function renderPropPolys () {
            const el = document.getElementById('prop-polygons-map');
            if (!el) return;

            // reset if re-rendered
            if (el._leaflet_id) {
                el._leaflet_id = null;
                el.innerHTML = '';
            }

            const features = @json($features ?? []);

            // Default center: Philippines
            const defaultCenter = [12.8797, 121.7740];
            const map = L.map('prop-polygons-map', { zoomControl: true }).setView(defaultCenter, 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const group = L.featureGroup().addTo(map);

            const colorFor = (id) => {
                // stable pastel per id
                const hue = (id * 47) % 360;
                return `hsl(${hue} 75% 55%)`;
            };

            features.forEach(f => {
                const color = colorFor(f.id);

                if (f.type === 'Polygon') {
                    // f.latlngs: [ [ [lat,lng], ... ] ] rings
                    const poly = L.polygon(f.latlngs, {
                        color,
                        weight: 2,
                        fillColor: color,
                        fillOpacity: 0.2,
                    }).bindPopup(`<div class="text-sm"><b>${escapeHtml(f.title)}</b><br/>Property ID: ${f.id}</div>`);
                    poly.addTo(group);
                } else if (f.type === 'MultiPolygon') {
                    // f.latlngs: array of polygons -> each polygon array of rings
                    f.latlngs.forEach(onePolyRings => {
                        const poly = L.polygon(onePolyRings, {
                            color,
                            weight: 2,
                            fillColor: color,
                            fillOpacity: 0.2,
                        }).bindPopup(`<div class="text-sm"><b>${escapeHtml(f.title)}</b><br/>Property ID: ${f.id}</div>`);
                        poly.addTo(group);
                    });
                }
            });

            if (group.getLayers().length) {
                map.fitBounds(group.getBounds().pad(0.2));
            } else {
                // No polygons → add a subtle note
                const div = L.control({position: 'topright'});
                div.onAdd = () => {
                    const c = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control');
                    c.style.background = 'white';
                    c.style.padding = '6px 10px';
                    c.style.borderRadius = '8px';
                    c.innerHTML = '<span style="color:#6b7280;font-size:12px;">No properties with polygons in last 30 days</span>';
                    return c;
                };
                div.addTo(map);
                map.setView(defaultCenter, 5);
            }

            function escapeHtml (s) {
                return String(s ?? '').replace(/[&<>"']/g, m => ({
                    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
                }[m]));
            }
        }
    </script>
@endpush
