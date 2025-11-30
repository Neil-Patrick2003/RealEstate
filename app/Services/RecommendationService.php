<?php

namespace App\Services;

use App\Models\SearchHistory;
use App\Models\Property;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class RecommendationService
{
    /**
     * Main: Get recommended properties based on recent search history.
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
            return $this->getPopularProperties($limit);
        }

        // Derive final prefs
        $prefs = $this->extractLastPreferences($searches);

        $keyword   = $prefs['keyword'];     // e.g. "Nasugbu"
        $category  = $prefs['category'];    // e.g. "House"
        $subcat    = $prefs['subcategory']; // e.g. "Single Family"
        $isPresell = $prefs['is_presell'];  // true/false/null

        // dd($prefs); // uncomment to debug

        $results = collect();
        $usedIds = [];

        /*
         * 1️⃣ keyword + category + subcategory
         */
        if ($keyword && $category && $subcat) {
            $group1 = Property::where('status', 'Published')
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
}
