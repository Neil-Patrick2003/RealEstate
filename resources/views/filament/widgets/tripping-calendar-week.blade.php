<x-filament-widgets::widget>
    <x-filament::section>
        <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b">
                <div>
                    <h3 class="text-base font-semibold">Tripping Calendar (Week)</h3>
                    <p class="text-xs text-gray-500">{{ $weekRange }}</p>
                </div>

                <div class="flex items-center gap-2 text-xs">
                    <label class="text-gray-500">Agent:</label>
                    <select wire:change="setAgentId($event.target.value)" class="rounded border-gray-300 text-sm">
                        <option value="all" @selected($agentId==='all')>All Agents</option>
                        @foreach($agents as $a)
                            <option value="{{ $a->id }}" @selected((string)$agentId===(string)$a->id)>{{ $a->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div id="tripping-calendar" style="height: 640px;"></div>
        </div>

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css">
        <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>

        <script>
            document.addEventListener('livewire:load', function () {
                const el = document.getElementById('tripping-calendar');
                if (!el || el.dataset.bound) return;
                el.dataset.bound = '1';

                const calendar = new FullCalendar.Calendar(el, {
                    initialView: 'timeGridWeek',
                    nowIndicator: true,
                    height: '100%',
                    headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridDay,timeGridWeek,dayGridMonth' },
                    events: @json($events),
                    eventClick(info) {
                        const e = info.event, x = e.extendedProps || {};
                        const lines = [
                            e.title || '',
                            x.status ? 'Status: ' + x.status : null,
                            x.buyer ? 'Buyer: ' + x.buyer : null,
                            x.phone ? 'Phone: ' + x.phone : null,
                        ].filter(Boolean);
                        alert(lines.join('\n'));
                    },
                });

                calendar.render();

                Livewire.hook('message.processed', () => {
                    try {
                        calendar.removeAllEvents();
                        const data = @json($events);
                        data.forEach(ev => calendar.addEvent(ev));
                    } catch (e) {}
                });
            });
        </script>

    </x-filament::section>
</x-filament-widgets::widget>
