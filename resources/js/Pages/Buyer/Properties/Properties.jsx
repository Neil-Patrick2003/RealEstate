import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { router } from "@inertiajs/react";
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
    Heart,
} from "lucide-react";

/* ---------- helpers ---------- */
const A = (v) => (Array.isArray(v) ? v : []);
const S = (v) => (typeof v === "string" ? v : "");
const includesSafe = (src, needle) =>
    Array.isArray(src) ? src.includes(needle) : typeof src === "string" ? src.includes(String(needle)) : false;

const ALL_TYPES = ["House", "Condominium", "Apartment", "Commercial", "Land"];
const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000;
const AREA_MIN = 0;
const AREA_MAX = 2_000;

/* ---------- small UI bits ---------- */
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

function Checkbox({ id, label, checked, onChange }) {
    return (
        <label htmlFor={id} className="group flex items-center gap-3 text-gray-700 cursor-pointer">
            <input
                id={id}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
        <div>
            {label && <h4 className="text-sm font-medium text-gray-700 mb-2">{label}</h4>}
            <div className="px-1">
                <input type="range" min={min} max={max} step={step} value={valueMin} onChange={(e) => onMin(e.target.value)} className="w-full accent-emerald-600" />
                <input type="range" min={min} max={max} step={step} value={valueMax} onChange={(e) => onMax(e.target.value)} className="w-full accent-emerald-600 -mt-2" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Min</span>
                    <input type="number" min={min} max={valueMax} step={step} value={valueMin} onChange={(e) => onMin(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Max</span>
                    <input type="number" min={valueMin} max={max} step={step} value={valueMax} onChange={(e) => onMax(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200" />
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

    // favorites + UX
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toast, setToast] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    // theme helpers
    const peso = (n) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);
    const area = (n) => `${n} m²`;

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)");
        setShowFilters(mq.matches);
        const handler = (e) => setShowFilters(e.matches);
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    /* -------- favorites (optimistic) -------- */
    const toggleFavorite = (id) => {
        const willAdd = !favoriteIds.includes(id);
        setFavoriteIds((p) => (willAdd ? [...p, id] : p.filter((x) => x !== id)));
        router.post(
            `/properties/${id}/favorites`,
            { id },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setToast({ type: "success", msg: willAdd ? "Added to favorites" : "Removed from favorites" }),
                onError: () => {
                    setFavoriteIds((p) => (willAdd ? p.filter((x) => x !== id) : [...p, id]));
                    setToast({ type: "error", msg: "Failed to update favorites" });
                },
            }
        );
    };

    const resetFilters = () => {
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
    };

    const handleTypeChange = (type, checked) => {
        setSelectedTypes((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
    };

    // smart visibility
    const hasType = selectedTypes.length > 0;
    const isOnlyLand = hasType && selectedTypes.every((t) => t === "Land");
    const isOnlyHouse = hasType && selectedTypes.every((t) => t === "House");
    const includesLand = selectedTypes.includes("Land");
    const showFloorArea = (hasType && !isOnlyLand && !includesLand) || !hasType;
    const showLotArea = isOnlyLand || !hasType || (includesLand && selectedTypes.some((t) => t !== "Land"));

    const [filtered, setFiltered] = useState(properties);

    useEffect(() => {
        setIsFiltering(true);
        const apply = () => {
            let arr = Array.isArray(properties) ? [...properties] : [];

            // presell
            arr = arr.filter((p) => (isPresell ? p?.isPresell : !p?.isPresell));

            // search
            const q = S(searchTerm).trim().toLowerCase();
            if (q) {
                arr = arr.filter((p) => {
                    const title = S(p?.title).toLowerCase();
                    const addr = S(p?.address).toLowerCase();
                    const loc = S(p?.location).toLowerCase();
                    const desc = S(p?.description).toLowerCase();
                    return title.includes(q) || addr.includes(q) || loc.includes(q) || desc.includes(q);
                });
            }

            // type
            if (selectedTypes.length > 0) {
                arr = arr.filter((p) => includesSafe(selectedTypes, p?.property_type));
            }

            // photos
            if (withPhotos) {
                arr = arr.filter((p) => A(p?.images).length > 0 || S(p?.image_url).length > 0);
            }

            // price
            arr = arr.filter((p) => {
                const price = Number(p?.price) || 0;
                return price >= priceMin && price <= priceMax;
            });

            // Land only → Lot area
            if (isOnlyLand) {
                arr = arr.filter((p) => {
                    const la = Number(p?.lot_area || 0);
                    const minOK = lotAreaMin <= AREA_MIN ? true : la >= lotAreaMin;
                    const maxOK = lotAreaMax >= AREA_MAX ? true : la <= lotAreaMax;
                    return minOK && maxOK;
                });
            }

            // House only → beds/baths/car/total + floor area
            if (isOnlyHouse) {
                if (bedroomsMin) arr = arr.filter((p) => Number(p?.bedrooms || 0) >= bedroomsMin);
                if (bathroomsMin) arr = arr.filter((p) => Number(p?.bathrooms || 0) >= bathroomsMin);
                if (carSlotsMin) arr = arr.filter((p) => Number(p?.car_slots || 0) >= carSlotsMin);
                if (totalRoomsMin) arr = arr.filter((p) => Number(p?.total_rooms || 0) >= totalRoomsMin);
                arr = arr.filter((p) => {
                    const fa = Number(p?.floor_area || 0);
                    const minOK = floorAreaMin <= AREA_MIN ? true : fa >= floorAreaMin;
                    const maxOK = floorAreaMax >= AREA_MAX ? true : fa <= floorAreaMax;
                    return minOK && maxOK;
                });
            }

            // Mixed / none
            if (!isOnlyLand && !isOnlyHouse) {
                if (showFloorArea) {
                    arr = arr.filter((p) => {
                        const fa = Number(p?.floor_area || 0);
                        const minOK = floorAreaMin <= AREA_MIN ? true : fa >= floorAreaMin;
                        const maxOK = floorAreaMax >= AREA_MAX ? true : fa <= floorAreaMax;
                        return minOK && maxOK;
                    });
                }
                if (showLotArea) {
                    arr = arr.filter((p) => {
                        const la = Number(p?.lot_area || 0);
                        const minOK = lotAreaMin <= AREA_MIN ? true : la >= lotAreaMin;
                        const maxOK = lotAreaMax >= AREA_MAX ? true : la <= lotAreaMax;
                        return minOK && maxOK;
                    });
                }
            }

            // sort
            arr.sort((a, b) => {
                if (sortOrder === "low-to-high") return (Number(a?.price) || 0) - (Number(b?.price) || 0);
                if (sortOrder === "high-to-low") return (Number(b?.price) || 0) - (Number(a?.price) || 0);
                if (sortOrder === "newest") return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
                if (sortOrder === "oldest") return new Date(a?.created_at || 0) - new Date(b?.created_at || 0);
                return 0;
            });

            setFiltered(arr);
            setIsFiltering(false);
        };

        const deb = debounce(apply, 200);
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
        sortOrder,
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

    const filteredMapProps = useMemo(() => {
        let arr = Array.isArray(propertiesWithMap) ? [...propertiesWithMap] : [];

        arr = arr.filter((p) => (isPresell ? p?.isPresell : !p?.isPresell));

        const q = S(searchTerm).trim().toLowerCase();
        if (q) {
            arr = arr.filter((p) => {
                const title = S(p?.title).toLowerCase();
                const addr = S(p?.address).toLowerCase();
                const loc = S(p?.location).toLowerCase();
                const desc = S(p?.description).toLowerCase();
                return title.includes(q) || addr.includes(q) || loc.includes(q) || desc.includes(q);
            });
        }

        if (selectedTypes.length > 0) {
            arr = arr.filter((p) => includesSafe(selectedTypes, p?.property_type));
        }

        if (withPhotos) {
            arr = arr.filter((p) => A(p?.images).length > 0 || S(p?.image_url).length > 0);
        }

        arr = arr.filter((p) => {
            const price = Number(p?.price) || 0;
            return price >= priceMin && price <= priceMax;
        });

        if (isOnlyLand) {
            arr = arr.filter((p) => {
                const la = Number(p?.lot_area || 0);
                const minOK = lotAreaMin <= AREA_MIN ? true : la >= lotAreaMin;
                const maxOK = lotAreaMax >= AREA_MAX ? true : la <= lotAreaMax;
                return minOK && maxOK;
            });
        } else if (isOnlyHouse) {
            arr = arr.filter((p) => {
                const fa = Number(p?.floor_area || 0);
                const minOK = floorAreaMin <= AREA_MIN ? true : fa >= floorAreaMin;
                const maxOK = floorAreaMax >= AREA_MAX ? true : fa <= floorAreaMax;
                return minOK && maxOK;
            });
            if (bedroomsMin) arr = arr.filter((p) => Number(p?.bedrooms || 0) >= bedroomsMin);
            if (bathroomsMin) arr = arr.filter((p) => Number(p?.bathrooms || 0) >= bathroomsMin);
            if (carSlotsMin) arr = arr.filter((p) => Number(p?.car_slots || 0) >= carSlotsMin);
            if (totalRoomsMin) arr = arr.filter((p) => Number(p?.total_rooms || 0) >= totalRoomsMin);
        } else {
            if (showFloorArea) {
                arr = arr.filter((p) => {
                    const fa = Number(p?.floor_area || 0);
                    const minOK = floorAreaMin <= AREA_MIN ? true : fa >= floorAreaMin;
                    const maxOK = floorAreaMax >= AREA_MAX ? true : fa <= floorAreaMax;
                    return minOK && maxOK;
                });
            }
            if (showLotArea) {
                arr = arr.filter((p) => {
                    const la = Number(p?.lot_area || 0);
                    const minOK = lotAreaMin <= AREA_MIN ? true : la >= lotAreaMin;
                    const maxOK = lotAreaMax >= AREA_MAX ? true : la <= lotAreaMax;
                    return minOK && maxOK;
                });
            }
        }

        return arr;
    }, [
        propertiesWithMap,
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
        isOnlyLand,
        isOnlyHouse,
        showFloorArea,
        showLotArea,
    ]);

    // chips
    const chips = useMemo(() => {
        const c = [];
        if (searchTerm) c.push({ label: `“${searchTerm}”`, clear: () => setSearchTerm("") });
        if (selectedTypes.length) c.push({ label: selectedTypes.join(" · "), clear: () => setSelectedTypes([]) });
        c.push({ label: isPresell ? "Pre-Selling" : "For Sale", clear: () => setIsPresell((v) => !v) });
        if (withPhotos) c.push({ label: "With photos", clear: () => setWithPhotos(false) });

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
            if (bedroomsMin) c.push({ label: `Bedrooms ≥ ${bedroomsMin}`, clear: () => setBedroomsMin(0) });
            if (bathroomsMin) c.push({ label: `Bathrooms ≥ ${bathroomsMin}`, clear: () => setBathroomsMin(0) });
            if (carSlotsMin) c.push({ label: `Car Slots ≥ ${carSlotsMin}`, clear: () => setCarSlotsMin(0) });
            if (totalRoomsMin) c.push({ label: `Total Rooms ≥ ${totalRoomsMin}`, clear: () => setTotalRoomsMin(0) });
            if (floorAreaMin > AREA_MIN || floorAreaMax < AREA_MAX)
                c.push({
                    label: `Floor ${area(floorAreaMin)} – ${area(floorAreaMax)}`,
                    clear: () => {
                        setFloorAreaMin(AREA_MIN);
                        setFloorAreaMax(AREA_MAX);
                    },
                });
        } else if (isOnlyLand) {
            if (lotAreaMin > AREA_MIN || lotAreaMax < AREA_MAX)
                c.push({
                    label: `Lot ${area(lotAreaMin)} – ${area(lotAreaMax)}`,
                    clear: () => {
                        setLotAreaMin(AREA_MIN);
                        setLotAreaMax(AREA_MAX);
                    },
                });
        } else {
            if (showFloorArea && (floorAreaMin > AREA_MIN || floorAreaMax < AREA_MAX))
                c.push({
                    label: `Floor ${area(floorAreaMin)} – ${area(floorAreaMax)}`,
                    clear: () => {
                        setFloorAreaMin(AREA_MIN);
                        setFloorAreaMax(AREA_MAX);
                    },
                });
            if (showLotArea && (lotAreaMin > AREA_MIN || lotAreaMax < AREA_MAX))
                c.push({
                    label: `Lot ${area(lotAreaMin)} – ${area(lotAreaMax)}`,
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
        <div className="bg-[#FAFAFB] min-h-screen">
            <NavBar />

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


            <div className=" px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* DESKTOP SIDEBAR */}
                {showFilters && (
                    <aside className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 space-y-6 sticky top-6 h-fit">
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

                {/* MOBILE FILTER BUTTON */}
                {!showFilters && (
                    <>
                        <div className="lg:hidden -mt-2 mb-2">
                            <button
                                onClick={() => setShowFiltersMobile(true)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
                            >
                                <FilterIcon className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {/* Mobile Drawer */}
                        {showFiltersMobile && (
                            <div className="fixed inset-0 z-50">
                                <div className="absolute inset-0 bg-black/40" onClick={() => setShowFiltersMobile(false)} />
                                <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl p-5 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                                        <button
                                            onClick={() => setShowFiltersMobile(false)}
                                            className="p-2 rounded-md hover:bg-gray-100"
                                            aria-label="Close filters"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
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
                                            setLotAreaMax,
                                            setLotAreaMin,
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

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => setShowFiltersMobile(false)}
                                            className="flex-1 bg-emerald-600 text-white rounded-lg py-2 font-medium hover:bg-emerald-700"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={() => {
                                                resetFilters();
                                                setShowFiltersMobile(false);
                                            }}
                                            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MAIN */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => (showFilters ? setShowFilters(false) : setShowFilters(true))}
                                className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
                                title="Toggle filters"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
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
                                    className={`px-3 sm:px-4 py-2 text-sm inline-flex items-center gap-2 ${
                                        viewMode === "grid" ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                    aria-label="Grid view"
                                >
                                    <GridIcon className="w-4 h-4" /> Grid
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 sm:px-4 py-2 text-sm inline-flex items-center gap-2 ${
                                        viewMode === "list" ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"
                                    }`}
                                    aria-label="List view"
                                >
                                    <ListIcon className="w-4 h-4" /> List
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
                    {chips.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {chips.map((chip, idx) => (
                                <button
                                    key={`${chip.label}-${idx}`}
                                    onClick={chip.clear}
                                    className="inline-flex items-center gap-2 bg-white text-gray-700 ring-1 ring-gray-200 rounded-full px-3 py-1.5 text-sm hover:bg-gray-50"
                                >
                                    {chip.label}
                                    <svg width="14" height="14" viewBox="0 0 24 24" className="fill-gray-500">
                                        <path d="M18.3 5.71 12 12.01l-6.3-6.3L4.3 7.11l6.3 6.29-6.3 6.3 1.4 1.4 6.3-6.29 6.29 6.29 1.41-1.4-6.3-6.3 6.3-6.29z" />
                                    </svg>
                                </button>
                            ))}
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-full ring-1 ring-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                                title="Clear all filters"
                            >
                                <X className="w-3.5 h-3.5" /> Clear all
                            </button>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={`sk-${i}`} className="rounded-2xl ring-1 ring-gray-200 bg-white p-3 animate-pulse space-y-3">
                                        <div className="h-40 w-full bg-gray-200 rounded-xl" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-8 bg-gray-200 rounded w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProperties.length === 0 ? (
                            <div className="py-14 text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-500 mb-3">
                                    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                                        <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-1.4 1.4l.3.3v.8l5 5 1.5-1.5-5-5zM10 15a5 5 0 110-10 5 5 0 010 10z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600">No matching properties. Adjust your filters.</p>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {sortedProperties.map((p) => {
                                    const isFav = favoriteIds.includes(p?.id);
                                    return (
                                        <div key={p?.id} className="relative">
                                            {/* Favorite overlay button */}


                                            <PropertyCard
                                                property={p}
                                                isFavorite={isFav}
                                                onToggleFavorite={() => toggleFavorite(p?.id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProperties.map((p) => {
                                    const isFav = favoriteIds.includes(p?.id);
                                    return (
                                        <div key={p?.id} className="relative bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
                                            <div className="absolute z-10 right-3 top-3">
                                                <button
                                                    onClick={() => toggleFavorite(p?.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition bg-white hover:bg-gray-50"
                                                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                                                >
                                                    <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
                                                    {isFav ? "Favorited" : "Add to Favorites"}
                                                </button>
                                            </div>
                                            <PropertyListCard property={p} isFavorite={isFav} onToggleFavorite={() => toggleFavorite(p?.id)} />
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

/* ---------- Filter Panel extracted (desktop + mobile share this) ---------- */
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
                <button className="text-sm text-emerald-700 hover:text-emerald-900" onClick={resetFilters}>
                    Reset
                </button>
            </div>

            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-gray-400">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-1.4 1.4l.28.27v.79l5 5 1.5-1.5-5-5zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
          </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                        placeholder="Title, address, or location"
                    />
                </div>
            </div>

            {/* Availability */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="grid grid-cols-2 rounded-lg border border-gray-300 overflow-hidden">
                    <button
                        className={`py-2 text-sm transition ${!isPresell ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"}`}
                        onClick={() => setIsPresell(false)}
                    >
                        For Sale
                    </button>
                    <button
                        className={`py-2 text-sm transition ${isPresell ? "bg-emerald-600 text-white" : "bg-white hover:bg-gray-50"}`}
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
                    {ALL_TYPES.map((t) => (
                        <CheckboxFilter key={t} label={t} value={t} checked={includesSafe(selectedTypes, t)} onChange={handleTypeChange} />
                    ))}
                </div>
            </div>

            {/* Photos only */}
            <Checkbox id="withPhotos" label="Show only listings with photos" checked={withPhotos} onChange={setWithPhotos} />

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
                format={(v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(v)}
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
                        <Numeric label="Bedrooms (min)" value={bedroomsMin} onChange={setBedroomsMin} />
                        <Numeric label="Bathrooms (min)" value={bathroomsMin} onChange={setBathroomsMin} />
                        <Numeric label="Car Slots (min)" value={carSlotsMin} onChange={setCarSlotsMin} />
                        <Numeric label="Total Rooms (min)" value={totalRoomsMin} onChange={setTotalRoomsMin} />
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
                min="0"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-200"
            />
        </div>
    );
}
