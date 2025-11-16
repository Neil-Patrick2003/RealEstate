<x-filament::widget>
    <x-filament::card>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b">
            <div class="space-y-1">
                <h3 class="text-lg font-semibold leading-tight">
                    {{ static::$heading }}
                </h3>
                <p class="text-sm text-gray-500">
                    {{ $weekRange }} • {{ $totalEvents }} visits
                </p>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
                <!-- Agent Filter -->
                <div class="flex items-center gap-2">
                    <label for="agentFilter" class="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Filter by Agent:
                    </label>
                    <select
                        wire:model.live="agentId"
                        id="agentFilter"
                        class="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                        <option value="all">All Agents</option>
                        @foreach($agents as $agent)
                            <option value="{{ $agent->id }}">
                                {{ $agent->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>

        <!-- Error State -->
        @if(isset($error) && $error)
            <div class="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <div class="flex items-center gap-2 text-danger-700">
                    <x-heroicon-o-exclamation-triangle class="w-5 h-5" />
                    <span class="text-sm font-medium">Failed to load calendar data</span>
                </div>
                <p class="mt-1 text-sm text-danger-600">{{ $error }}</p>
            </div>
        @else
            <!-- Calendar Container - NO ALPINE ATTRIBUTES -->
            <div class="p-4">
                <div wire:ignore id="trippingCalendar"></div>
            </div>
        @endif
    </x-filament::card>

    <script>
        // Simple calendar initialization without Alpine

        document.addEventListener('DOMContentLoaded', function() {
            initializeTrippingCalendar();
        });

        // Reinitialize when Livewire updates
        Livewire.hook('commit', ({ component }) => {
            // Check if this is our TrippingCalendarWeek component
            if (component.name && component.name.includes('TrippingCalendarWeek')) {
                setTimeout(() => {
                    initializeTrippingCalendar();
                }, 100);
            }
        });

        function initializeTrippingCalendar() {
            const calendarEl = document.getElementById('trippingCalendar');

            if (!calendarEl) {
                console.log('Calendar element not found');
                return;
            }

            // Clear any existing content
            calendarEl.innerHTML = '';

            // Check if FullCalendar is available
            if (typeof FullCalendar === 'undefined') {
                calendarEl.innerHTML = `
                    <div class="text-center p-8 text-gray-500">
                        <div class="text-lg font-semibold mb-2">Calendar Loading</div>
                        <div class="text-sm">FullCalendar library is initializing...</div>
                    </div>
                `;
                return;
            }

            try {
                // Destroy existing calendar if it exists
                if (window.trippingCalendarInstance) {
                    window.trippingCalendarInstance.destroy();
                }

                const events = @json($events);

                const calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'timeGridWeek',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    },
                    events: events,
                    eventClick: function(info) {
                        const props = info.event.extendedProps;
                        const visitTime = new Date(info.event.start).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });

                        const message = `
Property: ${props.property}
Agent: ${props.agent}
Buyer: ${props.buyer || 'N/A'}
Phone: ${props.phone || 'N/A'}
Visit Date: ${props.visit_date}
Visit Time: ${visitTime}
Status: ${props.status || 'N/A'}
${props.notes ? `Notes: ${props.notes}` : ''}
                        `.trim();

                        alert(message);
                    },
                    eventMouseEnter: function(info) {
                        const props = info.event.extendedProps;
                        const visitTime = new Date(info.event.start).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });

                        info.el.title = `${props.property}\n${props.agent}\n${visitTime}`;
                    },
                    slotMinTime: '06:00:00',
                    slotMaxTime: '22:00:00',
                    allDaySlot: false,
                    nowIndicator: true,
                    editable: false,
                    selectable: false,
                    dayMaxEvents: true,
                    height: 600,
                    eventTimeFormat: {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }
                });

                calendar.render();
                window.trippingCalendarInstance = calendar;

            } catch (error) {
                console.error('Error initializing calendar:', error);
                calendarEl.innerHTML = `
                    <div class="text-center p-8 text-red-500">
                        <div class="text-lg font-semibold mb-2">Calendar Error</div>
                        <div class="text-sm">${error.message}</div>
                    </div>
                `;
            }
        }

        // Fallback: If there are issues, show a simple list
        function showFallbackView() {
            const calendarEl = document.getElementById('trippingCalendar');
            if (!calendarEl) return;

            const events = @json($events);

            if (events.length === 0) {
                calendarEl.innerHTML = `
                    <div class="text-center p-8 text-gray-500">
                        No visits scheduled for this week
                    </div>
                `;
                return;
            }

            let html = '<div class="space-y-2">';
            events.forEach(event => {
                const start = new Date(event.start);
                html += `
                    <div class="p-3 border rounded-lg flex items-center" style="border-left: 4px solid ${event.backgroundColor};">
                        <div class="flex-1">
                            <div class="font-medium">${event.title}</div>
                            <div class="text-sm text-gray-600">${start.toLocaleString()}</div>
                            <div class="text-xs text-gray-500">
                                ${event.extendedProps.buyer ? 'Buyer: ' + event.extendedProps.buyer : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            calendarEl.innerHTML = html;
        }
    </script>

    <style>
        .fc .fc-toolbar {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
        }
        .fc .fc-event {
            border: none;
            font-size: 0.75rem;
            padding: 2px 4px;
            cursor: pointer;
            border-radius: 4px;
        }
        .fc .fc-event:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            transition: all 0.2s ease;
        }
        .fc .fc-timegrid-slot {
            height: 2.5em;
        }
    </style>
</x-filament::widget>
