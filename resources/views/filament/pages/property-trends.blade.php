<x-filament::page>
    {{-- Filters --}}
    <x-filament::section>
        {{ $this->form }}
        <div class="mt-3 flex gap-2">
            {{ $this->getHeaderActions()[0] }} {{-- Apply --}}
            {{ $this->getHeaderActions()[1] }} {{-- Reset --}}
        </div>
    </x-filament::section>

    @php
        $data        = $report ?? [];
        $range       = $data['range'] ?? [null,null];
        $gender      = $data['sold_by_gender'] ?? [];
        $ageBands    = $data['sold_by_age_band'] ?? [];
        $best        = $data['best_seller'] ?? null;
        $fb          = $data['feedback'] ?? null;
        $traits      = $data['characteristics'] ?? [];
        $conclusions = $data['conclusions'] ?? [];
    @endphp

    <x-filament::section heading="Headline Summary">
        <div class="text-sm text-gray-500 mb-2">
            Coverage: <strong>{{ $range[0] }}</strong> – <strong>{{ $range[1] }}</strong>
        </div>
        <ul class="list-disc pl-5 space-y-1">
            @forelse($conclusions as $line)
                <li>{{ $line }}</li>
            @empty
                <li class="text-gray-500">No sold properties in the selected period.</li>
            @endforelse
        </ul>
    </x-filament::section>

    <x-filament::section heading="Sold Properties by Gender">
        <div class="overflow-x-auto">
            <table class="w-full text-sm border border-gray-200 rounded-lg">
                <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-3 py-2 border-b border-gray-200">Gender</th>
                    <th class="px-3 py-2 border-b border-gray-200">Sold Properties</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td class="px-3 py-2 border-b">Male</td>
                    <td class="px-3 py-2 border-b">{{ $gender['male'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="px-3 py-2 border-b">Female</td>
                    <td class="px-3 py-2 border-b">{{ $gender['female'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="px-3 py-2 border-b">Unspecified</td>
                    <td class="px-3 py-2 border-b">{{ $gender['unspecified'] ?? 0 }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </x-filament::section>

    <x-filament::section heading="Sold Properties by Age Band">
        <div class="overflow-x-auto">
            <table class="w-full text-sm border border-gray-200 rounded-lg">
                <thead>
                <tr class="bg-gray-50 text-left">
                    <th class="px-3 py-2 border-b border-gray-200">Age Band</th>
                    <th class="px-3 py-2 border-b border-gray-200">Sold Properties</th>
                </tr>
                </thead>
                <tbody>
                @forelse($ageBands as $b)
                    <tr>
                        <td class="px-3 py-2 border-b">{{ $b['band'] }}</td>
                        <td class="px-3 py-2 border-b">{{ $b['count'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="px-3 py-2 border-b text-gray-500" colspan="2">No age-band data.</td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>

    <x-filament::section heading="Best-Seller Agent">
        @if($best)
            <div class="space-y-1 text-sm">
                <div>
                    <strong>{{ $best['name'] }}</strong>
                    <span class="text-gray-500">
                        ({{ ucfirst($best['gender']) }}{{ $best['age'] ? ', '.$best['age'].' yrs' : '' }})
                    </span>
                </div>
                <div><strong>{{ $best['deals'] }}</strong> properties sold.</div>
                <div>
                    Feedback average: <strong>{{ $fb['avg'] ?? '—' }}</strong>
                    <span class="text-gray-500">({{ $fb['count'] ?? 0 }} feedback{{ ($fb['count'] ?? 0) == 1 ? '' : 's' }})</span>
                </div>
                <div class="pt-2">Top characteristics:</div>
                @if(!empty($traits))
                    <ul class="list-disc pl-5">
                        @foreach($traits as $k => $v)
                            <li>{{ $k }} ({{ $v }})</li>
                        @endforeach
                    </ul>
                @else
                    <div class="text-gray-500">No characteristics within range.</div>
                @endif
            </div>
        @else
            <div class="text-gray-500">No best-seller found in this range.</div>
        @endif


    </x-filament::section>

    {{-- Smart Discussion --}}
    @php $disc = $data['discussion'] ?? null; @endphp
    @if($disc)
        <x-filament::section heading="{{ $disc['headline'] ?? 'Smart Discussion' }}">
            @if(!empty($disc['tags']))
                <div class="mb-2 flex flex-wrap gap-2">
                    @foreach($disc['tags'] as $tag)
                        <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{{ $tag }}</span>
                    @endforeach
                </div>
            @endif

            @if(!empty($disc['lead']))
                <p class="text-sm text-gray-800 mb-2">{{ $disc['lead'] }}</p>
            @endif

            @if(!empty($disc['paragraphs']))
                <div class="space-y-2 text-sm text-gray-700">
                    @foreach($disc['paragraphs'] as $p)
                        <p>{{ $p }}</p>
                    @endforeach
                </div>
            @endif

            @if(!empty($disc['bullets']))
                <ul class="list-disc pl-5 mt-3 space-y-1 text-sm">
                    @foreach($disc['bullets'] as $b)
                        <li>{{ $b }}</li>
                    @endforeach
                </ul>
            @endif
        </x-filament::section>
    @endif



</x-filament::page>
