<?php

namespace App\Services;

use App\Models\SearchHistory;
use App\Models\Property;
use App\Models\Transaction;
use App\Notifications\NewMatchingPropertyNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class RecommendationService
{
    /**
     * Main: Get recommended properties.
     *
     * Order of priority:
     *  0. Properties similar to the last transaction (if any).
     *  0B. Properties similar to buyer's recent buying HABITS (last N sold tx).
     *  1. Search-history based recommendations.
     *  2. Latest popular properties as fallback.
     */
    public function getRecommendedProperties(int $limit = 12): Collection
    {
        $user = Auth::user();

        if (! $user) {
            return $this->getPopularProperties($limit);
        }

        // Last 20 history entries
        $searches = SearchHistory::where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        // No search history → try last-transaction, then habit-based, then popular
        if ($searches->isEmpty()) {
            $purchaseBasedOnly = $this->getPurchaseBasedFromLastTransaction($user->id, $limit);
            if ($purchaseBasedOnly->isNotEmpty()) {
                return $purchaseBasedOnly;
            }

            $habitBasedOnly = $this->getPurchaseHabitBasedFromTransactions($user->id, $limit);
            return $habitBasedOnly->isNotEmpty()
                ? $habitBasedOnly
                : $this->getPopularProperties($limit);
        }

        // Derive final prefs from search history
        $prefs = $this->extractLastPreferences($searches);

        $keyword   = $prefs['keyword'];     // e.g. "Nasugbu"
        $category  = $prefs['category'];    // e.g. "House"
        $subcat    = $prefs['subcategory']; // e.g. "Single Family"
        $isPresell = $prefs['is_presell'];  // true/false/null

        $results = collect();
        $usedIds = [];

        /*
         * 0️⃣ FIRST: recommendations based on last transaction (if any)
         */
        $purchaseBased = $this->getPurchaseBasedFromLastTransaction($user->id, $limit);
        if ($purchaseBased->isNotEmpty()) {
            $results = $results->merge($purchaseBased);
            $usedIds = $results->pluck('id')->all();
        }

        /*
         * 0️⃣B: recommendations based on buying HABITS (last N transactions)
         */
        if ($results->count() < $limit) {
            $habitBased = $this->getPurchaseHabitBasedFromTransactions(
                $user->id,
                $limit - $results->count(),
                $usedIds
            );

            if ($habitBased->isNotEmpty()) {
                $results = $results->merge($habitBased);
                $usedIds = $results->pluck('id')->all();
            }
        }

        /*
         * 1️⃣ keyword + category + subcategory
         */
        if ($results->count() < $limit && $keyword && $category && $subcat) {
            $group1 = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where('property_type', $category)
                ->where('sub_type', $subcat)
                ->where(function ($q) use ($keyword) {
                    $q->where('title', 'like', '%' . $keyword . '%')
                        ->orWhere('address', 'like', '%' . $keyword . '%')
                        ->orWhere('description', 'like', '%' . $keyword . '%');
                });

            if ($isPresell !== null) {
                $group1->where('isPresell', $isPresell);
            }

            $group1 = $group1
                ->with(['project', 'coordinate', 'images'])
                ->orderBy('created_at', 'desc')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($group1);
            $usedIds = $results->pluck('id')->all();
        }

        /*
         * 2️⃣ keyword + category (any sub_type)
         */
        if ($results->count() < $limit && $keyword && $category) {
            $group2 = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where('property_type', $category)
                ->where(function ($q) use ($keyword) {
                    $q->where('title', 'like', '%' . $keyword . '%')
                        ->orWhere('address', 'like', '%' . $keyword . '%')
                        ->orWhere('description', 'like', '%' . $keyword . '%');
                });

            if ($isPresell !== null) {
                $group2->where('isPresell', $isPresell);
            }

            $group2 = $group2
                ->with(['project', 'coordinate', 'images'])
                ->orderBy('created_at', 'desc')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($group2);
            $usedIds = $results->pluck('id')->all();
        }

        /*
         * 3️⃣ keyword only (any type/subtype)
         */
        if ($results->count() < $limit && $keyword) {
            $group3 = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where(function ($q) use ($keyword) {
                    $q->where('title', 'like', '%' . $keyword . '%')
                        ->orWhere('address', 'like', '%' . $keyword . '%')
                        ->orWhere('description', 'like', '%' . $keyword . '%');
                });

            if ($isPresell !== null) {
                $group3->where('isPresell', $isPresell);
            }

            $group3 = $group3
                ->with(['project', 'coordinate', 'images'])
                ->orderBy('created_at', 'desc')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($group3);
            $usedIds = $results->pluck('id')->all();
        }

        /*
         * 4️⃣ No keyword but may category → category-based
         */
        if ($results->count() < $limit && ! $keyword && $category) {
            // 4a: category + subcategory
            if ($category && $subcat) {
                $groupCatSub = Property::where('status', 'Published')
                    ->whereNotIn('id', $usedIds)
                    ->where('property_type', $category)
                    ->where('sub_type', $subcat);

                if ($isPresell !== null) {
                    $groupCatSub->where('isPresell', $isPresell);
                }

                $groupCatSub = $groupCatSub
                    ->with(['project', 'coordinate', 'images'])
                    ->orderBy('created_at', 'desc')
                    ->limit($limit - $results->count())
                    ->get();

                $results = $results->merge($groupCatSub);
                $usedIds = $results->pluck('id')->all();
            }

            // 4b: category only
            if ($results->count() < $limit) {
                $groupCat = Property::where('status', 'Published')
                    ->whereNotIn('id', $usedIds)
                    ->where('property_type', $category);

                if ($isPresell !== null) {
                    $groupCat->where('isPresell', $isPresell);
                }

                $groupCat = $groupCat
                    ->with(['project', 'coordinate', 'images'])
                    ->orderBy('created_at', 'desc')
                    ->limit($limit - $results->count())
                    ->get();

                $results = $results->merge($groupCat);
                $usedIds = $results->pluck('id')->all();
            }
        }

        /*
         * 5️⃣ Fill with latest kung kulang pa
         */
        if ($results->count() < $limit) {
            $fallback = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->with(['project', 'coordinate', 'images'])
                ->orderBy('created_at', 'desc')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($fallback);
        }

        return $results->take($limit);
    }

    private function getPopularProperties(int $limit): Collection
    {
        return Property::where('status', 'Published')
            ->with(['project', 'coordinate', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * IMPORTANT: set this to your real "completed purchase" value in DB.
     * Example values: SOLD / Sold / sold
     */
    private function soldStatus(): string
    {
        return 'SOLD';
    }

    /**
     * Use created_at if transactions table has it; otherwise fallback to id.
     */
    private function txOrderColumn(): string
    {
        return Schema::hasColumn('transactions', 'created_at') ? 'created_at' : 'id';
    }

    /**
     * Purchase-based only:
     * Get properties similar to the buyer's most recent SOLD transaction.
     *
     * Match on:
     *  - property_type
     *  - sub_type (only if base has value)
     *  - isPresell (only if base is not null)
     *  - price within ±20% (only if base price is valid)
     * Prefer newer property listings than the last transaction (if timestamps exist).
     */
    public function getPurchaseBasedFromLastTransaction(int $buyerId, int $limit = 12): Collection
    {
        $lastTransaction = Transaction::with('property')
            ->where('buyer_id', $buyerId)
            ->where('status', $this->soldStatus())
            ->latest($this->txOrderColumn())
            ->first();

        if (! $lastTransaction?->property) {
            return collect();
        }

        $base = $lastTransaction->property;

        $usedIds = [$base->id];
        $results = collect();

        // 1) Prefer NEW listings after last purchase (if both have created_at)
        $qNew = Property::where('status', 'Published')
            ->whereNotIn('id', $usedIds)
            ->where('property_type', $base->property_type)
            ->when(!is_null($base->sub_type) && $base->sub_type !== '', fn ($q) => $q->where('sub_type', $base->sub_type))
            ->when(!is_null($base->isPresell), fn ($q) => $q->where('isPresell', $base->isPresell))
            ->when(is_numeric($base->price) && (float) $base->price > 0, fn ($q) => $q->whereBetween('price', [
                (float) $base->price * 0.8,
                (float) $base->price * 1.2,
            ]))
            ->with(['project', 'coordinate', 'images'])
            ->orderByDesc('created_at');

        if (
            Schema::hasColumn('transactions', 'created_at') &&
            Schema::hasColumn('properties', 'created_at') &&
            $lastTransaction->created_at
        ) {
            $qNew->where('created_at', '>', $lastTransaction->created_at);
        }

        $groupNew = $qNew->limit($limit)->get();
        $results  = $results->merge($groupNew);

        // 2) If kulang, allow older listings with same filters
        if ($results->count() < $limit) {
            $usedIds = array_values(array_unique(array_merge($usedIds, $results->pluck('id')->all())));

            $groupSimilar = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where('property_type', $base->property_type)
                ->when(!is_null($base->sub_type) && $base->sub_type !== '', fn ($q) => $q->where('sub_type', $base->sub_type))
                ->when(!is_null($base->isPresell), fn ($q) => $q->where('isPresell', $base->isPresell))
                ->when(is_numeric($base->price) && (float) $base->price > 0, fn ($q) => $q->whereBetween('price', [
                    (float) $base->price * 0.8,
                    (float) $base->price * 1.2,
                ]))
                ->with(['project', 'coordinate', 'images'])
                ->orderByDesc('created_at')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($groupSimilar);
        }

        return $results->take($limit);
    }

    /**
     * Habit-based recommendations:
     * Uses buyer's last N SOLD transactions to learn purchase patterns
     * and recommends similar Published properties.
     *
     * Pattern signals:
     *  - most frequent property_type (+ sub_type when present)
     *  - isPresell preference when present
     *  - typical price band (avg ±20%)
     */
    public function getPurchaseHabitBasedFromTransactions(
        int $buyerId,
        int $limit = 12,
        array $excludeIds = []
    ): Collection {
        if ($limit <= 0) {
            return collect();
        }

        $txs = Transaction::with(['property:id,property_type,sub_type,isPresell,price'])
            ->where('buyer_id', $buyerId)
            ->where('status', $this->soldStatus())
            ->latest($this->txOrderColumn())
            ->take(10) // habit window
            ->get()
            ->filter(fn ($tx) => $tx->property);

        // Need at least 2 purchases to infer "habit"
        if ($txs->count() < 2) {
            return collect();
        }

        // Exclude all purchased properties by this buyer
        $purchasedPropertyIds = Transaction::where('buyer_id', $buyerId)
            ->whereNotNull('property_id')
            ->pluck('property_id')
            ->unique()
            ->values()
            ->all();

        $usedIds = array_values(array_unique(array_merge($excludeIds, $purchasedPropertyIds)));

        // Rank combos by frequency: type|sub|presell
        $combos = $txs->map(function ($tx) {
            $p = $tx->property;
            return [
                'property_type' => $p->property_type,
                'sub_type'      => $p->sub_type,
                'isPresell'     => $p->isPresell,
                'price'         => is_numeric($p->price) ? (float) $p->price : null,
            ];
        })
            ->groupBy(function ($row) {
                return implode('|', [
                    (string) ($row['property_type'] ?? ''),
                    (string) ($row['sub_type'] ?? ''),
                    is_null($row['isPresell']) ? 'NULL' : (string) $row['isPresell'],
                ]);
            })
            ->map(function ($items) {
                $first = $items->first();
                $prices = $items->pluck('price')->filter(fn ($v) => ! is_null($v) && $v > 0);
                $avg = $prices->count() ? (float) $prices->avg() : null;

                return [
                    'property_type' => $first['property_type'] ?? null,
                    'sub_type'      => $first['sub_type'] ?? null,
                    'isPresell'     => $first['isPresell'] ?? null,
                    'count'         => $items->count(),
                    'avg_price'     => $avg,
                ];
            })
            ->filter(fn ($c) => ! empty($c['property_type']))
            ->sortByDesc('count')
            ->take(3)
            ->values();

        if ($combos->isEmpty()) {
            return collect();
        }

        $results = collect();

        // Distribute results across top habit clusters
        $alloc = [0.5, 0.3, 0.2];

        foreach ($combos as $i => $combo) {
            if ($results->count() >= $limit) {
                break;
            }

            $take = (int) round($limit * ($alloc[$i] ?? 0.2));
            $take = max(1, min($take, $limit - $results->count()));

            $q = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where('property_type', $combo['property_type'])
                ->when(! is_null($combo['sub_type']) && $combo['sub_type'] !== '', fn ($qq) => $qq->where('sub_type', $combo['sub_type']))
                ->when(! is_null($combo['isPresell']), fn ($qq) => $qq->where('isPresell', $combo['isPresell']))
                ->when(! is_null($combo['avg_price']) && $combo['avg_price'] > 0, fn ($qq) => $qq->whereBetween('price', [
                    $combo['avg_price'] * 0.8,
                    $combo['avg_price'] * 1.2,
                ]))
                ->with(['project', 'coordinate', 'images'])
                ->orderByDesc('created_at');

            $chunk = $q->limit($take)->get();

            if ($chunk->isNotEmpty()) {
                $results = $results->merge($chunk);
                $usedIds = array_values(array_unique(array_merge($usedIds, $chunk->pluck('id')->all())));
            }
        }

        return $results->take($limit);
    }

    /**
     * Derive:
     *  - keyword     = last search text that is NOT exactly a category
     *  - category    = last category from categories[]
     *  - subcategory = last subcategory from subcategories[]
     *  - is_presell  = last non-null is_presell
     */
    private function extractLastPreferences(Collection $searches): array
    {
        // 1) collect ALL category values
        $allCategories = [];
        foreach ($searches as $search) {
            $cats = $search->categories ?? [];
            if (is_array($cats)) {
                $allCategories = array_merge($allCategories, $cats);
            }
        }
        $allCategories = array_values(array_unique($allCategories));

        // 2) keyword = last search text that is NOT exactly a category
        $keyword = null;
        foreach ($searches as $search) {
            if (! empty($search->search)) {
                $term = trim($search->search);
                if ($term === '') {
                    continue;
                }

                if (in_array($term, $allCategories, true)) {
                    continue;
                }

                $keyword = $term;
                break;
            }
        }

        // 3) category = last category from categories[]
        $category = null;
        foreach ($searches as $search) {
            $cats = $search->categories ?? [];
            if (is_array($cats) && count($cats) > 0) {
                $tmp  = $cats;
                $last = end($tmp);
                if ($last !== false && $last !== null && $last !== '') {
                    $category = $last;
                    break;
                }
            }
        }

        // 4) subcategory = last from subcategories[]
        $subcategory = null;
        foreach ($searches as $search) {
            $subs = $search->subcategories ?? [];
            if (is_array($subs) && count($subs) > 0) {
                $tmp  = $subs;
                $last = end($tmp);
                if ($last !== false && $last !== null && $last !== '') {
                    $subcategory = $last;
                    break;
                }
            }
        }

        // 5) is_presell = last non-null
        $isPresell = null;
        foreach ($searches as $search) {
            if (! is_null($search->is_presell)) {
                $isPresell = $search->is_presell;
                break;
            }
        }

        return [
            'keyword'     => $keyword,
            'category'    => $category,
            'subcategory' => $subcategory,
            'is_presell'  => $isPresell,
        ];
    }

    /**
     * Optional: reasons for UI.
     */
    public function getRecommendationReasons(): array
    {
        $user = Auth::user();
        if (! $user) {
            return ['Showing popular properties'];
        }

        $reasons = [];

        // If buyer has multiple sold purchases, mention habits
        $soldCount = Transaction::where('buyer_id', $user->id)
            ->where('status', $this->soldStatus())
            ->count();

        if ($soldCount >= 2) {
            $reasons[] = 'Based on your previous purchases and buying habits';
        }

        $searches = SearchHistory::where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        if ($searches->isEmpty()) {
            return $reasons ?: ['Showing popular properties'];
        }

        $prefs = $this->extractLastPreferences($searches);

        if (! empty($prefs['keyword'])) {
            $reasons[] = 'Based on your recent search for "' . $prefs['keyword'] . '"';
        }

        if (! empty($prefs['category'])) {
            $reasons[] = 'Based on your interest in ' . $prefs['category'] . ' properties';
        }

        if (! empty($prefs['subcategory'])) {
            $reasons[] = 'More ' . $prefs['subcategory'] . ' homes similar to your filters';
        }

        return $reasons ?: ['Showing properties based on your recent activity'];
    }

    /**
     * Notify buyers when a new property is published
     * that matches their LAST SOLD transaction property.
     */
    public function notifyBuyersForNewProperty(Property $property): void
    {
        // Last SOLD transaction per buyer (by MAX(id))
        $lastTxIdsSub = Transaction::selectRaw('MAX(id) as id')
            ->where('status', $this->soldStatus())
            ->groupBy('buyer_id');

        $matchingLastTransactions = Transaction::with(['buyer', 'property'])
            ->whereIn('id', $lastTxIdsSub)
            ->whereHas('property', function ($q) use ($property) {
                $q->where('property_type', $property->property_type)
                    ->where('sub_type', $property->sub_type)
                    ->where('isPresell', $property->isPresell)
                    ->whereBetween('price', [
                        $property->price * 0.8,
                        $property->price * 1.2,
                    ]);
            })
            ->get();

        foreach ($matchingLastTransactions as $tx) {
            $buyer = $tx->buyer;

            if (! $buyer) {
                continue;
            }

            $alreadyNotified = $buyer->notifications()
                ->where('type', NewMatchingPropertyNotification::class)
                ->where('data->property_id', $property->id)
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $buyer->notify(new NewMatchingPropertyNotification($property));
        }
    }
}
