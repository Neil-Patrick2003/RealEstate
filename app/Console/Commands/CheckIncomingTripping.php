<?php

namespace App\Console\Commands;

use App\Models\PropertyTripping;
use App\Notifications\IncomingTripping;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckIncomingTripping extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check-incoming-tripping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $date = Carbon::now()->addHours(1)->startOfHour();

        PropertyTripping::with(['agent', 'buyer', 'broker'])
            ->whereStatus('pending')
            ->where('visit_date', $date->format('Y-m-d'))
            ->where('visit_time', $date->format('H:i:s'))
            ->get()
            ->each(function ($tripping)  {
                if ($tripping->agent) {
                    $tripping->agent->notify(new IncomingTripping($tripping));
                }

                if ($tripping->broker) {
                    $tripping->broker->notify(new IncomingTripping($tripping));
                }

                $tripping->buyer->notify(new IncomingTripping($tripping));
            });
    }
}
