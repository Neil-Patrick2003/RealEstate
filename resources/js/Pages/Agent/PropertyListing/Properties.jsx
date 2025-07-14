import AgentLayout from "@/Layouts/AgentLayout.jsx";
import dayjs from "dayjs";
import React, { useEffect, useState, useRef } from "react";
import { Link, router } from "@inertiajs/react";
import AgentPropertyListingFilterTab from "@/Components/tabs/AgentPropertyListingFIlterTab.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";

export default function Properties({
                                       properties,
                                       propertiesCount,
                                       forPublishCount,
                                       publishedCount,
                                       soldCount,
                                       itemsPerPage = 10,
                                       status = 'All',
                                       page = 1,
                                       search = ''
                                   }) {
    const statusStyles = {
        accepted: 'bg-green-100 text-green-700 ring-green-200',
        rejected: 'bg-red-100 text-red-700 ring-red-200',
        pending: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
        cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
        default: 'bg-orange-100 text-orange-700 ring-orange-200'
    };

    const [selectedStatus, setSelectedStatus] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedProperty, setSelectedProperty] = useState('');

    // Filters state
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [propertyType, setPropertyType] = useState('');
    const [subType, setSubType] = useState('');
    const [location, setLocation] = useState('');

    const imageUrl = '/storage/';

    // Update searchTerm if prop changes
    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    // Debounced filter function to call router.get once filters stop changing
    const debouncedFilter = useRef(
        debounce((params) => {
            router.get('/agents/my-listings', params, {
                preserveState: true,
                replace: true,
            });
        }, 500)
    ).current;

    // Helper to trigger filter with current states merged with any updates
    const handleFiltersChange = (newFilters = {}) => {
        const params = {
            page: 1,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
            property_type: propertyType,
            sub_type: subType,
            location,
            ...newFilters,
        };
        debouncedFilter(params);
    };

    // Handlers for each filter input
    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        handleFiltersChange({ search: value });
    };

    const handlePropertyTypeChange = (e) => {
        setPropertyType(e.target.value);
        handleFiltersChange({ property_type: e.target.value });
    };

    const handleSubTypeChange = (e) => {
        setSubType(e.target.value);
        handleFiltersChange({ sub_type: e.target.value });
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
        handleFiltersChange({ location: e.target.value });
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = e.target.value;
        setSelectedItemsPerPage(newItemsPerPage);
        router.get('/agents/my-listings', {
            page: 1,
            items_per_page: newItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
            property_type: propertyType,
            sub_type: subType,
            location,
        }, { preserveState: true, replace: true });
    };

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedFilter.cancel();
        };
    }, []);

    return (
        <AgentLayout>
            <div className="px-2 py-2   ">
                <h1 className="text-2xl font-bold mb-4">My Property Listings</h1>
                <p className="text-gray-700 mb-6 text-sm  md:text-medium font-sans">
                    This is the agent dashboard page where you can view and manage the property listings you handle for sellers. Keep track of active, pending, or sold properties easily from here.
                </p>
                <div className='border border-gray-100 rounded-xl'>
                    <div className="rounded-t-xl shadow-sm">
                        <AgentPropertyListingFilterTab
                            count={[propertiesCount, forPublishCount, publishedCount, soldCount]}
                            selectedStatus={selectedStatus}
                            setSelectedStatus={setSelectedStatus}
                            page={page}
                            selectedItemsPerPage={selectedItemsPerPage}
                            search={searchTerm}
                            propertyType={propertyType}
                            subType={subType}
                            location={location}
                        />

                        {/* Filter Row */}
                        <div className='p-6 flex flex-wrap md:flex-row gap-4 relative z-30'>
                            {/* Search Input */}
                            <div className="relative w-full md:w-1/4">
                                <input
                                    value={searchTerm}
                                    onChange={(e) => handleSearchTermChange(e.target.value)}
                                    type="text"
                                    name="search"
                                    placeholder="Search..."
                                    className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            </div>

                            {/* Property Type Select */}
                            <select
                                className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto'
                                value={propertyType}
                                onChange={handlePropertyTypeChange}
                            >
                                <option value=''>Property Type</option>
                                <option value='house'>House</option>
                                <option value='apartment'>Apartment</option>
                                <option value='condo'>Condo</option>
                                {/* Add more options as needed */}
                            </select>

                            {/* Property Subtype Select */}
                            <select
                                className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto'
                                value={subType}
                                onChange={handleSubTypeChange}
                            >
                                <option value=''>Property Subtype</option>
                                <option value='detached'>Detached</option>
                                <option value='semi-detached'>Semi-Detached</option>
                                <option value='townhouse'>Townhouse</option>
                                {/* Add more options as needed */}
                            </select>

                            {/* Location Select */}
                            <select
                                className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto'
                                value={location}
                                onChange={handleLocationChange}
                            >
                                <option value=''>Location</option>
                                <option value='new-york'>New York</option>
                                <option value='los-angeles'>Los Angeles</option>
                                <option value='chicago'>Chicago</option>
                                {/* Add more options as needed */}
                            </select>

                            {/* Items Per Page Select */}

                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto h-[45vh] bg-white scrollbar-thumb-gray-300 scrollbar-track-transparent   [overflow:scroll]">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                            <tr>
                                <th className="p-3 text-center">
                                    <input id='deleteAll' type="checkbox" className="rounded border-gray-400" />
                                </th>
                                <th className="p-3">Image</th>
                                <th className="p-3">Seller</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Address</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Size(m2)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Date Inquired</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {properties?.data.length > 0 ? (
                                properties.data.map((property) => {
                                    const statusClass = statusStyles[property.status] || statusStyles.default;

                                    return (
                                        <tr key={property.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                            <td className="p-3 text-center hidden md:table-cell">
                                                <input id={property.id} type="checkbox" className="rounded border-gray-400" />
                                            </td>
                                            <td className="p-3 md:table-cell">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`${imageUrl}${property.property.image_url}`}
                                                        onError={(e) => e.target.src = '/placeholder.png'}
                                                        alt={property.property.title}
                                                        className="w-14 h-14 object-cover rounded-md"
                                                    />
                                                    <div className="flex max-w-[10rem] flex-col">
                                                        <p className="font-semibold truncate text-gray-800" title={property.property.title}>
                                                            {property.property.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate" title={`${property.property.property_type} | ${property.property.sub_type}`}>
                                                            {property.property.property_type} | {property.property.sub_type}
                                                        </p>
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                <p className="flex flex-col cursor-pointer font-bold hover:underline text-primary">
                                                    {property.seller.name}
                                                    <span className='font-medium text-xs'>{property.seller.email}</span>
                                                </p>
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {property.property.property_type} | {property.property.sub_type}
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {property.property.address}
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">

                                                ₱ {property.property.price}
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {property.property?.lot_area} m2
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {dayjs(property.created_at).format('MMMM D, YYYY')}
                                            </td>
                                            <td className="p-3 text-right md:table-cell">
                                                <Link href={`/agents/my-listings/${property.id}`}>View</Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-6 text-gray-400">
                                        No properties found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap gap-2 justify-end p-4 border-dashed border-t ">

                        {properties?.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm rounded-md border transition ${
                                        link.active
                                            ? 'bg-gray-500 text-white font-semibold'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}

                        <select
                            className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto ml-auto'
                            value={selectedItemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>


            </div>
        </AgentLayout>
    );
}
