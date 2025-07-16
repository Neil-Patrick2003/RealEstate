import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";
import PropertyListCard from "@/Pages/Property/PropertyListCard.jsx";
import DisplayMap from "@/Pages/Buyer/Properties/DisplayMap.jsx";
import NavBar from "@/Components/NavBar.jsx";

function CheckboxFilter({ label, value, checked, onChange }) {
    return (
        <label className="inline-flex items-center space-x-2">
            <input
                type="checkbox"
                value={value}
                checked={checked}
                onChange={(e) => onChange(value, e.target.checked)}
                className="form-checkbox rounded text-primary"
            />
            <span className="text-gray-700">{label}</span>
        </label>
    );
}

export default function Properties({ properties = [], propertiesWithMap = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isPresell, setIsPresell] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [sortOrder, setSortOrder] = useState("default");

    const allTypes = ['Apartment', 'Commercial', 'Condominium', 'House', 'Land'];

    const handleTypeChange = (type, checked) => {
        setSelectedTypes((prev) =>
            checked ? [...prev, type] : prev.filter((t) => t !== type)
        );
    };

    const [filtered, setFiltered] = useState(properties);

    useEffect(() => {
        const applyFilters = () => {
            let arr = [...properties];

            arr = arr.filter((p) => (isPresell ? p.isPresell : !p.isPresell));

            const lower = searchTerm.toLowerCase();
            if (lower) {
                arr = arr.filter(
                    (p) =>
                        p.title?.toLowerCase().includes(lower) ||
                        p.location?.toLowerCase().includes(lower)
                );
            }

            if (selectedTypes.length > 0) {
                arr = arr.filter((p) => selectedTypes.includes(p.property_type));
            }

            const min = Number(priceMin) || 0;
            const max = Number(priceMax) || Infinity;
            arr = arr.filter((p) => {
                const pr = Number(p.price) || 0;
                return pr >= min && pr <= max;
            });

            setFiltered(arr);
        };

        const deb = debounce(applyFilters, 300);
        deb();
        return () => deb.cancel();
    }, [properties, searchTerm, selectedTypes, isPresell, priceMin, priceMax]);

    const sortedProperties = React.useMemo(() => {
        if (sortOrder === "low-to-high") {
            return [...filtered].sort(
                (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
            );
        }
        if (sortOrder === "high-to-low") {
            return [...filtered].sort(
                (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
            );
        }
        return filtered;
    }, [filtered, sortOrder]);

    return (
        <div className="flex  h-[calc(100vh-100px)] flex-col lg:flex-row min-h-screen">
            <NavBar />

            {/* Sidebar Filters */}
            <aside className="w-full lg:w-1/4 p-6 mt-20 border-b lg:border-r bg-gray-50 space-y-8 text-sm">
                {/* Search Input */}
                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">Search</label>
                    <input
                        type="text"
                        placeholder="Search title or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                    />
                </div>

                {/* Sale / Pre-Selling Toggle */}
                <div className="space-y-2">
                    <label className="block font-medium text-gray-700">Availability</label>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setIsPresell(false)}
                            className={`flex-1 py-2 font-semibold ${
                                !isPresell ? "bg-primary text-white" : "bg-white text-gray-800"
                            }`}
                        >
                            For Sale
                        </button>
                        <button
                            onClick={() => setIsPresell(true)}
                            className={`flex-1 py-2 font-semibold ${
                                isPresell ? "bg-primary text-white" : "bg-white text-gray-800"
                            }`}
                        >
                            Pre‑Selling
                        </button>
                    </div>
                </div>

                {/* Property Types */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Property Type</h4>
                    <ul className="space-y-2 pl-1">
                        {allTypes.map((t) => (
                            <li key={t}>
                                <CheckboxFilter
                                    label={t}
                                    value={t}
                                    checked={selectedTypes.includes(t)}
                                    onChange={handleTypeChange}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 border-b pb-1">Price Range (₱)</h4>
                    <div className="flex flex-col gap-3">
                        <p className='text-gray-400'>From</p>
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg"
                        />
                        <p className='text-gray-400'>To</p>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </aside>


            {/* Main Content */}
            <main
                className="flex-1 pt-20  px-6 flex flex-col"
                style={{ height: "calc(100vh - 60px)" }} // accounts for 60px navbar
            >
                <div className="mb-4 h-64 border rounded overflow-hidden">
                    <DisplayMap properties={propertiesWithMap} />
                </div>

                {/* Controls: Grid/List + Sort */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-4 py-2 rounded ${
                                viewMode === "grid" ? "bg-primary text-white" : "bg-gray-200"
                            }`}
                        >
                            Grid View
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-4 py-2 rounded ${
                                viewMode === "list" ? "bg-primary text-white" : "bg-gray-200"
                            }`}
                        >
                            List View
                        </button>
                    </div>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="py-1.5 border border-gray-400 rounded text-primary"
                        aria-label="Sort properties by price"
                    >
                        <option value="default">Sort By</option>
                        <option value="low-to-high">Price: Low to High</option>
                        <option value="high-to-low">Price: High to Low</option>
                    </select>
                </div>

                {/* Scrollable property list/grid */}
                <div className="flex-1 overflow-y-auto">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                            {sortedProperties.length === 0 && <p>No matching properties.</p>}

                            {sortedProperties.map((p) => (
                                <div key={p.id} className="flex flex-col">
                                    <div className="flex-1">
                                        <PropertyCard property={p} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedProperties.length === 0 && <p>No matching properties.</p>}

                            {sortedProperties.map((p) => (
                                <PropertyListCard key={p.id} property={p} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
