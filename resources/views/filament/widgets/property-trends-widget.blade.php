{{-- resources/views/filament/widgets/property-trends-widget.blade.php --}}
<x-filament-widgets::widget>
    {{-- Use one vertical stack to control all spacing with gap --}}
    <x-filament::section class="overflow-hidden">
        <x-slot name="heading">
            {{ $this->getHeading() }}
        </x-slot>

        <div class="flex flex-col gap-6"> {{-- MASTER STACK --}}

            {{-- ===== Toolbar / Filters ===== --}}
            <div>
                <form wire:submit.prevent="applyFilters">
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
                        {{ $this->form }}
                    </div>
                </form>
            </div>

            @php
                $disc    = $data['discussion']   ?? null;
                $range   = $data['range']        ?? [null, null];
                $sum     = $disc['summary']      ?? null;
                $lead    = $disc['lead']         ?? null;
                $bullets = $disc['bullets']      ?? [];
                $concl   = $data['conclusions']  ?? [];

                $best    = $best ?? null;
                $traits  = $traits ?? [];
                $gender  = $gender ?? ['male'=>0,'female'=>0,'unspecified'=>0];
                $age     = $age ?? [];

                $totalGender = (int)($gender['male'] ?? 0) + (int)($gender['female'] ?? 0) + (int)($gender['unspecified'] ?? 0);
                $pct = function($n, $d) { return $d > 0 ? number_format(($n / $d) * 100, 1) : '0.0'; };
            @endphp

            {{-- ===== 1) Header / Summary ===== --}}
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-2 flex-wrap">
                    <x-filament::badge color="info">
                        Coverage: <span class="font-medium ml-1">{{ $range[0] ?? '—' }}</span>
                        <span class="mx-1">–</span>
                        <span class="font-medium">{{ $range[1] ?? '—' }}</span>
                    </x-filament::badge>

                    @if($sum)
                        <x-filament::badge color="success" class="whitespace-normal">
                            🧠 {{ $sum }}
                        </x-filament::badge>
                    @endif
                </div>

                @if($lead)
                    <div class="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        {{ $lead }}
                    </div>
                @endif
            </div>

            {{-- ===== 2) KPI Row: Gender split ===== --}}
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {{-- Male KPI --}}
                <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-success-50/50 to-white dark:from-success-900/10 p-4">
                    <div class="flex items-center justify-between">
                        <div class="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Male</div>
                        <x-filament::badge color="success">{{ $pct((int)($gender['male'] ?? 0), $totalGender) }}%</x-filament::badge>
                    </div>
                    <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {{ number_format((int)($gender['male'] ?? 0)) }}
                    </div>
                    <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div class="h-2 bg-success-500" style="width: {{ $totalGender ? max(4, intval(($gender['male'] ?? 0) / $totalGender * 100)) : 0 }}%"></div>
                    </div>
                </div>

                {{-- Female KPI --}}
                <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-warning-50/50 to-white dark:from-warning-900/10 p-4">
                    <div class="flex items-center justify-between">
                        <div class="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Female</div>
                        <x-filament::badge color="warning">{{ $pct((int)($gender['female'] ?? 0), $totalGender) }}%</x-filament::badge>
                    </div>
                    <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {{ number_format((int)($gender['female'] ?? 0)) }}
                    </div>
                    <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div class="h-2 bg-warning-500" style="width: {{ $totalGender ? max(4, intval(($gender['female'] ?? 0) / $totalGender * 100)) : 0 }}%"></div>
                    </div>
                </div>

                {{-- Unspecified KPI --}}
                <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50/70 to-white dark:from-gray-900/10 p-4">
                    <div class="flex items-center justify-between">
                        <div class="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Unspecified</div>
                        <x-filament::badge color="gray">{{ $pct((int)($gender['unspecified'] ?? 0), $totalGender) }}%</x-filament::badge>
                    </div>
                    <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {{ number_format((int)($gender['unspecified'] ?? 0)) }}
                    </div>
                    <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div class="h-2 bg-gray-500" style="width: {{ $totalGender ? max(4, intval(($gender['unspecified'] ?? 0) / $totalGender * 100)) : 0 }}%"></div>
                    </div>
                </div>
            </div>

            {{-- ===== 3) Age Bands & Top Performer ===== --}}
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {{-- Age Bands --}}
                <x-filament::section>
                    <x-slot name="heading">
                        Age Bands (credited sold properties)
                    </x-slot>

                    @if(empty($age))
                        <x-filament::section icon="heroicon-o-information-circle" color="gray">
                            No age-band data (missing birthdates).
                        </x-filament::section>
                    @else
                        @php
                            $grand = collect($age)->sum('count') ?: 0;
                        @endphp
                        <div class="space-y-3">
                            @foreach($age as $row)
                                @php
                                    $bar = $grand ? max(4, intval($row['count'] / $grand * 100)) : 0;
                                    $per = $grand ? number_format($row['count'] / $grand * 100, 1) : '0.0';
                                @endphp
                                <div class="space-y-1">
                                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <span class="font-medium text-gray-800 dark:text-gray-200">{{ $row['band'] }}</span>
                                        <span class="tabular-nums">{{ number_format($row['count']) }} • {{ $per }}%</span>
                                    </div>
                                    <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                        <div class="h-2 bg-success-500 rounded-r" style="width: {{ $bar }}%"></div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </x-filament::section>

                {{-- Top Performer --}}
                <x-filament::section>
                    <x-slot name="heading">
                        Top Performer
                    </x-slot>

                    @if($best)
                        @php $fb = $data['feedback'] ?? ['avg'=>null,'count'=>0]; @endphp
                        <div class="flex flex-col gap-3">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {{ $best['name'] ?? '—' }}
                                    </div>
                                    <div class="text-sm text-gray-600 dark:text-gray-300">
                                        Deals: <span class="font-medium">{{ number_format($best['deals'] ?? 0) }}</span>
                                        @if(!empty($best['gender'])) • Gender: {{ ucfirst($best['gender']) }} @endif
                                        @if(isset($best['age'])) • Age: {{ $best['age'] }} @endif
                                    </div>
                                </div>

                                <div class="flex flex-col items-center shrink-0">
                                    @if($fb['avg'])
                                        <div class="flex items-center gap-1 text-2xl font-extrabold text-success-600 dark:text-success-400">
                                            <x-filament::icon icon="heroicon-s-star" class="h-6 w-6 fill-current" />
                                            <span>{{ $fb['avg'] }}</span>
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            ({{ number_format($fb['count']) }}) Reviews
                                        </div>
                                    @else
                                        <x-filament::badge color="gray">No feedback</x-filament::badge>
                                    @endif
                                </div>
                            </div>

                            <div>
                                <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Common Praised Traits</div>
                                @if(!empty($traits))
                                    <div class="flex flex-wrap gap-1.5">
                                        @foreach(collect($traits)->sortDesc() as $k => $v)
                                            <span class="inline-flex items-center gap-1 rounded-full border border-success-300 dark:border-success-700 bg-success-50/50 dark:bg-success-900/20 px-2 py-0.5 text-xs text-success-700 dark:text-success-300">
                                                <span class="font-medium">{{ $k }}</span>
                                                <span class="text-success-500 dark:text-success-400">×{{ $v }}</span>
                                            </span>
                                        @endforeach
                                    </div>
                                @else
                                    <div class="text-sm text-gray-500">No trait data.</div>
                                @endif
                            </div>
                        </div>
                    @else
                        <x-filament::section icon="heroicon-o-user" color="gray">
                            No performer data for the selected period.
                        </x-filament::section>
                    @endif
                </x-filament::section>
            </div>

            {{-- ===== 4) Smart Takeaways / Conclusions ===== --}}
            @if(!empty($bullets) || !empty($concl))
                <div>
                    <x-filament::section>
                        <x-slot name="heading">Smart Takeaways</x-slot>

                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Insights</h4>
                                @forelse($bullets as $b)
                                    <div class="flex items-start gap-2 p-2 rounded-lg bg-info-50/50 dark:bg-info-900/10 border border-info-200/50 dark:border-info-800/50">
                                        <x-filament::icon icon="heroicon-o-light-bulb" class="h-4 w-4 text-info-500 shrink-0 mt-0.5" />
                                        <p class="text-sm text-gray-800 dark:text-gray-200">{{ $b }}</p>
                                    </div>
                                @empty
                                    <div class="text-sm text-gray-500">No quick takeaways.</div>
                                @endforelse
                            </div>

                            <div class="space-y-3">
                                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Conclusions & Actions</h4>
                                @forelse($concl as $c)
                                    <div class="flex items-start gap-2 p-2 rounded-lg bg-success-50/50 dark:bg-success-900/10 border border-success-200/50 dark:border-success-800/50">
                                        <x-filament::icon icon="heroicon-o-check-circle" class="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                                        <p class="text-sm text-gray-800 dark:text-gray-200">{{ $c }}</p>
                                    </div>
                                @empty
                                    <div class="text-sm text-gray-500">No conclusions available.</div>
                                @endforelse
                            </div>
                        </div>
                    </x-filament::section>
                </div>
            @endif

        </div> {{-- /MASTER STACK --}}
    </x-filament::section>
</x-filament-widgets::widget>
