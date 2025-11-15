<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Collection;

class PropertyTrendsService
{
    private string $tz = 'Asia/Manila';
    private array  $SOLD = ['sold','closed with deal','completed','booked','closed'];

    public function summarize(?string $from = null, ?string $to = null): array
    {
        [$start, $end] = $this->range($from, $to);

        // 1) Build union of credited users per sold property
        $credited = $this->creditedDeals($start, $end);

        if ($credited->isEmpty()) {
            // Build an empty/neutral discussion so Blade never explodes
            $discussion = $this->smartDiscussion(
                ['male' => 0, 'female' => 0, 'unspecified' => 0],
                [],
                null,
                ['avg' => null, 'count' => 0],
                []
            );

            return [
                'range'              => [$start->toDateString(), $end->toDateString()],
                'sold_by_gender'     => ['male' => 0, 'female' => 0, 'unspecified' => 0],
                'sold_by_age_band'   => [],
                'best_seller'        => null,
                'feedback'           => ['avg' => null, 'count' => 0],
                'characteristics'    => [],
                'conclusions'        => ['No sold properties in the selected period.'],
                'discussion'         => $discussion,
            ];
        }

        // 2) Sold by gender (normalize keys to always present)
        $byGenderRaw = $this->soldByGender($credited);
        $byGender = array_merge(['male'=>0,'female'=>0,'unspecified'=>0], $byGenderRaw);

        // 3) Sold by dynamic age bands (Below 20, 20–29, ..., 60+)
        $byAge = $this->soldByAgeBands($credited);

        // 4) Best-seller
        $best = $this->bestSeller($credited);

        // 5) Feedback + traits
        $fb = $best
            ? $this->feedbackForAgent((int)$best['user_id'], $start, $end)
            : ['avg' => null, 'count' => 0];

        $traits = $best
            ? $this->characteristicsForAgent((int)$best['user_id'], $start, $end)
            : [];

        // 6) Conclusions (dynamic)
        $conclusions = $this->conclusions($byGender, $byAge);

        // 7) Smart Discussion (brief)
        $discussion = $this->smartDiscussion($byGender, $byAge, $best, $fb, $traits);

        return [
            'range'              => [$start->toDateString(), $end->toDateString()],
            'sold_by_gender'     => $byGender,
            'sold_by_age_band'   => $byAge,
            'best_seller'        => $best,
            'feedback'           => $fb,
            'characteristics'    => $traits,
            'conclusions'        => $conclusions,
            'discussion'         => $discussion,
        ];
    }

    /* ---------------------------- internals ---------------------------- */

    private function range(?string $from, ?string $to): array
    {
        $now = CarbonImmutable::now($this->tz);
        if ($from && $to) {
            $s = CarbonImmutable::parse($from, $this->tz)->startOfDay();
            $e = CarbonImmutable::parse($to,   $this->tz)->endOfDay();
            if ($e->lt($s)) [$s,$e] = [$e,$s];
            return [$s,$e];
        }
        $e = $now->endOfMonth();
        $s = $e->subMonths(2)->startOfMonth(); // default: last 3 months
        return [$s,$e];
    }

    /** Union of credited deals from agents (pivot) and broker_id */
    private function creditedDeals(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        if (!Schema::hasTable('property_listings') || !Schema::hasTable('users')) {
            return collect();
        }

        $dateExpr = "COALESCE(pl.sold_at, pl.updated_at, pl.created_at)";
        $soldOnly = Schema::hasColumn('property_listings','status')
            ? "LOWER(pl.status) IN ('".implode("','", $this->SOLD)."')"
            : "pl.sold_at IS NOT NULL";

        // A) Agents via pivot (each attached agent gets 1 credit)
        $a = collect();
        if (Schema::hasTable('property_listing_agents')) {
            $a = DB::table('property_listing_agents as pla')
                ->join('property_listings as pl','pl.id','=','pla.property_listing_id')
                ->join('users as u','u.id','=','pla.agent_id')
                ->whereBetween(DB::raw($dateExpr), [$start, $end])
                ->whereRaw($soldOnly)
                ->selectRaw("
                    u.id as user_id,
                    u.name as user_name,
                    LOWER(NULLIF(u.gender,'')) as gender,
                    COALESCE(u.birth_date) as birthdate,
                    DATE($dateExpr) as deal_date
                ")
                ->get();
        }

        // B) Brokers via property_listings.broker_id
        $b = collect();
        if (Schema::hasColumn('property_listings','broker_id')) {
            $b = DB::table('property_listings as pl')
                ->join('users as u','u.id','=','pl.broker_id')
                ->whereBetween(DB::raw($dateExpr), [$start, $end])
                ->whereRaw($soldOnly)
                ->selectRaw("
                    u.id as user_id,
                    u.name as user_name,
                    LOWER(NULLIF(u.gender,'')) as gender,
                    COALESCE(u.birth_date) as birthdate,
                    DATE($dateExpr) as deal_date
                ")
                ->get();
        }

        // NOTE: If you want to EXCLUDE broker credit, return $a;
        // If you want only broker credit, return $b;
        return $a->concat($b)->map(function($r){
            return (object)[
                'user_id'   => (int)$r->user_id,
                'user_name' => $r->user_name,
                'gender'    => in_array($r->gender,['male','female']) ? $r->gender : 'unspecified',
                'birthdate' => $r->birthdate,
                'deal_date' => $r->deal_date,
                'age'       => $this->ageOn($r->birthdate, $r->deal_date),
            ];
        });
    }

    private function ageOn($birthdate, $onDate): ?int
    {
        if (!$birthdate || !$onDate) return null;
        try {
            $b = CarbonImmutable::parse($birthdate, $this->tz);
            $d = CarbonImmutable::parse($onDate,   $this->tz);
            return $b->diffInYears($d);
        } catch (\Throwable $e) { return null; }
    }

    private function soldByGender(Collection $rows): array
    {
        return $rows->groupBy('gender')->map->count()->toArray();
    }

    /** Auto-banding: Below 20, 20–29, 30–39, ..., plus 60+ if present */
    private function soldByAgeBands(Collection $rows): array
    {
        $ages = $rows->pluck('age')->filter()->all();
        if (empty($ages)) return [];

        $min = floor(min($ages) / 10) * 10; // round down to nearest 10
        $max = ceil(max($ages) / 10) * 10;  // round up to nearest 10

        $bands = [];
        if ($min > 20) $min = 20; // ensure first band includes <20

        for ($i = $min; $i <= $max; $i += 10) {
            $label = $i < 20 ? 'Below 20' : "{$i}-" . ($i + 9);
            $count = $rows->filter(function($r) use ($i) {
                if ($r->age === null) return false;
                if ($i < 20) return $r->age < 20;
                return $r->age >= $i && $r->age <= $i + 9;
            })->count();

            $bands[] = ['band' => $label, 'count' => $count];
        }

        // Add "60+" if relevant (and not already represented)
        $above60 = $rows->filter(fn($r) => $r->age >= 60)->count();
        $has60Band = collect($bands)->contains(function($b){
            return preg_match('/^6\d-6\d$/', $b['band']) || $b['band'] === '60+';
        });
        if ($above60 > 0 && !$has60Band) {
            $bands[] = ['band' => '60+', 'count' => $above60];
        }

        return $bands;
    }

    private function bestSeller(Collection $rows): ?array
    {
        $top = $rows->groupBy('user_id')->map(function($g){
            $first = $g->first();
            return [
                'user_id' => $first->user_id,
                'name'    => $first->user_name,
                'gender'  => $first->gender,
                'age'     => $first->age, // age at first credited deal in window
                'deals'   => $g->count(),
            ];
        })->sortByDesc('deals')->first();

        return $top ?: null;
    }

    private function feedbackForAgent(int $agentId, CarbonImmutable $start, CarbonImmutable $end): array
    {
        if (!Schema::hasTable('feedbacks')) {
            return ['avg'=>null,'count'=>0];
        }

        $row = DB::table('feedbacks')
            ->selectRaw("
                AVG((communication + negotiation + professionalism + knowledge)/4) as avg_score,
                COUNT(*) as n
            ")
            ->where('agent_id', $agentId)
            ->whereBetween('created_at', [$start, $end])
            ->first();

        return [
            'avg'   => $row && $row->avg_score ? round((float)$row->avg_score, 2) : null,
            'count' => $row ? (int)$row->n : 0,
        ];
    }

    private function characteristicsForAgent(int $agentId, CarbonImmutable $start, CarbonImmutable $end): array
    {
        if (!Schema::hasTable('feedbacks') || !Schema::hasTable('feedback_characteristics')) {
            return [];
        }

        $rows = DB::table('feedbacks as f')
            ->join('feedback_characteristics as fc','fc.feedback_id','=','f.id')
            ->where('f.agent_id', $agentId)
            ->whereBetween('f.created_at', [$start, $end])
            ->selectRaw("fc.characteristic, COUNT(*) as n")
            ->groupBy('fc.characteristic')
            ->orderByDesc('n')
            ->get();

        $out = [];
        foreach ($rows as $r) {
            if (!$r->characteristic) continue;
            $out[$r->characteristic] = (int)$r->n;
        }
        return $out;
    }

    /** Dynamic conclusions (gender + top 2 age bands) */
    private function conclusions(array $byGender, array $byAge): array
    {
        $c = [];

        // Gender headline
        $male = (int)($byGender['male'] ?? 0);
        $fem  = (int)($byGender['female'] ?? 0);
        if ($male || $fem) {
            $c[] = "{$male} sold properties by male agents and {$fem} sold properties by female agents.";
            if ($male > $fem)      $c[] = "Conclusion: Most buyers favored male agents in this period.";
            elseif ($fem > $male)  $c[] = "Conclusion: Most buyers favored female agents in this period.";
            else                   $c[] = "Conclusion: Buyers showed no clear preference by agent gender.";
        } else {
            $c[] = "No gender-attributed sales in this period.";
        }

        // Dynamic age-band headline (top 2)
        if (!empty($byAge)) {
            $sorted = collect($byAge)->sortByDesc('count')->values();
            $top1 = $sorted->get(0);
            $top2 = $sorted->get(1);

            if ($top1) {
                $line = "Top age band: {$top1['band']} with {$top1['count']} properties";
                if ($top2 && $top2['count'] > 0) {
                    $line .= "; next: {$top2['band']} with {$top2['count']}.";
                } else {
                    $line .= ".";
                }
                $c[] = $line;

                if ($top2 && $top1['count'] !== $top2['count']) {
                    $winner = $top1['band'];
                    $c[] = "Conclusion: Buyers are more likely to choose agents aged {$winner}.";
                } else {
                    $c[] = "Conclusion: No clear age-band preference in this range.";
                }
            }
        } else {
            $c[] = "No age-band data available (missing birthdates).";
        }

        return $c;
    }

    /* ================= SMART DISCUSSION ================= */

    private function pct(int $num, int $den): ?float
    {
        if ($den <= 0) return null;
        return round(($num / $den) * 100, 1);
    }

    private function strengthLabel(?float $pctA, ?float $pctB): string
    {
        if ($pctA === null || $pctB === null) return 'Insufficient data';
        $gap = abs($pctA - $pctB);
        if ($gap >= 20) return 'Strong';
        if ($gap >= 10) return 'Moderate';
        if ($gap >= 5)  return 'Slight';
        return 'Weak / Inconclusive';
    }

    private function topTraits(array $traits, int $k = 3): array
    {
        if (empty($traits)) return [];
        arsort($traits); // high to low
        return array_slice($traits, 0, $k, true);
    }

    /** Brief, safe narrative summary */
    private function smartDiscussion(
        array $byGender,
        array $byAge,
        ?array $best,
        ?array $feedback,
        array $traits
    ): array {
        $male  = (int)($byGender['male'] ?? 0);
        $female= (int)($byGender['female'] ?? 0);
        $unk   = (int)($byGender['unspecified'] ?? 0);
        $total = $male + $female + $unk;

        // Gender summary
        $genderTop = null;
        if ($total > 0) {
            if ($male > $female) $genderTop = "male agents ({$male} sales)";
            elseif ($female > $male) $genderTop = "female agents ({$female} sales)";
        }

        // Age summary (top 2 bands)
        $sortedAge = collect($byAge)->sortByDesc('count')->values();
        $top1 = $sortedAge->get(0);
        $top2 = $sortedAge->get(1);

        // Best seller
        $bestLine = null;
        if ($best) {
            $fbAvg = $feedback['avg'] ?? null;
            $fbTxt = $fbAvg ? " • Avg feedback {$fbAvg}★" : '';
            $ageTxt = isset($best['age']) && $best['age'] !== null ? ", {$best['age']} yrs" : '';
            $genTxt = isset($best['gender']) && $best['gender'] ? " ({$best['gender']})" : '';
            $bestLine = "{$best['name']}{$genTxt}{$ageTxt} – {$best['deals']} sales{$fbTxt}";
        }

        // Headline & lead
        $headline = "Property Trends Overview";
        $lead = $total > 0
            ? "Total of {$total} credited sold properties. Most active group: ".($genderTop ?? '—').", and agents aged ".(($top1['band'] ?? '—'))." were dominant."
            : "No sold properties in the selected period.";

        // Bullets
        $bullets = [];
        if ($genderTop) $bullets[] = "Buyers worked more often with {$genderTop}.";
        if ($top1 && $top2) $bullets[] = "Agents aged {$top1['band']} outperformed {$top2['band']}.";
        if ($bestLine) $bullets[] = "Top seller: {$bestLine}.";
        if ($traits) {
            $topTraits = collect($traits)->sortDesc()->keys()->take(2)->implode(', ');
            if ($topTraits) $bullets[] = "Common praised traits: {$topTraits}.";
        }

        $top1Band = $top1['band'] ?? '—';
        $genderPhrase = $genderTop ? $genderTop : '—';

        return [
            'headline' => $headline,
            'lead'     => $lead,
            'summary'  => "Most active agents are aged {$top1Band} and mostly {$genderPhrase}.",
            'bullets'  => $bullets,
        ];
    }
}
