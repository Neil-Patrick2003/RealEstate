import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import PropertyCard from "@/Components/Property/PropertyCard";
import PropertyListCard from "@/Pages/Property/PropertyListCard";
import DisplayMap from "@/Pages/Buyer/Properties/DisplayMap";
import NavBar from "@/Components/NavBar";
import { router } from "@inertiajs/react";

// ---------- tiny helpers (safety + display) ----------
const A = (v) => (Array.isArray(v) ? v : []);
const S = (v) => (typeof v === "string" ? v : "");
const includesSafe = (src, needle) =>
    Array.isArray(src) ? src.includes(needle) : typeof src === "string" ? src.includes(String(needle)) : false;

const ALL_TYPES = ["Apartment", "Commercial", "Condominium", "House", "Land"];

function CheckboxFilter({ label, value, checked, onChange }) {
    return (
        <label className="group flex items-center gap-3 text-gray-700">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={checked}
                onChange={(e) => onChange(value, e.target.checked)}
            />
            <span className="text-sm">{label}</span>
        </label>
    );
}

export default function Properties({ properties = [], propertiesWithMap = [] }) {
    // Filters / view
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isPresell, setIsPresell] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [bathrooms, setBathrooms] = useState("");
    const [floorAreaMin, setFloorAreaMin] = useState("");
    const [lotAreaMin, setLotAreaMin] = useState("");
    const [withPhotos, setWithPhotos] = useState(false);

    const [viewMode, setViewMode] = useState("grid");
    const [sortOrder, setSortOrder] = useState("default");
    const [showFilters, setShowFilters] = useState(false);

    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toast, setToast] = useState(null); // {type:'success'|'error', msg:string}
    const [isFiltering, setIsFiltering] = useState(false);

    // Toast autoclose
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(t);
    }, [toast]);

    // Responsive: open filters on lg+
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)");
        setShowFilters(mq.matches);
        const handler = (e) => setShowFilters(e.matches);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    // Favorites (optimistic)
    const toggleFavorite = (propertyId) => {
        const willAdd = !favoriteIds.includes(propertyId);
        setFavoriteIds((prev) => (willAdd ? [...prev, propertyId] : prev.filter((id) => id !== propertyId)));

        router.post(
            `/properties/${propertyId}/favorites`,
            { id: propertyId },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({ type: "success", msg: willAdd ? "Added to favorites" : "Removed from favorites" }),
                onError: () => {
                    setFavoriteIds((prev) => (willAdd ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]));
                    setToast({ type: "error", msg: "Failed to update favorites" });
                },
            }
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedTypes([]);
        setIsPresell(false);
        setPriceMin("");
        setPriceMax("");
        setBedrooms("");
        setBathrooms("");
        setFloorAreaMin("");
        setLotAreaMin("");
        setWithPhotos(false);
    };

    const handleTypeChange = (type, checked) => {
        setSelectedTypes((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
    };

    // ------------ filter + sort (list) ------------
    const [filtered, setFiltered] = useState(properties);

    useEffect(() => {
        setIsFiltering(true);
        const applyFilters = () => {
            let arr = Array.isArray(properties) ? [...properties] : [];

            // Availability
            arr = arr.filter((p) => (isPresell ? p?.isPresell : !p?.isPresell));

            // Search
            const q = S(searchTerm).trim().toLowerCase();
            if (q) {
                arr = arr.filter((p) => {
                    const title = S(p?.title).toLowerCase();
                    const loc = S(p?.location).toLowerCase();
                    const addr = S(p?.address).toLowerCase();
                    return title.includes(q) || loc.includes(q) || addr.includes(q);
                });
            }

            // Types
            if (selectedTypes.length > 0) {
                arr = arr.filter((p) => includesSafe(selectedTypes, p?.property_type));
            }

            // Photos-only
            if (withPhotos) {
                arr = arr.filter((p) => A(p?.images).length > 0 || S(p?.image_url).length > 0);
            }

            // Price
            const min = priceMin === "" ? 0 : Number(priceMin) || 0;
            const max = priceMax === "" ? Infinity : Number(priceMax) || Infinity;
            arr = arr.filter((p) => {
                const price = Number(p?.price) || 0;
                return price >= min && price <= max;
            });

            // Advanced
            if (bedrooms) arr = arr.filter((p) => Number(p?.bedrooms || 0) >= Number(bedrooms));
            if (bathrooms) arr = arr.filter((p) => Number(p?.bathrooms || 0) >= Number(bathrooms));
            if (floorAreaMin) arr = arr.filter((p) => Number(p?.floor_area || 0) >= Number(floorAreaMin));
            if (lotAreaMin) arr = arr.filter((p) => Number(p?.lot_area || 0) >= Number(lotAreaMin));

            setFiltered(arr);
            setIsFiltering(false);
        };

        const deb = debounce(applyFilters, 250);
        deb();
        return () => {
            deb.cancel();
            setIsFiltering(false);
        };
    }, [
        properties,
        searchTerm,
        selectedTypes,
        isPresell,
        withPhotos,
        priceMin,
        priceMax,
        bedrooms,
        bathrooms,
        floorAreaMin,
        lotAreaMin,
    ]);

    const sortedProperties = useMemo(() => {
        const base = Array.isArray(filtered) ? [...filtered] : [];
        switch (sortOrder) {
            case "low-to-high":
                return base.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
            case "high-to-low":
                return base.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
            case "newest":
                return base.sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
            case "oldest":
                return base.sort((a, b) => new Date(a?.created_at || 0) - new Date(b?.created_at || 0));
            default:
                return base;
        }
    }, [filtered, sortOrder]);

    // map dataset mirrors list filters
    const filteredMapProps = useMemo(() => {
        let arr = Array.isArray(propertiesWithMap) ? [...propertiesWithMap] : [];

        arr = arr.filter((p) => (isPresell ? p?.isPresell : !p?.isPresell));

        const q = S(searchTerm).trim().toLowerCase();
        if (q) {
            arr = arr.filter((p) => {
                const title = S(p?.title).toLowerCase();
                const addr = S(p?.address).toLowerCase();
                const loc = S(p?.location).toLowerCase();
                return title.includes(q) || addr.includes(q) || loc.includes(q);
            });
        }

        if (selectedTypes.length > 0) {
            arr = arr.filter((p) => includesSafe(selectedTypes, p?.property_type));
        }

        if (withPhotos) {
            arr = arr.filter((p) => A(p?.images).length > 0 || S(p?.image_url).length > 0);
        }

        const min = priceMin === "" ? 0 : Number(priceMin) || 0;
        const max = priceMax === "" ? Infinity : Number(priceMax) || Infinity;
        arr = arr.filter((p) => {
            const price = Number(p?.price) || 0;
            return price >= min && price <= max;
        });

        return arr;
    }, [
        propertiesWithMap,
        searchTerm,
        selectedTypes,
        isPresell,
        withPhotos,
        priceMin,
        priceMax,
        bedrooms,
        bathrooms,
        floorAreaMin,
        lotAreaMin,
    ]);

    // Active filter chips
    const activeChips = useMemo(() => {
        const chips = [];
        if (searchTerm) chips.push({ label: `Search: “${searchTerm}”`, clear: () => setSearchTerm("") });
        if (selectedTypes.length) chips.push({ label: selectedTypes.join(" · "), clear: () => setSelectedTypes([]) });
        if (isPresell) chips.push({ label: "Pre-Selling", clear: () => setIsPresell(false) });
        if (withPhotos) chips.push({ label: "With photos", clear: () => setWithPhotos(false) });
        if (priceMin || priceMax)
            chips.push({
                label: `Price: ${priceMin || 0} – ${priceMax || "No max"}`,
                clear: () => {
                    setPriceMin("");
                    setPriceMax("");
                },
            });
        if (bedrooms) chips.push({ label: `Bedrooms ≥ ${bedrooms}`, clear: () => setBedrooms("") });
        if (bathrooms) chips.push({ label: `Bathrooms ≥ ${bathrooms}`, clear: () => setBathrooms("") });
        if (floorAreaMin) chips.push({ label: `Floor ≥ ${floorAreaMin} m²`, clear: () => setFloorAreaMin("") });
        if (lotAreaMin) chips.push({ label: `Lot ≥ ${lotAreaMin} m²`, clear: () => setLotAreaMin("") });
        return chips;
    }, [
        searchTerm,
        selectedTypes,
        isPresell,
        withPhotos,
        priceMin,
        priceMax,
        bedrooms,
        bathrooms,
        floorAreaMin,
        lotAreaMin,
    ]);

    return (
        <div className="bg-[#FAFAFB] min-h-screen">
            <NavBar/>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-5 right-5 z-50">
                    <div
                        className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur ${
                            toast.type === "success" ? "bg-emerald-600/95" : "bg-red-600/95"
                        } text-white`}
                    >
                        {toast.msg}
                    </div>
                </div>
            )}

            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">All Properties</h1>
                    <p className="mt-2 text-white/90">
                        Sleek filters, interactive map, and refined cards for a smoother browsing experience.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                {showFilters && (
                    <aside className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 space-y-6 sticky top-6 h-fit">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button className="text-sm text-emerald-700 hover:text-emerald-900" onClick={resetFilters}>
                                Clear all
                            </button>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                  {/* search icon */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" className="fill-gray-400">
                                    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.48-5.34C15.21 5.01 12.2 2 8.6 2S2 5.01 2 8.39 5.01 14.78 8.6 14.78c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.99 5 1.49-1.49L15.5 14Zm-6.9 0C6.02 14 4 11.98 4 9.39S6.02 4.78 8.6 4.78s4.6 2.02 4.6 4.61-2.02 4.61-4.6 4.61Z" />
                                  </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                                    placeholder="Title, address, or location"
                                    aria-label="Search properties"
                                />
                            </div>
                        </div>

                        {/* Availability (segmented) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                            <div className="grid grid-cols-2 rounded-lg border border-gray-300 overflow-hidden">
                                <button
                                    className={`py-2 text-sm transition ${
                                        !isPresell ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                    onClick={() => setIsPresell(false)}
                                >
                                    For Sale
                                </button>
                                <button
                                    className={`py-2 text-sm transition ${
                                        isPresell ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                    onClick={() => setIsPresell(true)}
                                >
                                    Pre-Selling
                                </button>
                            </div>
                        </div>

                        {/* Types */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Property Type</h4>
                            <div className="space-y-2">
                                {ALL_TYPES.map((type) => (
                                    <CheckboxFilter
                                        key={type}
                                        label={type}
                                        value={type}
                                        checked={includesSafe(selectedTypes, type)}
                                        onChange={handleTypeChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Photos-only */}
                        <div className="flex items-center gap-2">
                            <input
                                id="withPhotos"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                checked={withPhotos}
                                onChange={(e) => setWithPhotos(e.target.checked)}
                            />
                            <label htmlFor="withPhotos" className="text-sm text-gray-700">
                                Show only listings with photos
                            </label>
                        </div>

                        {/* Price */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range (₱)</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Advanced */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-700">Bedrooms (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Bathrooms (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={bathrooms}
                                    onChange={(e) => setBathrooms(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Floor Area (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={floorAreaMin}
                                    onChange={(e) => setFloorAreaMin(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Lot Area (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
                                    value={lotAreaMin}
                                    onChange={(e) => setLotAreaMin(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters((s) => !s)}
                                className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
                                title="Toggle filters"
                            >
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </button>
                            <span className="text-sm text-gray-600">
                                {sortedProperties.length} result{sortedProperties.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-4 py-2 text-sm ${
                                        viewMode === "grid" ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-4 py-2 text-sm ${
                                        viewMode === "list" ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    List
                                </button>
                            </div>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="py-2 px-3 rounded-lg border border-gray-300 bg-white text-sm"
                            >
                                <option value="default">Sort By</option>
                                <option value="low-to-high">Price: Low → High</option>
                                <option value="high-to-low">Price: High → Low</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* Active chips */}
                    {activeChips.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {activeChips.map((chip, idx) => (
                                <button
                                    key={`${chip.label}-${idx}`}
                                    onClick={chip.clear}
                                    className="inline-flex items-center gap-2 bg-white text-gray-700 ring-1 ring-gray-200 rounded-full px-3 py-1.5 text-sm hover:bg-gray-50"
                                    title="Remove filter"
                                >
                                    {chip.label}
                                    <svg width="14" height="14" viewBox="0 0 24 24" className="fill-gray-500">
                                        <path d="M18.3 5.71 12 12.01l-6.3-6.3L4.3 7.11l6.3 6.29-6.3 6.3 1.4 1.4 6.3-6.29 6.29 6.29 1.41-1.4-6.3-6.3 6.3-6.29z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Map */}
                    <div className="relative mb-6 h-64 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-200">
                        <DisplayMap properties={filteredMapProps} />
                        <div className="absolute left-3 top-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs shadow ring-1 ring-gray-200">
                            {filteredMapProps.length} on map
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto">
                        {isFiltering ? (
                            // skeletons
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={`sk-${i}`}
                                        className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 animate-pulse space-y-3"
                                    >
                                        <div className="h-40 w-full bg-gray-200 rounded-xl" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-8 bg-gray-200 rounded w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProperties.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-3">
                                    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                                        <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-1.4 1.4l.3.3v.8l5 5 1.5-1.5-5-5zM10 15a5 5 0 110-10 5 5 0 010 10z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600">No matching properties. Adjust your filters.</p>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {sortedProperties.map((p) => (
                                    <PropertyCard
                                        key={p?.id}
                                        property={p}
                                        favoriteIds={favoriteIds}
                                        toggleFavorite={toggleFavorite}
                                        isFavorite={favoriteIds.includes(p?.id)}
                                        onToggleFavorite={() => toggleFavorite(p?.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProperties.map((p) => (
                                    <PropertyListCard key={p?.id} property={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
