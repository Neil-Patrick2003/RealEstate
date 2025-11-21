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
    Search,
    MapPin,
    Home,
    Building2,
    Ruler,
    Star,
    TrendingUp,
    Shield,
    Heart,
    Play,
    CheckCircle,
    Headphones,
    Award,
    ChevronDown,
    Sparkles
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

function CheckboxFilter({ label, value, checked, onChange, icon: Icon }) {
    return (
        <label className="group flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
            <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary-600 rounded-lg border-2"
                checked={checked}
                onChange={(e) => onChange(value, e.target.checked)}
            />
            {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
            <span className="text-sm font-medium flex-1">{label}</span>
        </label>
    );
}

function Checkbox({ id, label, checked, onChange }) {
    return (
        <label
            htmlFor={id}
            className="group flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        >
            <input
                id={id}
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary-600 rounded-lg border-2"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="text-sm font-medium">{label}</span>
        </label>
    );
}

/* Enhanced Dual Range with better mobile UX */
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
        <div className="form-group space-y-4">
            {label && (
                <label className="form-label text-base font-semibold">{label}</label>
            )}

            <div className="px-2 space-y-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={valueMin}
                    onChange={(e) => onMin(e.target.value)}
                    className="w-full h-2 accent-primary-600 cursor-pointer"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={valueMax}
                    onChange={(e) => onMax(e.target.value)}
                    className="w-full h-2 accent-primary-600 cursor-pointer -mt-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                    <label className="form-label text-xs font-medium text-gray-600 dark:text-gray-400">Min</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={valueMax}
                        step={step}
                        value={valueMin}
                        onChange={(e) => onMin(e.target.value)}
                        className="form-input text-sm py-2 px-3 border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label text-xs font-medium text-gray-600 dark:text-gray-400">Max</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={valueMin}
                        max={max}
                        step={step}
                        value={valueMax}
                        onChange={(e) => onMax(e.target.value)}
                        className="form-input text-sm py-2 px-3 border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                </div>
            </div>

            <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 py-2 px-3 rounded-lg text-center">
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
        if (locked) {
            el.classList.add("overflow-hidden");
            document.body.classList.add("overflow-hidden");
        } else {
            el.classList.remove("overflow-hidden");
            document.body.classList.remove("overflow-hidden");
        }
        return () => {
            el.classList.remove("overflow-hidden");
            document.body.classList.remove("overflow-hidden");
        };
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
    const [showFilters, setShowFilters] = useState(false);
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    useLockBodyScroll(showFiltersMobile);

    // favorites + UX
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toast, setToast] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    // Mobile state
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    // Property type icons mapping
    const typeIcons = {
        "House": Home,
        "Condominium": Building2,
        "Apartment": Building2,
        "Commercial": Building2,
        "Land": Ruler
    };

    // sync toast auto-hide
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
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

    /* Persist favorites */
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

    /* -------- unified filter function -------- */
    const buildFilterFn = useCallback(
        () =>
            (arr) => {
                let out = Array.isArray(arr) ? [...arr] : [];

                // availability
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
        }, 300);

        run();
        return () => {
            run.cancel();
            setIsFiltering(false);
        };
    }, [properties, buildFilterFn]);

    // sort is applied only once here
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

    // map data uses same filter function
    const filteredMapProps = useMemo(() => {
        const filterFn = buildFilterFn();
        return filterFn(propertiesWithMap);
    }, [buildFilterFn, propertiesWithMap]);

    // chips
    const chips = useMemo(() => {
        const c = [];
        if (searchTerm)
            c.push({
                label: `"${searchTerm}"`,
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="Explore Properties" />

            {/* Toast */}
            {toast && (
                <div
                    className="fixed bottom-5 right-5 z-50 max-w-sm w-full"
                    aria-live="assertive"
                >
                    <div
                        className={`alert ${
                            toast.type === "success" ? "alert-success" : "alert-error"
                        } shadow-lg transform transition-all duration-300 animate-in slide-in-from-right-full`}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <X className="w-5 h-5" />
                            )}
                            <span className="flex-1">{toast.msg}</span>
                        </div>
                    </div>
                </div>
            )}
            <NavBar/>

            {/* ENHANCED HEADER SECTION */}
            <div className="pt-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary-300 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-primary-200 rounded-full blur-lg"></div>
                </div>

                <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Quick Search Bar - Enhanced for Mobile */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                                <input
                                    type="text"
                                    id="property-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    placeholder="Search by title, address, or location..."
                                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-24 py-4 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 text-base"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                    <button
                                        onClick={() => setShowFiltersMobile(true)}
                                        className="lg:hidden bg-white/20 hover:bg-white/30 border border-white/30 text-white p-2 rounded-xl font-semibold transition-colors duration-300"
                                    >
                                        <FilterIcon className="w-4 h-4" />
                                    </button>
                                    <button className="bg-white text-primary-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 text-sm">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Quick Stats */}
                        <div className="lg:hidden mt-6">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-white">{properties.length}+</div>
                                        <div className="text-xs text-primary-200">Properties</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white">
                                            {properties.filter(p => !p.isPresell).length}+
                                        </div>
                                        <div className="text-xs text-primary-200">For Sale</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white">
                                            {properties.filter(p => p.isPresell).length}+
                                        </div>
                                        <div className="text-xs text-primary-200">Pre-Selling</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* DESKTOP SIDEBAR */}
                    {showFilters && (
                        <aside className="card sticky top-6 h-fit w-80 shrink-0 shadow-xl border-0 rounded-2xl overflow-hidden">
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
                                    typeIcons,
                                }}
                            />
                        </aside>
                    )}

                    {/* MOBILE FILTER BUTTON + DRAWER */}
                    {!showFilters && (
                        <>
                            <div className="lg:hidden flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => setShowFiltersMobile(true)}
                                    className="btn btn-primary inline-flex items-center gap-2 flex-1 justify-center py-3 rounded-xl"
                                >
                                    <FilterIcon className="w-4 h-4" />
                                    Filters & Sort
                                    {chips.length > 0 && (
                                        <span className="badge badge-white text-primary-600 text-xs">
                                            {chips.length}
                                        </span>
                                    )}
                                </button>

                                {/* Mobile View Toggle */}
                                <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-3 ${
                                            viewMode === "grid"
                                                ? "bg-primary-600 text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        <GridIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-3 border-l border-gray-300 dark:border-gray-600 ${
                                            viewMode === "list"
                                                ? "bg-primary-600 text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {showFiltersMobile && (
                                <div className="fixed inset-0 z-50 lg:hidden">
                                    {/* Backdrop */}
                                    <div
                                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                        onClick={() => setShowFiltersMobile(false)}
                                    />

                                    {/* Panel */}
                                    <div
                                        className="
                                        absolute right-0 top-0 h-dvh w-[90vw] max-w-md bg-white dark:bg-gray-800 shadow-2xl
                                        flex flex-col
                                        animate-in slide-in-from-right-full duration-300
                                      "
                                        role="dialog"
                                        aria-modal="true"
                                        aria-label="Filter properties"
                                    >
                                        {/* Sticky Header */}
                                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters & Sort</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Refine your property search
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowFiltersMobile(false)}
                                                className="btn btn-ghost p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                aria-label="Close filters"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-6">
                                            <div className="space-y-6">
                                                {/* Sort Section */}
                                                <div className="form-group">
                                                    <label className="form-label text-lg font-semibold">Sort By</label>
                                                    <select
                                                        value={sortOrder}
                                                        onChange={(e) => setSortOrder(e.target.value)}
                                                        className="form-select py-3 text-base border-2 rounded-xl"
                                                    >
                                                        <option value="default">Recommended</option>
                                                        <option value="newest">Newest Listings</option>
                                                        <option value="low-to-high">Price: Low to High</option>
                                                        <option value="high-to-low">Price: High to Low</option>
                                                        <option value="oldest">Oldest Listings</option>
                                                    </select>
                                                </div>

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
                                                        typeIcons,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Sticky Footer */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 space-y-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        resetFilters();
                                                    }}
                                                    className="btn btn-outline flex-1 py-3 rounded-xl border-2"
                                                >
                                                    Reset All
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowFiltersMobile(false);
                                                    }}
                                                    className="btn btn-primary flex-1 py-3 rounded-xl"
                                                >
                                                    Apply Filters
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* MAIN RESULTS AREA */}
                    <main className="flex-1 flex flex-col">
                        {/* Top bar - Enhanced for Mobile */}
                        <div className="section-header mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="hidden lg:inline-flex btn btn-outline items-center gap-2 py-2 px-4 rounded-xl border-2"
                                        title="Toggle filters"
                                        aria-pressed={showFilters}
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                        {chips.length > 0 && (
                                            <span className="badge badge-primary text-xs">
                                                {chips.length}
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="section-description text-sm sm:text-base">
                                            Found {sortedProperties.length} properties matching your criteria
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-3">
                                    {/* Sort Dropdown - Hidden on mobile since it's in filter drawer */}
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="hidden lg:block form-select py-2 rounded-xl border-2 min-w-[180px]"
                                    >
                                        <option value="default">Sort By:</option>
                                        <option value="newest">Newest Listings</option>
                                        <option value="low-to-high">Price: Low to High</option>
                                        <option value="high-to-low">Price: High to Low</option>
                                        <option value="oldest">Oldest Listings</option>
                                    </select>

                                    {/* View Mode Toggle - Hidden on mobile since it's in header */}
                                    <div className="hidden lg:flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`btn btn-ghost rounded-none p-3 ${
                                                viewMode === "grid"
                                                    ? "bg-primary-600 text-white"
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                        >
                                            <GridIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`btn btn-ghost rounded-none border-l border-gray-300 dark:border-gray-600 p-3 ${
                                                viewMode === "list"
                                                    ? "bg-primary-600 text-white"
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                        >
                                            <ListIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active chips - Enhanced for Mobile */}
                        {chips.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                                        Active filters:
                                    </span>
                                    {chips.map((chip, idx) => (
                                        <button
                                            key={`${chip.label}-${idx}`}
                                            onClick={chip.clear}
                                            className="badge badge-primary inline-flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-600 hover:text-white transition-all duration-200 group"
                                        >
                                            <span className="max-w-[120px] truncate">{chip.label}</span>
                                            <X className="w-3 h-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        </button>
                                    ))}
                                    <button
                                        onClick={resetFilters}
                                        className="badge badge-gray inline-flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        title="Clear all filters"
                                    >
                                        Clear all
                                        <Sparkles className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Results Area */}
                        <div className="flex-1">
                            {isFiltering ? (
                                // Enhanced Skeleton
                                <div className={viewMode === "grid" ? "grid-properties" : "space-y-4"}>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={`sk-${i}`}
                                            className={`card p-4 animate-pulse space-y-3 ${
                                                viewMode === "list" ? "flex flex-col sm:flex-row gap-4" : ""
                                            }`}
                                        >
                                            <div className={`skeleton ${viewMode === "list" ? "sm:w-48 h-48" : "h-48"} w-full rounded-xl`} />
                                            <div className="space-y-2 flex-1">
                                                <div className="skeleton-text w-3/4" />
                                                <div className="skeleton-text w-1/2" />
                                                <div className="skeleton-text w-5/6" />
                                                <div className="skeleton-text w-1/4 mt-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : sortedProperties.length === 0 ? (
                                // Enhanced No Results
                                <div className="card text-center py-16 sm:py-20 rounded-2xl border-0 shadow-lg">
                                    <div className="feature-icon bg-primary-50 text-primary-600 mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center">
                                        <FilterIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">
                                        No properties found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-base">
                                        Try adjusting your search criteria or filters to find more properties.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={resetFilters}
                                            className="btn btn-primary py-3 px-6 rounded-xl font-semibold"
                                        >
                                            Clear All Filters
                                        </button>
                                        <button
                                            onClick={() => setShowFiltersMobile(true)}
                                            className="btn btn-outline py-3 px-6 rounded-xl font-semibold border-2"
                                        >
                                            Adjust Search
                                        </button>
                                    </div>
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid-properties">
                                    {sortedProperties.map((p) => {
                                        const isFav = favoriteIds.includes(p?.id);
                                        return (
                                            <PropertyCard
                                                key={p?.id}
                                                property={p}
                                                isFavorite={isFav}
                                                onToggleFavorite={() => toggleFavorite(p?.id)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sortedProperties.map((p) => {
                                        const isFav = favoriteIds.includes(p?.id);
                                        return (
                                            <div
                                                key={p?.id}
                                                className="card-hover rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                                            >
                                                <PropertyListCard
                                                    property={p}
                                                    isFavorite={isFav}
                                                    onToggleFavorite={() => toggleFavorite(p?.id)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Load More / Pagination for future implementation */}
                        {sortedProperties.length > 0 && !isFiltering && (
                            <div className="mt-8 text-center">
                                <button className="btn btn-outline border-2 py-3 px-8 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                                    Load More Properties
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

/* ---------- Enhanced Filter Panel ---------- */
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
        typeIcons,
    } = props;

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-6">
                {/* Availability */}
                <div className="form-group">
                    <label className="form-label text-lg font-semibold">Availability</label>
                    <div className="grid grid-cols-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700/50 p-1">
                        <button
                            className={`btn rounded-lg py-3 font-semibold transition-all duration-200 ${
                                !isPresell
                                    ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm border-2 border-primary-200 dark:border-primary-600"
                                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            }`}
                            onClick={() => setIsPresell(false)}
                        >
                            For Sale
                        </button>
                        <button
                            className={`btn rounded-lg py-3 font-semibold transition-all duration-200 ${
                                isPresell
                                    ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm border-2 border-primary-200 dark:border-primary-600"
                                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            }`}
                            onClick={() => setIsPresell(true)}
                        >
                            Pre-Selling
                        </button>
                    </div>
                </div>

                {/* Types */}
                <div className="form-group">
                    <label className="form-label text-lg font-semibold">Property Type</label>
                    <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        {ALL_TYPES.map((t) => (
                            <CheckboxFilter
                                key={t}
                                label={t}
                                value={t}
                                icon={typeIcons[t]}
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
            </div>

            <div className="space-y-6">
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Details</h4>

                    {/* Price */}
                    <DualRange
                        label="Price Range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={50_000}
                        valueMin={priceMin}
                        valueMax={priceMax}
                        setValueMin={setPriceMin}
                        setValueMax={setPriceMax}
                        format={(v) => peso(v)}
                    />

                    {/* HOUSE-ONLY */}
                    {isOnlyHouse && (
                        <div className="space-y-6">
                            <DualRange
                                label="Floor Area"
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
                            <div className="grid grid-cols-2 gap-4">
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
                            label="Lot Area"
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
                        <div className="space-y-6">
                            {showFloorArea && (
                                <DualRange
                                    label="Floor Area"
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
                                    label="Lot Area"
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
                </div>
            </div>
        </div>
    );
}

function Numeric({ label, value, onChange }) {
    return (
        <div className="form-group">
            <label className="form-label text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                type="number"
                inputMode="numeric"
                min="0"
                value={value}
                onChange={(e) => onChange(Number(e.target.value || 0))}
                className="form-input text-sm py-2 px-3 border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
        </div>
    );
}
