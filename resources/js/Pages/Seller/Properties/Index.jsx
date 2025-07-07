// Import necessary components and libraries
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EllipsisVertical, Search } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import SellerPropertiesFilterTab from '@/Components/tabs/SellerPropetiesFilterTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faExpand, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from '@/Components/modal/ConfirmDialog';

// Main component
const Index = ({
                   properties,
                   search = '',
                   page = 1,
                   itemsPerPage = 10,
                   status = '',
                   all,
                   assigned,
                   rejected,
                   unassigned,
                    published
               }) => {
    // Local state for search, pagination, status
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(Number(itemsPerPage));
    const [selectedStatus, setSelectedStatus] = useState(status || 'All');

    // State for delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Sync props changes into state
    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    useEffect(() => {
        if (status) setSelectedStatus(status);
    }, [status]);

    // Helper function to fetch properties with current filters
    const fetchProperties = (searchValue = searchTerm, statusValue = selectedStatus, itemsPerPageValue = selectedItemsPerPage, pageValue = page) => {
        router.get(
            '/properties',
            { page: pageValue, search: searchValue, items_per_page: itemsPerPageValue, status: statusValue },
            { preserveState: true, replace: true }
        );
    };

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((value) => {
            fetchProperties(value, selectedStatus, selectedItemsPerPage, 1);
        }, 500),
        [selectedStatus, selectedItemsPerPage]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    // Handle search input changes
    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle items per page changes
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = Number(e.target.value);
        setSelectedItemsPerPage(newItemsPerPage);
        fetchProperties(searchTerm, selectedStatus, newItemsPerPage, 1);
    };

    // Handle status change from filter tab (sync and fetch)
    useEffect(() => {
        fetchProperties(searchTerm, selectedStatus, selectedItemsPerPage, 1);
    }, [selectedStatus]);

    // Delete dialog handlers
    const handleOpenDeleteDialog = (id) => {
        setOpenDeleteDialog(true);
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (!deletingId) return;

        router.delete(`/properties/${deletingId}`, {
            onSuccess: () => {
                setDeletingId(null);
                setOpenDeleteDialog(false);
            },
        });
    };

    // Styling classes for status badges
    const getStatusClasses = (status) => {
        switch (status.toLowerCase()) {
            case 'to published':
                return 'bg-lightaccent text-yellow-700 ring-yellow-200';
            case 'published':
                return 'bg-green-100 text-green-700 ring-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 ring-red-200';
            case 'sold':
                return 'bg-gray-100 text-gray-700 ring-gray-200';
            default:
                return 'bg-orange-100 text-orange-700 ring-orange-200'; // fallback
        }
    };

    const imageUrl = '/storage/'; // Base path for property images

    return (
        <AuthenticatedLayout>
            <ConfirmDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                title="Delete Image"
                description="Are you sure you want to delete this image?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                loading={false}
            />

            <div className="max-w-9xl mx-auto space-y-6">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
                        <p className="text-sm text-gray-500">Manage your properties here.</p>
                    </div>
                    <Link href="/post-property">
                        <button
                            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent shadow-sm"
                            aria-label="Add Property"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add Property
                        </button>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex min-h-[50vh] flex-col mt-6     bg-white rounded-t-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-100 rounded-t-xl">
                        <div className="w-full md:w-auto overflow-x-auto">
                            <SellerPropertiesFilterTab
                                count={[all, published, unassigned, assigned, rejected]}
                                selectedStatus={selectedStatus}
                                setSelectedStatus={setSelectedStatus}
                                searchTerm={searchTerm}
                                page={page}
                                selectedItemsPerPage={selectedItemsPerPage}
                            />
                        </div>
                        <div className="relative w-full md:w-96">
                            <input
                                type="search"
                                value={searchTerm}
                                name="searchProperty"
                                onChange={(e) => handleSearchTermChange(e.target.value)}
                                placeholder="Search properties..."
                                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                aria-label="Search properties"
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    {/* Properties Table */}
                    <div className="bg-white border border-gray-100">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="p-3 text-center">
                                    <input
                                        type="checkbox"
                                        id="deleteAll"
                                        className="rounded border-gray-400"
                                        aria-label="Select all properties"
                                        // TODO: Add select all logic here
                                    />
                                </th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">
                                    Size<span className="lowercase">(m2)</span>
                                </th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {properties.data.length > 0 ? (
                                properties.data.map((property) => (
                                    <tr key={property.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                id={`property_${property.id}`}
                                                className="rounded border-gray-400"
                                                aria-label={`Select property ${property.title}`}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={property?.image_url ? `${imageUrl}${property.image_url}` : '/fallback-image.png'}
                                                    alt={`Property image for ${property.title}`}
                                                    className="w-14 h-14 object-cover rounded-md"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-image.png';
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{property.title}</p>
                                                    <p className="text-xs text-gray-500">{property.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            {property.property_type}, {property.sub_type}
                                        </td>
                                        <td className="p-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                            {property.description}
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{property.price}</td>
                                        <td className="p-3">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${getStatusClasses(
                                                    property.status
                                                )}`}
                                            >
                                              {property.status}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            {property.property_type === 'land' ? property?.lot : property?.floor_area} m2
                                        </td>
                                        <td className="p-3 text-right">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <div
                                                        className="p-2 w-9 rounded-full hover:bg-gray-200 cursor-pointer"
                                                        aria-label={`Open actions menu for ${property.title}`}
                                                    >
                                                        <EllipsisVertical size={20} className="text-gray-600" />
                                                    </div>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content className="absolute right-0 top-10 w-36 bg-white shadow-md rounded-md z-50 text-sm">
                                                    <ul className="divide-y divide-gray-100">
                                                        <Link href={`/properties/${property.id}`}>
                                                            <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                                <FontAwesomeIcon icon={faExpand} /> View
                                                            </li>
                                                        </Link>
                                                        <Link href={`/properties/${property.id}/edit`}>
                                                            <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                                            </li>
                                                        </Link>
                                                        <li
                                                            onClick={() => handleOpenDeleteDialog(property.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') handleOpenDeleteDialog(property.id);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrashCan} /> Delete
                                                        </li>
                                                    </ul>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-400">
                                        No properties found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination & Items per page */}
                <div className="flex flex-col md:flex-row border border-gray-100 rounded-b-xl p-4 items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">
                            Items per page:
                        </label>
                        <select
                            id="selectedItemsPerPage"
                            value={selectedItemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border-gray-300 rounded-md text-sm"
                            aria-label="Select items per page"
                        >
                            {[5, 10, 15, 20].map((val) => (
                                <option key={val} value={val}>
                                    {val}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 flex-wrap border justify-end"  aria-label="Pagination navigation">
                        {properties.links.map((link, i) => {
                            const query = new URLSearchParams({
                                search: searchTerm || '',
                                status: selectedStatus || '',
                                items_per_page: selectedItemsPerPage,
                            });
                            const urlWithParams = link.url ? `${link.url}&${query.toString()}` : null;

                            return link.url ? (
                                <Link
                                    key={i}
                                    href={urlWithParams}
                                    className={`px-4 py-2 text-sm rounded-md border transition ${
                                        link.active ? 'bg-primary text-white font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    aria-current={link.active ? 'page' : undefined}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    aria-disabled="true"
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
