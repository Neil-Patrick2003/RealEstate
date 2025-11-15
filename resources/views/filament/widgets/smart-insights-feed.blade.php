<x-filament-widgets::widget>
    <x-filament::section>
        <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b">
                <h3 class="text-base font-semibold">Smart Insights</h3>
                <span class="text-xs text-gray-500">Auto-updates hourly</span>
            </div>

            @if(empty($items))
                <div class="p-6 text-sm text-gray-500">No insights yet. Your hourly job will populate this.</div>
            @else
                <ul class="divide-y">
                    @foreach($items as $it)
                        {{-- $it: ["icon"=>"🏠","title"=>"Lipa City +25%","desc"=>"Inquiries vs last week","tone"=>"up|down|warn"] --}}
                        <li class="px-4 py-3 flex items-start gap-3">
                            <div class="text-xl leading-none">{{ $it['icon'] ?? '💡' }}</div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <p class="font-medium">{{ $it['title'] ?? 'Insight' }}</p>
                                    @php $tone = $it['tone'] ?? 'neutral'; @endphp
                                    <span class="text-[10px] rounded-full px-2 py-0.5
                                {{ $tone==='up'?'bg-green-100 text-green-700':($tone==='down'?'bg-red-100 text-red-700':($tone==='warn'?'bg-amber-100 text-amber-800':'bg-gray-100 text-gray-700')) }}">
                                {{ ucfirst($tone) }}
                            </span>
                                </div>
                                @if(!empty($it['desc']))
                                    <p class="text-xs text-gray-500 mt-0.5">{{ $it['desc'] }}</p>
                                @endif
                            </div>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>

    </x-filament::section>
</x-filament-widgets::widget>
