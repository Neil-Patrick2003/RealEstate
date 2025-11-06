{{-- resources/views/filament/widgets/recent-feedback-list.blade.php --}}
<div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b">
        <h3 class="text-base font-semibold">Recent Feedback</h3>
    </div>

    <div class="max-h-80 overflow-y-auto divide-y">
        @forelse($items as $f)
            <div class="px-4 py-3">
                {{-- Reviewer / Sender --}}
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        @if($f->sender?->profile_photo_url)
                            <img src="{{ $f->sender->profile_photo_url }}" class="h-5 w-5 rounded-full object-cover" alt="Sender">
                        @endif
                        <p class="font-medium">{{ $f->sender?->name ?? 'Anonymous' }}</p>
                        @if($f->sender?->email)
                            <a href="mailto:{{ $f->sender->email }}" class="text-primary-600 hover:underline text-xs">email</a>
                        @endif
                    </div>
                    <span class="text-xs text-gray-500">{{ $f->created_at->diffForHumans() }}</span>
                </div>

                {{-- Agent being rated (optional line) --}}
                <div class="mt-1 text-xs text-gray-600">
                    <span class="text-gray-500">Agent:</span>
                    <span class="font-medium">{{ $f->agent?->name ?? 'Unknown Agent' }}</span>
                </div>

                {{-- Stars --}}
                @php $r = $f->rating; $full = floor($r ?? 0); @endphp
                <div class="mt-1 text-amber-500 text-sm">
                    @if(is_null($r))
                        <span class="text-gray-400">No rating</span>
                    @else
                        {!! str_repeat('★', $full) !!}{!! str_repeat('☆', 5 - $full) !!} <span class="text-gray-500">({{ number_format($r,1) }})</span>
                    @endif
                </div>

                {{-- Comment --}}
                @if(!empty($f->comment))
                    <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ $f->comment }}</p>
                @endif
            </div>
        @empty
            <div class="p-6 text-sm text-gray-500">No feedback yet.</div>
        @endforelse
    </div>
</div>
