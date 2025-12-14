import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { debounce } from "lodash";
import PropertyCard from "@/Components/Property/PropertyCard";
import {
    Search,
    Filter,
    X,
    Camera,
    Eye,
    ChevronDown,
    ChevronUp,
    Bed,
    Bath,
    Car,
    Square,
    Ruler,
    Calendar,
    SlidersHorizontal,
    ArrowUpDown,
    Star,
    Sparkles,
    Crown,
    Zap,
    Clock,
    Building,
    Building2,
    House,
    Landmark,
    LucideMapPin,
} from "lucide-react";
import Navbar from "@/Components/NavBar.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import ToastHandler from "@/Components/ToastHandler.jsx";

// Property Categories with Subcategories
const PROPERTY_CATEGORIES = [
    {
        category: "Apartment",
        subcategories: ["Bedspace", "Loft", "Penthouse", "Room"],
        icon: Landmark,
        color: "from-emerald-500 to-teal-500",
    },
    {
        category: "Commercial",
        subcategories: [
            "Building",
            "Coworking Space",
            "Offices",
            "Retail",
            "Serviced Office",
            "Warehouse",
        ],
        icon: Building,
        color: "from-emerald-600 to-green-500",
    },
    {
        category: "Condominium",
        subcategories: ["Condotel", "Loft", "Other", "Penthouse", "Studio"],
        icon: Building2,
        color: "from-teal-500 to-emerald-500",
    },
    {
        category: "House",
        subcategories: [
            "Beach House",
            "Farm House",
            "Single Family House",
            "Townhouse",
            "Villas",
        ],
        icon: House,
        color: "from-green-500 to-emerald-400",
    },
    {
        category: "Land",
        subcategories: [
            "Agricultural Lot",
            "Beach Lot",
            "Commercial Lot",
            "Industrial Lot",
            "Memorial Lot",
            "Parking Lot",
            "Residential Lot",
            "Subdivision Lot",
        ],
        icon: LucideMapPin,
        color: "from-amber-500 to-emerald-500",
    },
];

// Default filter state
const DEFAULT_FILTERS = {
    search: "",
    category: [],
    subcategory: [],
    features: [],
    is_presell: null, // "true" | "false" | null
    is_rush: null,    // ✅ ADD: "true" | "false" | null
    with_photos: false,

    price_min: "",
    price_max: "",

    floor_min: "",
    floor_max: "",

    lot_min: "",
    lot_max: "",

    bedrooms_min: "",
    bedrooms_max: "",
    bathrooms_min: "",
    bathrooms_max: "",
    car_slots_min: "",
    car_slots_max: "",
    year_built_min: "",
    year_built_max: "",

    location: "",
    sort: "newest",
};

// Loading Skeleton Component
const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden border border-gray-100">
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-xl"></div>
        <div className="p-5 space-y-4">
            <div className="flex gap-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-8 h-3 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
            <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

export default function Properties({ properties, filters, loading = false }) {
    // ✅ Initialize state with normalized tri-state for is_presell + is_rush
    const [localFilters, setLocalFilters] = useState(() => {
        const initial = { ...DEFAULT_FILTERS };

        if (filters) {
            Object.keys(filters).forEach((key) => {
                const v = filters[key];

                if (v === undefined || v === null) return;

                if (["category", "subcategory", "features"].includes(key)) {
                    initial[key] = Array.isArray(v) ? v : [v].filter(Boolean);
                    return;
                }

                if (key === "with_photos") {
                    initial[key] = Boolean(v);
                    return;
                }

                // ✅ Normalize backend boolean -> frontend query-string style
                if (key === "is_presell" || key === "is_rush") {
                    initial[key] = v === true ? "true" : v === false ? "false" : null;
                    return;
                }

                initial[key] = v;
            });
        }

        return initial;
    });

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const list = Array.isArray(properties?.data) ? properties.data : [];

    // Check if Land category is selected
    const isLandCategorySelected = useMemo(() => {
        return localFilters.category.includes("Land");
    }, [localFilters.category]);

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ✅ Filter cleanup function (keeps "false" for tri-state keys)
    const cleanupFilters = useCallback((rawFilters) => {
        const cleaned = {};

        Object.keys(rawFilters).forEach((key) => {
            const value = rawFilters[key];

            if (value === "" || value === null || value === undefined) return;

            // ✅ keep tri-state values ("true" / "false")
            if ((key === "is_presell" || key === "is_rush") && value !== null) {
                cleaned[key] = value;
                return;
            }

            if (Array.isArray(value)) {
                if (value.length > 0) cleaned[key] = value;
                return;
            }

            if (typeof value === "boolean") {
                if (value === true) cleaned[key] = value;
                return;
            }

            if (typeof value === "string" && value.trim() !== "") {
                cleaned[key] = value;
            }
        });

        return cleaned;
    }, []);

    // Debounced visit
    const debouncedVisit = useMemo(
        () =>
            debounce((nextFilters) => {
                const cleanedFilters = cleanupFilters(nextFilters);
                router.get(route("properties"), cleanedFilters, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }, 500),
        [cleanupFilters]
    );

    useEffect(() => {
        return () => debouncedVisit.cancel();
    }, [debouncedVisit]);

    // Immediate apply
    const applyNow = useCallback(
        (nextFilters) => {
            debouncedVisit.cancel();
            const cleanedFilters = cleanupFilters(nextFilters);
            router.get(route("properties"), cleanedFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [debouncedVisit, cleanupFilters]
    );

    // Filter updates
    const updateFilter = useCallback(
        (key, value, { immediate = false } = {}) => {
            setLocalFilters((prev) => {
                const next = { ...prev, [key]: value };
                if (immediate) applyNow(next);
                else debouncedVisit(next);
                return next;
            });
        },
        [debouncedVisit, applyNow]
    );

    // Multi-select handlers
    const toggleArrayFilter = useCallback(
        (key, value) => {
            setLocalFilters((prev) => {
                const current = prev[key] || [];
                const nextArray = current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value];

                const next = { ...prev, [key]: nextArray };
                applyNow(next);
                return next;
            });
        },
        [applyNow]
    );

    // Toggle category expansion
    const toggleCategoryExpansion = useCallback((categoryName) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryName]: !prev[categoryName],
        }));
    }, []);

    // Handle category selection with subcategory
    const handleCategorySelect = useCallback(
        (categoryName, subcategory = null) => {
            setLocalFilters((prev) => {
                let newCategories = [...prev.category];
                let newSubcategories = [...prev.subcategory];

                if (subcategory) {
                    if (newSubcategories.includes(subcategory)) {
                        newSubcategories = newSubcategories.filter((sc) => sc !== subcategory);
                    } else {
                        newSubcategories.push(subcategory);
                    }
                    if (!newCategories.includes(categoryName)) {
                        newCategories.push(categoryName);
                    }
                } else {
                    if (newCategories.includes(categoryName)) {
                        newCategories = newCategories.filter((c) => c !== categoryName);
                        const category = PROPERTY_CATEGORIES.find((c) => c.category === categoryName);
                        if (category) {
                            newSubcategories = newSubcategories.filter(
                                (sc) => !category.subcategories.includes(sc)
                            );
                        }
                    } else {
                        newCategories.push(categoryName);
                    }
                }

                const next = { ...prev, category: newCategories, subcategory: newSubcategories };
                applyNow(next);
                return next;
            });
        },
        [applyNow]
    );

    // Remove individual filter
    const removeFilter = useCallback(
        (key, value = null) => {
            setLocalFilters((prev) => {
                let next;

                if (value === null) {
                    next = { ...prev, [key]: DEFAULT_FILTERS[key] };
                } else if (Array.isArray(prev[key])) {
                    next = { ...prev, [key]: prev[key].filter((item) => item !== value) };
                } else {
                    next = { ...prev, [key]: DEFAULT_FILTERS[key] };
                }

                applyNow(next);
                return next;
            });
        },
        [applyNow]
    );

    // ✅ Availability handler -> uses "true" / "false" / null
    const handleAvailabilityChange = useCallback(
        (value) => {
            const is_presell =
                value === "presell" ? "true" : value === "forsale" ? "false" : null;

            updateFilter("is_presell", is_presell, { immediate: true });
        },
        [updateFilter]
    );

    // ✅ Rush handler -> uses "true" / "false" / null
    const handleRushChange = useCallback(
        (value) => {
            const is_rush = value === "rush" ? "true" : value === "normal" ? "false" : null;
            updateFilter("is_rush", is_rush, { immediate: true });
        },
        [updateFilter]
    );

    // Reset filters
    const resetFilters = useCallback(() => {
        setLocalFilters(DEFAULT_FILTERS);
        setExpandedCategories({});
        setShowAdvancedFilters(false);
        applyNow(DEFAULT_FILTERS);
        setMobileFiltersOpen(false);
    }, [applyNow]);

    // ✅ Current availability state (fixed for strings)
    const currentAvailability = useMemo(() => {
        if (localFilters.is_presell === "true") return "presell";
        if (localFilters.is_presell === "false") return "forsale";
        return "all";
    }, [localFilters.is_presell]);

    // ✅ Current rush state
    const currentRush = useMemo(() => {
        if (localFilters.is_rush === "true") return "rush";
        if (localFilters.is_rush === "false") return "normal";
        return "all";
    }, [localFilters.is_rush]);

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        const filtersToCheck = [
            localFilters.search,
            localFilters.category,
            localFilters.subcategory,
            localFilters.features,
            localFilters.is_presell,
            localFilters.is_rush, // ✅ ADD
            localFilters.with_photos,
            localFilters.price_min,
            localFilters.price_max,
            localFilters.floor_min,
            localFilters.floor_max,
            localFilters.lot_min,
            localFilters.lot_max,
            localFilters.bedrooms_min,
            localFilters.bedrooms_max,
            localFilters.bathrooms_min,
            localFilters.bathrooms_max,
            localFilters.car_slots_min,
            localFilters.car_slots_max,
            localFilters.year_built_min,
            localFilters.year_built_max,
            localFilters.location,
            localFilters.sort,
        ];

        return filtersToCheck.filter((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "boolean") return value === true;
            if (typeof value === "string") return value !== "" && value !== "newest";
            return value !== null && value !== undefined;
        }).length;
    }, [localFilters]);

    const hasActiveFilters = activeFiltersCount > 0;

    // Toggle favorite
    const toggleFavourite = useCallback((propertyId) => {
        router.post(
            route("favourites.toggle"),
            { property_id: propertyId },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    }, []);

    const getInputValue = (value) => {
        if (value === null || value === undefined) return "";
        return value;
    };

    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    const formatPriceInput = (value) => {
        if (!value) return "";
        const numericValue = value.toString().replace(/\D/g, "");
        if (numericValue === "") return "";
        return Number(numericValue).toLocaleString("en-PH");
    };

    const handlePriceInput = (field, value) => {
        const rawValue = value.replace(/\D/g, "");
        updateFilter(field, rawValue);
    };

    return (
        <div className="min-h-screen page-container overflow-hidden">
            <ToastHandler />
            <Navbar />

            {/* Header */}
            <div ref={ref} className={`relative z-10 transition-all duration-300 bg-emerald-600`}>
                <motion.div
                    style={{ y: y1, opacity }}
                    className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-500/30 to-primary-600/30 rounded-full blur-3xl"
                />
                <motion.div
                    style={{ y: y2, opacity }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-secondary-500/30 to-secondary-600/30 rounded-full blur-3xl"
                />
                <div className="pt-20 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent">
                                Discover Your Dream Property
                            </h1>
                            <p className="text-lg text-white mt-3 max-w-2xl">
                                Explore our curated collection of premium properties
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100">
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {properties?.total ?? 0}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                    Properties Available
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-emerald-100"
                        >
                            <Filter className="w-5 h-5 text-emerald-600" />
                            <span className="font-semibold text-gray-700">Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-gray-200"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* FILTER SIDEBAR */}
                    <div
                        className={`
                            fixed lg:sticky top-0 left-0 w-full lg:w-80 h-full lg:h-auto bg-white/90 backdrop-blur-xl z-50 lg:z-auto transform transition-transform duration-300 ease-in-out
                            ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                            lg:rounded-2xl lg:shadow-xl border-r lg:border border-emerald-100
                        `}
                    >
                        <div className="h-full flex flex-col">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-6 border-b border-emerald-100 lg:hidden">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Refine Search
                                </h2>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="p-3 hover:bg-emerald-50 rounded-2xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Filter Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" />
                                            Reset All
                                        </button>
                                    )}
                                </div>

                                {/* Search */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={getInputValue(localFilters.search)}
                                                onChange={(e) => updateFilter("search", e.target.value)}
                                                className="w-full bg-white border border-emerald-200 rounded-xl px-4 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                                placeholder="Search..."
                                            />
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Property Category with Subcategories */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                        Property Type
                                    </h4>
                                    <div className="space-y-2">
                                        {PROPERTY_CATEGORIES.map((cat) => {
                                            const Icon = cat.icon;
                                            const isExpanded = expandedCategories[cat.category];
                                            const isCategorySelected = localFilters.category.includes(cat.category);

                                            return (
                                                <div key={cat.category} className="space-y-2">
                                                    <label
                                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                                            isCategorySelected
                                                                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                                                : "border-emerald-200 bg-white hover:border-emerald-300"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isCategorySelected}
                                                            onChange={() => handleCategorySelect(cat.category)}
                                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <div
                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center shadow-sm`}
                                                        >
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 flex-1">
                                                            {cat.category}
                                                        </span>

                                                        {cat.subcategories.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleCategoryExpansion(cat.category);
                                                                }}
                                                                className="text-emerald-400 hover:text-emerald-600 transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </label>

                                                    {/* Subcategories */}
                                                    {isCategorySelected && isExpanded && (
                                                        <div className="ml-4 space-y-1 border-l-2 border-emerald-200 pl-4">
                                                            {cat.subcategories.map((subcat) => (
                                                                <label
                                                                    key={subcat}
                                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={localFilters.subcategory.includes(subcat)}
                                                                        onChange={() =>
                                                                            handleCategorySelect(cat.category, subcat)
                                                                        }
                                                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                                                    />
                                                                    <span className="text-xs text-gray-600">
                                                                        {subcat}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                        Price Range
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9,]*"
                                                    value={formatPriceInput(localFilters.price_min)}
                                                    onChange={(e) => handlePriceInput("price_min", e.target.value)}
                                                    className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                                                    placeholder="Min"
                                                />
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-emerald-600 font-medium">
                                                    ₱
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9,]*"
                                                    value={formatPriceInput(localFilters.price_max)}
                                                    onChange={(e) => handlePriceInput("price_max", e.target.value)}
                                                    className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                                                    placeholder="Max"
                                                />
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-emerald-600 font-medium">
                                                    ₱
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            Example: 1,000,000 for one million pesos
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="space-y-4">
                                    {/* Availability */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Availability
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAvailabilityChange("all")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentAvailability === "all"
                                                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Star className="w-4 h-4" />
                                                <span className="text-xs font-medium">All</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAvailabilityChange("presell")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentAvailability === "presell"
                                                        ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-medium">Pre-sell</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAvailabilityChange("forsale")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentAvailability === "forsale"
                                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Crown className="w-4 h-4" />
                                                <span className="text-xs font-medium">Ready</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* ✅ Rush */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Rush</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRushChange("all")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentRush === "all"
                                                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Star className="w-4 h-4" />
                                                <span className="text-xs font-medium">All</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRushChange("rush")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentRush === "rush"
                                                        ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Zap className="w-4 h-4" />
                                                <span className="text-xs font-medium">Rush</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRushChange("normal")}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
                                                    currentRush === "normal"
                                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                                        : "border-emerald-200 bg-white text-gray-700 hover:border-emerald-300"
                                                }`}
                                            >
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-medium">Normal</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* With photos */}
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-300 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={localFilters.with_photos}
                                            onChange={(e) =>
                                                updateFilter("with_photos", e.target.checked, { immediate: true })
                                            }
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <Camera className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            With photos only
                                        </span>
                                    </label>
                                </div>

                                {/* Advanced Filters Toggle */}
                                <div className="border-t border-emerald-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="flex items-center justify-between w-full p-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Advanced Filters
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-emerald-600 transition-transform duration-200 ${
                                                showAdvancedFilters ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="space-y-4 animate-fadeIn">
                                        {/* Area */}
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                                                Area
                                            </h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={getInputValue(localFilters.floor_min)}
                                                        onChange={(e) => updateFilter("floor_min", e.target.value)}
                                                        className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        placeholder="Floor min"
                                                    />
                                                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={getInputValue(localFilters.lot_min)}
                                                        onChange={(e) => updateFilter("lot_min", e.target.value)}
                                                        className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        placeholder="Lot min"
                                                    />
                                                    <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Details - Hide for Land */}
                                        {!isLandCategorySelected && (
                                            <div className="space-y-3">
                                                <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                                                    Property Details
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={getInputValue(localFilters.bedrooms_min)}
                                                            onChange={(e) =>
                                                                updateFilter("bedrooms_min", e.target.value)
                                                            }
                                                            className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            placeholder="Beds min"
                                                        />
                                                        <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                    </div>

                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={getInputValue(localFilters.bathrooms_min)}
                                                            onChange={(e) =>
                                                                updateFilter("bathrooms_min", e.target.value)
                                                            }
                                                            className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            placeholder="Baths min"
                                                        />
                                                        <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                    </div>

                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={getInputValue(localFilters.car_slots_min)}
                                                            onChange={(e) =>
                                                                updateFilter("car_slots_min", e.target.value)
                                                            }
                                                            className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            placeholder="Cars min"
                                                        />
                                                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                    </div>

                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={getInputValue(localFilters.year_built_min)}
                                                            onChange={(e) =>
                                                                updateFilter("year_built_min", e.target.value)
                                                            }
                                                            className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            placeholder="Year min"
                                                        />
                                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Sort */}
                                <div className="border-t border-emerald-100 pt-4">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                        Sort Results
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={localFilters.sort}
                                            onChange={(e) => updateFilter("sort", e.target.value, { immediate: true })}
                                            className="w-full bg-white border border-emerald-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                            <option value="low-to-high">Price: Low to High</option>
                                            <option value="high-to-low">Price: High to Low</option>
                                            <option value="largest">Largest Area</option>
                                        </select>
                                        <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overlay for mobile */}
                    {mobileFiltersOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                    )}

                    {/* MAIN CONTENT */}
                    <div className="flex-1 min-w-0">
                        {/* Results Header */}
                        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-emerald-100">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Properties</h2>
                                    <p className="text-gray-600">
                                        {hasActiveFilters
                                            ? `Found ${properties?.total ?? 0} matching properties`
                                            : `Browse ${properties?.total ?? 0} properties`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                        <span className="font-bold text-gray-800">
                                            {properties?.from ?? 0}–{properties?.to ?? 0}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-bold text-gray-800">
                                            {properties?.total ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-100">
                                    <span className="text-xs font-semibold text-gray-500">ACTIVE FILTERS:</span>

                                    {localFilters.category.map((cat) => (
                                        <span
                                            key={cat}
                                            className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full border border-emerald-200"
                                        >
                                            {cat}
                                            <button
                                                type="button"
                                                onClick={() => removeFilter("category", cat)}
                                                className="hover:text-emerald-900 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {localFilters.subcategory.map((subcat) => (
                                        <span
                                            key={subcat}
                                            className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs px-3 py-1.5 rounded-full border border-teal-200"
                                        >
                                            {subcat}
                                            <button
                                                type="button"
                                                onClick={() => removeFilter("subcategory", subcat)}
                                                className="hover:text-teal-900 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {localFilters.is_presell !== null && (
                                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-full border border-purple-200">
                                            {localFilters.is_presell === "true"
                                                ? "Pre-selling"
                                                : "Ready for Occupancy"}
                                            <button
                                                type="button"
                                                onClick={() => removeFilter("is_presell")}
                                                className="hover:text-purple-900 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {/* ✅ Rush chip */}
                                    {localFilters.is_rush !== null && (
                                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-full border border-rose-200">
                                            {localFilters.is_rush === "true" ? "Rush Sale" : "Non-rush"}
                                            <button
                                                type="button"
                                                onClick={() => removeFilter("is_rush")}
                                                className="hover:text-rose-900 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {localFilters.price_min && (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200">
                                            Min ₱{localFilters.price_min}
                                            <button
                                                type="button"
                                                onClick={() => removeFilter("price_min")}
                                                className="hover:text-amber-900 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {activeFiltersCount > 3 && (
                                        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-200">
                                            +{activeFiltersCount - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, index) => (
                                    <PropertyCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* All Properties Grid */}
                                {list.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {list.map((property) => (
                                            <div key={property.id} className="group">
                                                <div className="bg-white rounded-xl h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100 hover:border-emerald-200">
                                                    <PropertyCard
                                                        onToggleFavorite={() => toggleFavourite(property.id)}
                                                        property={property}
                                                        isFavorite={property.is_favourite || false}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-emerald-100">
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                                                <Eye className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                No Properties Found
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                {hasActiveFilters
                                                    ? "Try adjusting your filters to see more results."
                                                    : "Check back later for new property listings."}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={resetFilters}
                                                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                >
                                                    Clear All Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pagination */}
                        {!loading && properties?.links && properties.links.length > 3 && (
                            <div className="flex justify-center mt-8">
                                <nav className="flex items-center gap-1 bg-white rounded-xl shadow-lg p-2 border border-emerald-100">
                                    {properties.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (!link.url) return;
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                link.active
                                                    ? "bg-emerald-600 text-white shadow-sm"
                                                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                                            } ${
                                                !link.url
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "hover:scale-105"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom CSS for smooth animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
