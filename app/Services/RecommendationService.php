<?php

namespace App\Services;

use App\Models\SearchHistory;
use App\Models\Property;
use App\Models\Transaction; // ⬅️ NEW
use App\Notifications\NewMatchingPropertyNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class RecommendationService
{
    /**
     * Main: Get recommended properties.
     *
     * Order of priority:
     *  1. Properties similar to the last transaction (if any).
     *  2. Search-history based recommendations.
     *  3. Latest popular properties as fallback.
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

        if ($searches->isEmpty()) {
            // Walang search history → try purchase-based, then popular
            $purchaseBasedOnly = $this->getPurchaseBasedFromLastTransaction($user->id, $limit);
            return $purchaseBasedOnly->isNotEmpty()
                ? $purchaseBasedOnly
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
     * Purchase-based only:
     * Get properties similar to the buyer's most recent transaction.
     *
     *  - same property_type
     *  - optionally same sub_type
     *  - price within ±20%
     *  - same isPresell flag if present
     *  - prefer NEW listings after last transaction date
     */
    /**
     * Purchase-based only:
     * Get properties similar to the buyer's most recent transaction.
     *
     * SAME on:
     *  - property_type (category)
     *  - sub_type      (subcategory)
     *  - isPresell     (pre-selling or not)
     *  - price within ±20%
     */
    public function getPurchaseBasedFromLastTransaction(int $buyerId, int $limit = 12): Collection
    {
        $lastTransaction = Transaction::with('property')
            ->where('buyer_id', $buyerId)
             ->where('status', 'SOLD') // ⬅️ uncomment & adjust if you have status field
            ->latest('created_at')
            ->first();

        if (! $lastTransaction || ! $lastTransaction->property) {
            return collect();
        }

        $baseProperty = $lastTransaction->property;

        $results = collect();
        $usedIds = [$baseProperty->id];

        /*
         * 1️⃣ NEW similar properties after last purchase
         *    (same type, sub_type, isPresell, price range)
         */
        $groupNew = Property::where('status', 'Published')
            ->whereNotIn('id', $usedIds)
            ->where('property_type', $baseProperty->property_type)
            ->where('sub_type', $baseProperty->sub_type)         // SAME sub_type (even if null)
            ->where('isPresell', $baseProperty->isPresell)       // SAME isPresell (even if null)
            ->whereBetween('price', [
                $baseProperty->price * 0.8,  // -20%
                $baseProperty->price * 1.2,  // +20%
            ])
            ->where('created_at', '>', $lastTransaction->created_at)
            ->with(['project', 'coordinate', 'images'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $results = $results->merge($groupNew);
        $usedIds = $results->pluck('id')->all();

        /*
         * 2️⃣ If kulang pa, same exact category/subcategory/isPresell/price,
         *    kahit older listings (before lastTransaction)
         */
        if ($results->count() < $limit) {
            $groupSimilar = Property::where('status', 'Published')
                ->whereNotIn('id', $usedIds)
                ->where('property_type', $baseProperty->property_type)
                ->where('sub_type', $baseProperty->sub_type)
                ->where('isPresell', $baseProperty->isPresell)
                ->whereBetween('price', [
                    $baseProperty->price * 0.8,
                    $baseProperty->price * 1.2,
                ])
                ->with(['project', 'coordinate', 'images'])
                ->orderByDesc('created_at')
                ->limit($limit - $results->count())
                ->get();

            $results = $results->merge($groupSimilar);
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

                // kung search = "House" and "House" is a category, skip as keyword
                if (in_array($term, $allCategories, true)) {
                    continue;
                }

                $keyword = $term;
                break; // latest valid keyword only
            }
        }

        // 3) category = last category from categories[]
        $category = null;
        foreach ($searches as $search) {
            $cats = $search->categories ?? [];
            if (is_array($cats) && count($cats) > 0) {
                $tmp  = $cats;          // copy para iwas "indirect modification" error
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

        $searches = SearchHistory::where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        if ($searches->isEmpty()) {
            return ['Showing popular properties'];
        }

        $prefs   = $this->extractLastPreferences($searches);
        $reasons = [];

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
     * that matches their LAST transaction property.
     */
    public function notifyBuyersForNewProperty(Property $property): void
    {
        $lastTxIdsSub = Transaction::selectRaw('MAX(id) as id')
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
