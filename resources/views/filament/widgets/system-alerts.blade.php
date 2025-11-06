<x-filament-widgets::widget>
    <x-filament::section>
        <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b">
                <h3 class="text-base font-semibold">System Alerts</h3>
                <span class="text-xs text-gray-500">Refreshes every 5 min</span>
            </div>

            @if(empty($items))
                <div class="p-6 text-sm text-gray-500">All clear. No alerts.</div>
            @else
                <ul class="divide-y">
                    @foreach($items as $it)
                        <li class="px-4 py-3 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="text-xl">{{ $it['icon'] }}</div>
                                <div class="text-sm">
                                    <p class="font-medium">{{ $it['label'] }}</p>
                                </div>
                            </div>
                            <span class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs
                        {{ $it['tone']==='danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800' }}">
                        {{ $it['count'] }}
                    </span>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>

    </x-filament::section>
</x-filament-widgets::widget>
