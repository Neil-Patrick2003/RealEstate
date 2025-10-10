<?php

namespace App\Filament\Resources\DeveloperResource\Pages;

use App\Filament\Resources\DeveloperResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDevelopers extends ListRecords
{
    protected static string $resource = DeveloperResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
