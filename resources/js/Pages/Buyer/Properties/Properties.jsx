// resources/js/Pages/Buyer/Properties/Index.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { debounce } from "lodash";
import { Head, router } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";
import PropertyCard from "@/Components/Property/PropertyCard";
import PropertyListCard from "@/Pages/Property/PropertyListCard";
import DisplayMap from "@/Pages/Buyer/Properties/DisplayMap";
import {
    Filter as FilterIcon,
    List as ListIcon,
    Grid as GridIcon,
    X,
    SlidersHorizontal,
} from "lucide-react";

/* ---------- helpers ---------- */
const A = (v) => (Array.isArray(v) ? v : []);
const S = (v) => (typeof v === "string" ? v : "");
const includesSafe = (src, needle) =>
    Array.isArray(src)
        ? src.includes(needle)
        : typeof src === "string"
            ? src.includes(String(needle))
            : false;

const ALL_TYPES = ["House", "Condominium", "Apartment", "Commercial", "Land"];
const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000;
const AREA_MIN = 0;
const AREA_MAX = 2_000;

const peso = (n) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(n);

const areaFormatter = (n) => `${n} m²`;

function CheckboxFilter({ label, value, checked, onChange }) {
    return (
        <label className="group flex items-center gap-3 text-gray-700 cursor-pointer">
            <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={checked}
                onChange={(e) => onChange(value, e.target.checked)}
            />
            <span className="text-sm">{label}</span>
        </label>
    );
}

function Checkbox({ id, label, checked, onChange }) {
    return (
        <label
            htmlFor={id}
            className="group flex items-center gap-3 text-gray-700 cursor-pointer"
        >
            <input
                id={id}
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="text-sm">{label}</span>
        </label>
    );
}

/* Dual range (two sliders + numeric inputs) */
function DualRange({
                       label,
                       min = 0,
                       max = 100,
                       step = 1,
                       valueMin,
                       valueMax,
                       setValueMin,
                       setValueMax,
                       format = (v) => v,
                       unit = "",
                   }) {
    const onMin = (v) => setValueMin(Math.min(Number(v), valueMax));
    const onMax = (v) => setValueMax(Math.max(Number(v), valueMin));

    return (
        <div className="mt-4 md:mt-0">
            {label && (
                <h4 className="text-sm font-medium text-gray-700 mb-2">{label}</h4>
            )}

            <div className="px-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={valueMin}
                    onChange={(e) => onMin(e.target.value)}
                    className="w-full accent-emerald-600"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={valueMax}
                    onChange={(e) => onMax(e.target.value)}
                    className="w-full accent-emerald-600 -mt-2"
                />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Min</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={valueMax}
                        step={step}
                        value={valueMin}
                        onChange={(e) => onMin(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200 text-base min-h-[44px]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Max</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={valueMin}
                        max={max}
                        step={step}
                        value={valueMax}
                        onChange={(e) => onMax(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200 text-base min-h-[44px]"
                    />
                </div>
            </div>

            <div className="mt-1 text-xs text-gray-500">
                {format(valueMin)}
                {unit} – {format(valueMax)}
                {unit}
            </div>
        </div>
    );
}

/* Lock body scroll when mobile drawer is open */
function useLockBodyScroll(locked) {
    useEffect(() => {
        const el = document.documentElement;
        if (locked) el.classList.add("overflow-hidden");
        else el.classList.remove("overflow-hidden");
        return () => el.classList.remove("overflow-hidden");
    }, [locked]);
}

/* ---------- main ---------- */
export default function Properties({ properties = [], propertiesWithMap = [] }) {
    // base filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isPresell, setIsPresell] = useState(false);
    const [withPhotos, setWithPhotos] = useState(false);

    // ranges
    const [priceMin, setPriceMin] = useState(PRICE_MIN);
    const [priceMax, setPriceMax] = useState(PRICE_MAX);
    const [floorAreaMin, setFloorAreaMin] = useState(AREA_MIN);
    const [floorAreaMax, setFloorAreaMax] = useState(AREA_MAX);
    const [lotAreaMin, setLotAreaMin] = useState(AREA_MIN);
    const [lotAreaMax, setLotAreaMax] = useState(AREA_MAX);

    // house-only fields
    const [bedroomsMin, setBedroomsMin] = useState(0);
    const [bathroomsMin, setBathroomsMin] = useState(0);
    const [carSlotsMin, setCarSlotsMin] = useState(0);
    const [totalRoomsMin, setTotalRoomsMin] = useState(0);

    // view
    const [viewMode, setViewMode] = useState("grid");
    const [sortOrder, setSortOrder] = useState("default");
    const [showFilters, setShowFilters] = useState(false); // desktop auto
    const [showFiltersMobile, setShowFiltersMobile] = useState(false); // mobile drawer
    useLockBodyScroll(showFiltersMobile);

    // favorites + UX
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toast, setToast] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    // smart visibility
    const hasType = selectedTypes.length > 0;
    const isOnlyLand = hasType && selectedTypes.every((t) => t === "Land");
    const isOnlyHouse = hasType && selectedTypes.every((t) => t === "House");
    const includesLand = selectedTypes.includes("Land");
    const showFloorArea =
        (hasType && !isOnlyLand && !includesLand) || !hasType;
    const showLotArea =
        isOnlyLand ||
        !hasType ||
        (includesLand && selectedTypes.some((t) => t !== "Land"));

    // sync toast auto-hide
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(t);
    }, [toast]);

    // desktop filter visibility
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)");
        setShowFilters(mq.matches);
        const handler = (e) => setShowFilters(e.matches);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    /* Persist favorites (optional enhancement) */
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem("favorite-property-ids");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setFavoriteIds(parsed);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(
                "favorite-property-ids",
                JSON.stringify(favoriteIds)
            );
        } catch {
            // ignore
        }
    }, [favoriteIds]);

    /* -------- favorites (optimistic) -------- */
    const toggleFavorite = useCallback(
        (id) => {
            const willAdd = !favoriteIds.includes(id);
            setFavoriteIds((p) =>
                willAdd ? [...p, id] : p.filter((x) => x !== id)
            );
            router.post(
                `/properties/${id}/favorites`,
                { id },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        setToast({
                            type: "success",
                            msg: willAdd
                                ? "Added to favorites"
                                : "Removed from favorites",
                        }),
                    onError: () => {
                        setFavoriteIds((p) =>
                            willAdd
                                ? p.filter((x) => x !== id)
                                : [...p, id]
                        );
                        setToast({
                            type: "error",
                            msg: "Failed to update favorites",
                        });
                    },
                }
            );
        },
        [favoriteIds]
    );

    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedTypes([]);
        setIsPresell(false);
        setWithPhotos(false);
        setPriceMin(PRICE_MIN);
        setPriceMax(PRICE_MAX);
        setFloorAreaMin(AREA_MIN);
        setFloorAreaMax(AREA_MAX);
        setLotAreaMin(AREA_MIN);
        setLotAreaMax(AREA_MAX);
        setBedroomsMin(0);
        setBathroomsMin(0);
        setCarSlotsMin(0);
        setTotalRoomsMin(0);
    }, []);

    const handleTypeChange = (type, checked) => {
        setSelectedTypes((prev) =>
            checked ? [...prev, type] : prev.filter((t) => t !== type)
        );
    };

    /* -------- unified filter function (for list & map) -------- */
    const buildFilterFn = useCallback(
        () =>
            (arr) => {
                let out = Array.isArray(arr) ? [...arr] : [];

                // availability (if false → "For Sale", if true → "Pre-Selling")
                out = out.filter((p) =>
                    isPresell ? p?.isPresell : !p?.isPresell
                );

                // search
                const q = S(searchTerm).trim().toLowerCase();
                if (q) {
                    out = out.filter((p) => {
                        const title = S(p?.title).toLowerCase();
                        const addr = S(p?.address).toLowerCase();
                        const loc = S(p?.location).toLowerCase();
                        const desc = S(p?.description).toLowerCase();
                        return (
                            title.includes(q) ||
                            addr.includes(q) ||
                            loc.includes(q) ||
                            desc.includes(q)
                        );
                    });
                }

                // type
                if (selectedTypes.length > 0) {
                    out = out.filter((p) =>
                        includesSafe(selectedTypes, p?.property_type)
                    );
                }

                // photos
                if (withPhotos) {
                    out = out.filter(
                        (p) =>
                            A(p?.images).length > 0 ||
                            S(p?.image_url).length > 0
                    );
                }

                // price
                out = out.filter((p) => {
                    const price = Number(p?.price) || 0;
                    return price >= priceMin && price <= priceMax;
                });

                // land only
                if (isOnlyLand) {
                    out = out.filter((p) => {
                        const la = Number(p?.lot_area || 0);
                        const minOK =
                            lotAreaMin <= AREA_MIN ? true : la >= lotAreaMin;
                        const maxOK =
                            lotAreaMax >= AREA_MAX ? true : la <= lotAreaMax;
                        return minOK && maxOK;
                    });
                }

                // house only
                if (isOnlyHouse) {
                    if (bedroomsMin)
                        out = out.filter(
                            (p) => Number(p?.bedrooms || 0) >= bedroomsMin
                        );
                    if (bathroomsMin)
                        out = out.filter(
                            (p) => Number(p?.bathrooms || 0) >= bathroomsMin
                        );
                    if (carSlotsMin)
                        out = out.filter(
                            (p) => Number(p?.car_slots || 0) >= carSlotsMin
                        );
                    if (totalRoomsMin)
                        out = out.filter(
                            (p) => Number(p?.total_rooms || 0) >= totalRoomsMin
                        );

                    out = out.filter((p) => {
                        const fa = Number(p?.floor_area || 0);
                        const minOK =
                            floorAreaMin <= AREA_MIN
                                ? true
                                : fa >= floorAreaMin;
                        const maxOK =
                            floorAreaMax >= AREA_MAX
                                ? true
                                : fa <= floorAreaMax;
                        return minOK && maxOK;
                    });
                }

                // mixed / none
                if (!isOnlyLand && !isOnlyHouse) {
                    if (showFloorArea) {
                        out = out.filter((p) => {
                            const fa = Number(p?.floor_area || 0);
                            const minOK =
                                floorAreaMin <= AREA_MIN
                                    ? true
                                    : fa >= floorAreaMin;
                            const maxOK =
                                floorAreaMax >= AREA_MAX
                                    ? true
                                    : fa <= floorAreaMax;
                            return minOK && maxOK;
                        });
                    }
                    if (showLotArea) {
                        out = out.filter((p) => {
                            const la = Number(p?.lot_area || 0);
                            const minOK =
                                lotAreaMin <= AREA_MIN
                                    ? true
                                    : la >= lotAreaMin;
                            const maxOK =
                                lotAreaMax >= AREA_MAX
                                    ? true
                                    : la <= lotAreaMax;
                            return minOK && maxOK;
                        });
                    }
                }

                return out;
            },
        [
            isPresell,
            searchTerm,
            selectedTypes,
            withPhotos,
            priceMin,
            priceMax,
            bedroomsMin,
            bathroomsMin,
            carSlotsMin,
            totalRoomsMin,
            floorAreaMin,
            floorAreaMax,
            lotAreaMin,
            lotAreaMax,
            isOnlyLand,
            isOnlyHouse,
            showFloorArea,
            showLotArea,
        ]
    );

    const [filtered, setFiltered] = useState(properties);

    // debounced filtering
    useEffect(() => {
        const filterFn = buildFilterFn();
        setIsFiltering(true);

        const run = debounce(() => {
            setFiltered(filterFn(properties));
            setIsFiltering(false);
        }, 200);

        run();
        return () => {
            run.cancel();
            setIsFiltering(false);
        };
    }, [properties, buildFilterFn]);

    // sort is applied only once here (no double sorting)
    const sortedProperties = useMemo(() => {
        const base = Array.isArray(filtered) ? [...filtered] : [];
        switch (sortOrder) {
            case "low-to-high":
                return base.sort(
                    (a, b) => Number(a?.price || 0) - Number(b?.price || 0)
                );
            case "high-to-low":
                return base.sort(
                    (a, b) => Number(b?.price || 0) - Number(a?.price || 0)
                );
            case "newest":
                return base.sort(
                    (a, b) =>
                        new Date(b?.created_at || 0) -
                        new Date(a?.created_at || 0)
                );
            case "oldest":
                return base.sort(
                    (a, b) =>
                        new Date(a?.created_at || 0) -
                        new Date(b?.created_at || 0)
                );
            default:
                return base;
        }
    }, [filtered, sortOrder]);

    // map data uses same filter function (no duplicated logic)
    const filteredMapProps = useMemo(() => {
        const filterFn = buildFilterFn();
        return filterFn(propertiesWithMap);
    }, [buildFilterFn, propertiesWithMap]);

    // chips
    const chips = useMemo(() => {
        const c = [];
        if (searchTerm)
            c.push({
                label: `“${searchTerm}”`,
                clear: () => setSearchTerm(""),
            });
        if (selectedTypes.length)
            c.push({
                label: selectedTypes.join(" · "),
                clear: () => setSelectedTypes([]),
            });
        c.push({
            label: isPresell ? "Pre-Selling" : "For Sale",
            clear: () => setIsPresell((v) => !v),
        });
        if (withPhotos)
            c.push({
                label: "With photos",
                clear: () => setWithPhotos(false),
            });

        if (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX) {
            c.push({
                label: `Price ${peso(priceMin)} – ${peso(priceMax)}`,
                clear: () => {
                    setPriceMin(PRICE_MIN);
                    setPriceMax(PRICE_MAX);
                },
            });
        }

        if (isOnlyHouse) {
            if (bedroomsMin)
                c.push({
                    label: `Bedrooms ≥ ${bedroomsMin}`,
                    clear: () => setBedroomsMin(0),
                });
            if (bathroomsMin)
                c.push({
                    label: `Bathrooms ≥ ${bathroomsMin}`,
                    clear: () => setBathroomsMin(0),
                });
            if (carSlotsMin)
                c.push({
                    label: `Car Slots ≥ ${carSlotsMin}`,
                    clear: () => setCarSlotsMin(0),
                });
            if (totalRoomsMin)
                c.push({
                    label: `Total Rooms ≥ ${totalRoomsMin}`,
                    clear: () => setTotalRoomsMin(0),
                });
            if (floorAreaMin > AREA_MIN || floorAreaMax < AREA_MAX)
                c.push({
                    label: `Floor ${areaFormatter(
                        floorAreaMin
                    )} – ${areaFormatter(floorAreaMax)}`,
                    clear: () => {
                        setFloorAreaMin(AREA_MIN);
                        setFloorAreaMax(AREA_MAX);
                    },
                });
        } else if (isOnlyLand) {
            if (lotAreaMin > AREA_MIN || lotAreaMax < AREA_MAX)
                c.push({
                    label: `Lot ${areaFormatter(
                        lotAreaMin
                    )} – ${areaFormatter(lotAreaMax)}`,
                    clear: () => {
                        setLotAreaMin(AREA_MIN);
                        setLotAreaMax(AREA_MAX);
                    },
                });
        } else {
            if (showFloorArea && (floorAreaMin > AREA_MIN || floorAreaMax < AREA_MAX))
                c.push({
                    label: `Floor ${areaFormatter(
                        floorAreaMin
                    )} – ${areaFormatter(floorAreaMax)}`,
                    clear: () => {
                        setFloorAreaMin(AREA_MIN);
                        setFloorAreaMax(AREA_MAX);
                    },
                });
            if (showLotArea && (lotAreaMin > AREA_MIN || lotAreaMax < AREA_MAX))
                c.push({
                    label: `Lot ${areaFormatter(
                        lotAreaMin
                    )} – ${areaFormatter(lotAreaMax)}`,
                    clear: () => {
                        setLotAreaMin(AREA_MIN);
                        setLotAreaMax(AREA_MAX);
                    },
                });
        }

        return c;
    }, [
        searchTerm,
        selectedTypes,
        isPresell,
        withPhotos,
        priceMin,
        priceMax,
        bedroomsMin,
        bathroomsMin,
        carSlotsMin,
        totalRoomsMin,
        floorAreaMin,
        floorAreaMax,
        lotAreaMin,
        lotAreaMax,
        isOnlyHouse,
        isOnlyLand,
        showFloorArea,
        showLotArea,
    ]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Head title="Explore Properties" />
            {/*<NavBar />*/}

            {/* Toast */}
            {toast && (
                <div
                    className="fixed bottom-5 right-5 z-50"
                    aria-live="assertive"
                >
                    <div
                        className={`px-4 py-3 rounded-xl shadow-xl backdrop-blur-md ${
                            toast.type === "success"
                                ? "bg-emerald-600/90"
                                : "bg-red-600/90"
                        } text-white font-medium`}
                    >
                        {toast.msg}
                    </div>
                </div>
            )}

            <div className="px-4 py-8 lg:py-10 flex flex-col lg:flex-row gap-8 mx-auto ">
                {/* DESKTOP SIDEBAR */}
                {showFilters && (
                    <aside className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-3xl shadow-lg ring-1 ring-gray-100 space-y-7 sticky top-8 h-fit">
                        <FilterPanel
                            {...{
                                searchTerm,
                                setSearchTerm,
                                isPresell,
                                setIsPresell,
                                selectedTypes,
                                handleTypeChange,
                                withPhotos,
                                setWithPhotos,
                                priceMin,
                                priceMax,
                                setPriceMin,
                                setPriceMax,
                                floorAreaMin,
                                floorAreaMax,
                                setFloorAreaMin,
                                setFloorAreaMax,
                                lotAreaMin,
                                lotAreaMax,
                                setLotAreaMin,
                                setLotAreaMax,
                                bedroomsMin,
                                setBedroomsMin,
                                bathroomsMin,
                                setBathroomsMin,
                                carSlotsMin,
                                setCarSlotsMin,
                                totalRoomsMin,
                                setTotalRoomsMin,
                                resetFilters,
                                isOnlyHouse,
                                isOnlyLand,
                                showFloorArea,
                                showLotArea,
                            }}
                        />
                    </aside>
                )}

                {/* MOBILE FILTER BUTTON + DRAWER */}
                {!showFilters && (
                    <>
                        <div className="lg:hidden -mt-8 -mb-4">
                            <button
                                onClick={() => setShowFiltersMobile(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow-sm text-sm font-medium"
                            >
                                <FilterIcon className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {showFiltersMobile && (
                            <div className="fixed inset-0 z-50">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/50"
                                    onClick={() => setShowFiltersMobile(false)}
                                />

                                {/* Panel */}
                                <div
                                    className="
                                        absolute right-0 top-0 h-dvh w-[92vw] max-w-sm bg-white shadow-2xl
                                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
                                        flex flex-col
                                      "
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Filter properties"
                                >
                                    {/* Sticky Header */}
                                    <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Filter Options
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowFiltersMobile(false)
                                            }
                                            className="p-2 rounded-full hover:bg-gray-100"
                                            aria-label="Close filters"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto px-5 pb-6">
                                        <FilterPanel
                                            {...{
                                                searchTerm,
                                                setSearchTerm,
                                                isPresell,
                                                setIsPresell,
                                                selectedTypes,
                                                handleTypeChange,
                                                withPhotos,
                                                setWithPhotos,
                                                priceMin,
                                                priceMax,
                                                setPriceMin,
                                                setPriceMax,
                                                floorAreaMin,
                                                floorAreaMax,
                                                setFloorAreaMin,
                                                setFloorAreaMax,
                                                lotAreaMin,
                                                lotAreaMax,
                                                setLotAreaMin,
                                                setLotAreaMax,
                                                bedroomsMin,
                                                setBedroomsMin,
                                                bathroomsMin,
                                                setBathroomsMin,
                                                carSlotsMin,
                                                setCarSlotsMin,
                                                totalRoomsMin,
                                                setTotalRoomsMin,
                                                resetFilters,
                                                isOnlyHouse,
                                                isOnlyLand,
                                                showFloorArea,
                                                showLotArea,
                                            }}
                                        />
                                    </div>

                                    {/* Sticky Footer */}
                                    <div className="px-5 py-4 border-t bg-white sticky bottom-0 flex gap-3">
                                        <button
                                            onClick={() => {
                                                resetFilters();
                                                setShowFiltersMobile(false);
                                            }}
                                            className="px-4 py-3 rounded-xl border text-gray-700 hover:bg-gray-50 font-medium flex-1"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowFiltersMobile(false);
                                            }}
                                            className="px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold flex-1"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MAIN RESULTS AREA */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow-sm text-sm font-medium transition"
                                title="Toggle filters"
                                aria-pressed={showFilters}
                            >
                                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </button>
                            <span className="text-xl font-semibold text-gray-800">
                                {sortedProperties.length} Properties
                            </span>
                            {propertiesWithMap?.length > 0 && (
                                <span className="hidden md:inline text-xs text-gray-500">
                                    Showing {filteredMapProps.length} on map
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sort Dropdown */}
                            <label className="sr-only" htmlFor="sort-order">
                                Sort properties
                            </label>
                            <select
                                id="sort-order"
                                value={sortOrder}
                                onChange={(e) =>
                                    setSortOrder(e.target.value)
                                }
                                className="py-2.5 px-4 rounded-xl border-gray-300 bg-white text-sm focus:ring-emerald-500 shadow-sm text-base min-h-[44px]"
                            >
                                <option value="default">
                                    Sort By: Default
                                </option>
                                <option value="low-to-high">
                                    Price: Low to High
                                </option>
                                <option value="high-to-low">
                                    Price: High to Low
                                </option>
                                <option value="newest">Newest Listings</option>
                                <option value="oldest">Oldest Listings</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-2 text-sm inline-flex items-center justify-center transition min-h-[44px] ${
                                        viewMode === "grid"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-white hover:bg-gray-50 text-gray-600"
                                    }`}
                                    aria-label="Grid view"
                                    aria-pressed={viewMode === "grid"}
                                >
                                    <GridIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-2 text-sm inline-flex items-center justify-center border-l transition min-h-[44px] ${
                                        viewMode === "list"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-white hover:bg-gray-50 text-gray-600"
                                    }`}
                                    aria-label="List view"
                                    aria-pressed={viewMode === "list"}
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/*/!* Map (optional – if you want it visible on this page) *!/*/}
                    {/*{filteredMapProps.length > 0 && (*/}
                    {/*    <div className="mb-6 rounded-2xl overflow-hidden ring-1 ring-gray-100 bg-white shadow-sm">*/}
                    {/*        <DisplayMap properties={filteredMapProps} />*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Active chips – horizontal scroll on mobile */}
                    {chips.length > 0 && (
                        <div className="mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                {chips.map((chip, idx) => (
                                    <button
                                        key={`${chip.label}-${idx}`}
                                        onClick={chip.clear}
                                        className="inline-flex items-center gap-1.5 bg-white text-gray-700 ring-1 ring-gray-200 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-gray-50 transition"
                                    >
                                        {chip.label}
                                        <X className="w-3 h-3 text-gray-500" />
                                    </button>
                                ))}
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
                                    title="Clear all filters"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    <div className="flex-1">
                        {isFiltering ? (
                            // Skeleton
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={`sk-${i}`}
                                        className="rounded-2xl ring-1 ring-gray-100 bg-white p-4 animate-pulse space-y-3 shadow-sm"
                                    >
                                        <div className="h-48 w-full bg-gray-100 rounded-xl" />
                                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                                        <div className="h-6 bg-gray-100 rounded w-1/4 mt-4" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProperties.length === 0 ? (
                            // No results
                            <div className="py-20 text-center rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm mx-auto my-10 max-w-xl">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                                    <FilterIcon className="w-6 h-6" />
                                </div>
                                <p className="text-xl font-semibold text-gray-800 mb-2">
                                    No matching properties found
                                </p>
                                <p className="text-gray-500 mb-4">
                                    Try adjusting your filters, or clear them
                                    all to see every listing.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedProperties.map((p) => {
                                    const isFav = favoriteIds.includes(p?.id);
                                    return (
                                        <PropertyCard
                                            key={p?.id}
                                            property={p}
                                            isFavorite={isFav}
                                            onToggleFavorite={() =>
                                                toggleFavorite(p?.id)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {sortedProperties.map((p) => {
                                    const isFav = favoriteIds.includes(p?.id);
                                    return (
                                        <div
                                            key={p?.id}
                                            className="relative bg-white rounded-xl shadow-md ring-1 ring-gray-100 hover:shadow-lg transition"
                                        >
                                            <PropertyListCard
                                                property={p}
                                                isFavorite={isFav}
                                                onToggleFavorite={() =>
                                                    toggleFavorite(p?.id)
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ---------- Filter Panel (shared by desktop + mobile) ---------- */
function FilterPanel(props) {
    const {
        searchTerm,
        setSearchTerm,
        isPresell,
        setIsPresell,
        selectedTypes,
        handleTypeChange,
        withPhotos,
        setWithPhotos,
        priceMin,
        priceMax,
        setPriceMin,
        setPriceMax,
        floorAreaMin,
        floorAreaMax,
        setFloorAreaMin,
        setFloorAreaMax,
        lotAreaMin,
        lotAreaMax,
        setLotAreaMin,
        setLotAreaMax,
        bedroomsMin,
        setBedroomsMin,
        bathroomsMin,
        setBathroomsMin,
        carSlotsMin,
        setCarSlotsMin,
        totalRoomsMin,
        setTotalRoomsMin,
        resetFilters,
        isOnlyHouse,
        isOnlyLand,
        showFloorArea,
        showLotArea,
    } = props;

    return (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                    className="text-sm text-emerald-700 hover:text-emerald-900"
                    onClick={resetFilters}
                >
                    Reset
                </button>
            </div>

            {/* Search */}
            <div>
                <label
                    className="block mt-4 md:mt-0 text-sm font-medium text-gray-700 mb-2"
                    htmlFor="property-search"
                >
                    Search
                </label>
                <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            className="fill-gray-400"
                            aria-hidden="true"
                        >
                            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-1.4 1.4l.28.27v.79l5 5 1.5-1.5-5-5zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                        </svg>
                    </span>
                    <input
                        id="property-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-base min-h-[44px]"
                        placeholder="Title, address, or location"
                    />
                </div>
            </div>

            {/* Availability */}
            <div>
                <label className="block mt-4 md:mt-0 text-sm font-medium text-gray-700 mb-2">
                    Availability
                </label>
                <div className="grid grid-cols-2 rounded-lg border border-gray-300 overflow-hidden">
                    <button
                        className={`py-2 text-sm transition min-h-[44px] ${
                            !isPresell
                                ? "bg-emerald-600 text-white"
                                : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setIsPresell(false)}
                    >
                        For Sale
                    </button>
                    <button
                        className={`py-2 text-sm transition min-h-[44px] ${
                            isPresell
                                ? "bg-emerald-600 text-white"
                                : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setIsPresell(true)}
                    >
                        Pre-Selling
                    </button>
                </div>
            </div>

            {/* Types */}
            <div>
                <h4 className="text-sm mt-4 md:mt-0 font-medium text-gray-700 mb-2">
                    Property Type
                </h4>
                <div className="space-y-2">
                    {ALL_TYPES.map((t) => (
                        <CheckboxFilter
                            key={t}
                            label={t}
                            value={t}
                            checked={includesSafe(selectedTypes, t)}
                            onChange={handleTypeChange}
                        />
                    ))}
                </div>
            </div>

            {/* Photos only */}
            <Checkbox
                id="withPhotos"
                label="Show only listings with photos"
                checked={withPhotos}
                onChange={setWithPhotos}
            />

            {/* Price */}
            <DualRange
                label="Price Range (₱)"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={50_000}
                valueMin={priceMin}
                valueMax={priceMax}
                setValueMin={setPriceMin}
                setValueMax={setPriceMax}
                format={(v) =>
                    new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        maximumFractionDigits: 0,
                    }).format(v)
                }
            />

            {/* HOUSE-ONLY */}
            {isOnlyHouse && (
                <div className="space-y-4">
                    <DualRange
                        label="Floor Area (m²)"
                        min={AREA_MIN}
                        max={AREA_MAX}
                        step={10}
                        valueMin={floorAreaMin}
                        valueMax={floorAreaMax}
                        setValueMin={setFloorAreaMin}
                        setValueMax={setFloorAreaMax}
                        format={(v) => v}
                        unit=" m²"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Numeric
                            label="Bedrooms (min)"
                            value={bedroomsMin}
                            onChange={setBedroomsMin}
                        />
                        <Numeric
                            label="Bathrooms (min)"
                            value={bathroomsMin}
                            onChange={setBathroomsMin}
                        />
                        <Numeric
                            label="Car Slots (min)"
                            value={carSlotsMin}
                            onChange={setCarSlotsMin}
                        />
                        <Numeric
                            label="Total Rooms (min)"
                            value={totalRoomsMin}
                            onChange={setTotalRoomsMin}
                        />
                    </div>
                </div>
            )}

            {/* LAND-ONLY */}
            {isOnlyLand && (
                <DualRange
                    label="Lot Area (m²)"
                    min={AREA_MIN}
                    max={AREA_MAX}
                    step={10}
                    valueMin={lotAreaMin}
                    valueMax={lotAreaMax}
                    setValueMin={setLotAreaMin}
                    setValueMax={setLotAreaMax}
                    format={(v) => v}
                    unit=" m²"
                />
            )}

            {/* Mixed / Unselected */}
            {!isOnlyLand && !isOnlyHouse && (
                <div className="space-y-4">
                    {showFloorArea && (
                        <DualRange
                            label="Floor Area (m²)"
                            min={AREA_MIN}
                            max={AREA_MAX}
                            step={10}
                            valueMin={floorAreaMin}
                            valueMax={floorAreaMax}
                            setValueMin={setFloorAreaMin}
                            setValueMax={setFloorAreaMax}
                            format={(v) => v}
                            unit=" m²"
                        />
                    )}
                    {showLotArea && (
                        <DualRange
                            label="Lot Area (m²)"
                            min={AREA_MIN}
                            max={AREA_MAX}
                            step={10}
                            valueMin={lotAreaMin}
                            valueMax={lotAreaMax}
                            setValueMin={setLotAreaMin}
                            setValueMax={setLotAreaMax}
                            format={(v) => v}
                            unit=" m²"
                        />
                    )}
                </div>
            )}
        </>
    );
}

function Numeric({ label, value, onChange }) {
    return (
        <div>
            <label className="text-sm text-gray-700">{label}</label>
            <input
                type="number"
                inputMode="numeric"
                min="0"
                value={value}
                onChange={(e) => onChange(Number(e.target.value || 0))}
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200 text-base min-h-[44px]"
            />
        </div>
    );
}
