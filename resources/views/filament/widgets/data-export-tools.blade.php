<x-filament-widgets::widget>
    <x-filament::section>
        <x-filament::button tag="a" href="{{ route('export.pdf.transactions') }}" icon="heroicon-o-arrow-down-tray">
            Monthly Sales – Transactions
        </x-filament::button>


        <x-filament::button tag="a" href="{{ route('export.pdf.by-agent', ['mode' => 'full']) }}" color="gray" icon="heroicon-o-arrow-down-tray">
            Monthly Sales – By Agent (full)
        </x-filament::button>


    </x-filament::section>
</x-filament-widgets::widget>
