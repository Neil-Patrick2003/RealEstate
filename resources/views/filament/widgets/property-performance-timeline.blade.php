<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold">Property Performance Timeline</h3>
            <select wire:change="setPropertyId($event.target.value)" class="rounded border-gray-300 text-sm">
                @php
                    $options = \Illuminate\Support\Facades\DB::table('properties')->orderBy('title')->pluck('title','id');
                @endphp
                @foreach($options as $id => $title)
                    <option value="{{ $id }}">{{ $title }}</option>
                @endforeach
            </select>
        </div>

        {{-- Render the ChartWidget chart --}}
        {{ $this->chart }}
    </x-filament::section>
</x-filament-widgets::widget>
