import React, { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import PropertyCard from "@/Components/Property/PropertyCard";
import PropertyListCard from "@/Pages/Property/PropertyListCard";
import DisplayMap from "@/Pages/Buyer/Properties/DisplayMap";
import NavBar from "@/Components/NavBar";

function CheckboxFilter({ label, value, checked, onChange }) {
    return (
        <label className="flex items-center space-x-2 text-gray-700">
            <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded"
                checked={checked}
                onChange={(e) => onChange(value, e.target.checked)}
            />
            <span>{label}</span>
        </label>
    );
}

export default function Properties({ properties = [], propertiesWithMap = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isPresell, setIsPresell] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [bathrooms, setBathrooms] = useState("");
    const [floorAreaMin, setFloorAreaMin] = useState("");
    const [lotAreaMin, setLotAreaMin] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [sortOrder, setSortOrder] = useState("default");
    const [showFilters, setShowFilters] = useState(false);

    const allTypes = ['Apartment', 'Commercial', 'Condominium', 'House', 'Land'];

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
    };

    const handleTypeChange = (type, checked) => {
        setSelectedTypes(prev => checked ? [...prev, type] : prev.filter(t => t !== type));
    };

    const [filtered, setFiltered] = useState(properties);

    useEffect(() => {
        const applyFilters = () => {
            let arr = [...properties];

            arr = arr.filter(p => (isPresell ? p.isPresell : !p.isPresell));

            const lower = searchTerm.toLowerCase();
            if (lower) {
                arr = arr.filter(p =>
                    p.title?.toLowerCase().includes(lower) ||
                    p.location?.toLowerCase().includes(lower)
                );
            }

            if (selectedTypes.length > 0) {
                arr = arr.filter(p => selectedTypes.includes(p.property_type));
            }

            const min = Number(priceMin) || 0;
            const max = Number(priceMax) || Infinity;
            arr = arr.filter(p => {
                const price = Number(p.price) || 0;
                return price >= min && price <= max;
            });

            if (bedrooms) arr = arr.filter(p => Number(p.bedrooms || 0) >= Number(bedrooms));
            if (bathrooms) arr = arr.filter(p => Number(p.bathrooms || 0) >= Number(bathrooms));
            if (floorAreaMin) arr = arr.filter(p => Number(p.floor_area || 0) >= Number(floorAreaMin));
            if (lotAreaMin) arr = arr.filter(p => Number(p.lot_area || 0) >= Number(lotAreaMin));

            setFiltered(arr);
        };

        const deb = debounce(applyFilters, 300);
        deb();
        return () => deb.cancel();
    }, [
        properties,
        searchTerm,
        selectedTypes,
        isPresell,
        priceMin,
        priceMax,
        bedrooms,
        bathrooms,
        floorAreaMin,
        lotAreaMin
    ]);

    const sortedProperties = useMemo(() => {
        if (sortOrder === "low-to-high") {
            return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
        }
        if (sortOrder === "high-to-low") {
            return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
        }
        return filtered;
    }, [filtered, sortOrder]);

    return (
        <div className="bg-gray-50 min-h-screen pt-[60px]">
            <NavBar />

            <header className="bg-white shadow-sm p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="fas fa-map-marker-alt text-green-600 mr-2"></i>
                            Premium Lot Finder
                        </h1>
                        <p className="text-gray-500 mt-1">Search by filters, location, price, and more</p>
                    </div>
                    <div className="hidden lg:flex gap-4">
                        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                            <i className="fas fa-heart text-red-500 mr-1"></i>
                            Saved Lots
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            <i className="fas fa-plus mr-1"></i>
                            List Your Property
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
                {/* Filters Sidebar */}
                {(showFilters || typeof window === "undefined" || window.innerWidth >= 1024) && (
                    <aside className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-lg shadow-sm space-y-6 sticky top-6 h-fit">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button
                                className="text-sm text-green-600 hover:text-green-800"
                                onClick={resetFilters}
                            >
                                Reset All
                            </button>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Title or Location"
                            />
                        </div>

                        {/* Availability */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                            <div className="flex rounded-lg overflow-hidden border border-gray-300">
                                <button
                                    className={`flex-1 p-2 ${!isPresell ? "bg-green-600 text-white" : ""}`}
                                    onClick={() => setIsPresell(false)}
                                >
                                    For Sale
                                </button>
                                <button
                                    className={`flex-1 p-2 ${isPresell ? "bg-green-600 text-white" : ""}`}
                                    onClick={() => setIsPresell(true)}
                                >
                                    Pre‑Selling
                                </button>
                            </div>
                        </div>

                        {/* Property Type */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Property Type</h4>
                            <div className="space-y-2">
                                {allTypes.map((type) => (
                                    <CheckboxFilter
                                        key={type}
                                        label={type}
                                        value={type}
                                        checked={selectedTypes.includes(type)}
                                        onChange={handleTypeChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range (₱)</h4>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                                placeholder="Min"
                            />
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                placeholder="Max"
                            />
                        </div>

                        {/* Advanced Filters */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-700">Bedrooms (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Bathrooms (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={bathrooms}
                                    onChange={(e) => setBathrooms(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Floor Area (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={floorAreaMin}
                                    onChange={(e) => setFloorAreaMin(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-700">Lot Area (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={lotAreaMin}
                                    onChange={(e) => setLotAreaMin(e.target.value)}
                                />
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="mb-6 h-64 border rounded overflow-hidden shadow-sm">
                        <DisplayMap properties={propertiesWithMap} />
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 rounded border ${
                                    viewMode === "grid" ? "bg-green-600 text-white" : "bg-white"
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-4 py-2 rounded border ${
                                    viewMode === "list" ? "bg-green-600 text-white" : "bg-white"
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="py-2 px-3 border rounded"
                        >
                            <option value="default">Sort By</option>
                            <option value="low-to-high">Price: Low to High</option>
                            <option value="high-to-low">Price: High to Low</option>
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {sortedProperties.length === 0 ? (
                            <p className="text-center text-gray-500">No matching properties.</p>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {sortedProperties.map((p) => (
                                    <PropertyCard key={p.id} property={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProperties.map((p) => (
                                    <PropertyListCard key={p.id} property={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
