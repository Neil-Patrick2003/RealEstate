    import Dropdown from '@/Components/Dropdown';
    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
    import { EllipsisVertical, Search as SearchIcon } from 'lucide-react';
    import React, { useEffect, useState, useCallback } from 'react';
    import { Link, router } from '@inertiajs/react';
    import { debounce } from 'lodash';
    import SellerPropertiesFilterTab from '@/Components/tabs/SellerPropetiesFilterTab';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faPlus, faPenToSquare, faExpand, faTrashCan } from '@fortawesome/free-solid-svg-icons';
    import ConfirmDialog from '@/Components/modal/ConfirmDialog';

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
                       published,
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
        const fetchProperties = useCallback((searchValue = searchTerm, statusValue = selectedStatus, itemsPerPageValue = selectedItemsPerPage, pageValue = page) => {
            if (!router) return; // protect against undefined

            try {
                router.get(
                    '/seller/properties',
                    {
                        page: pageValue,
                        search: searchValue,
                        items_per_page: itemsPerPageValue,
                        status: statusValue,
                    },
                    {
                        preserveState: true,
                        replace: true,
                    }
                );
            } catch (err) {
                console.error('Failed to fetch properties:', err);
            }
        }, [searchTerm, selectedStatus, selectedItemsPerPage, page]);


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

            router.delete(`/seller/properties/${deletingId}`, {
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
                    return 'bg-lightaccent text-yellow-700';
                case 'published':
                    return 'bg-green-100 text-green-700';
                case 'rejected':
                    return 'bg-red-100 text-red-700';
                case 'sold':
                    return 'bg-gray-100 text-gray-700';
                default:
                    return 'bg-orange-100 text-orange-700';
            }
        };

        const imageUrl = '/storage/'; // Base path for property images

        return (
            <AuthenticatedLayout>
                <ConfirmDialog
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    title="Delete Property"
                    description="Are you sure you want to delete this property?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleDelete}
                    loading={false}
                />

                <div className="max-w-9xl mx-auto space-y-6 p-4 md:p-0">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Properties</h1>
                        </div>
                        <Link href="/post-property">
                            <button
                                className="inline-flex items-center gap-2 bg-primary text-white px-4 md:px-5 py-2 rounded-md text-sm md:text-base font-medium hover:bg-accent shadow-sm"
                                aria-label="Add Property"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Property
                            </button>
                        </Link>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col mt-6 shadow bg-white rounded-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-100 rounded-t-xl p-4 md:p-6">
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
                            <div className="relative w-full md:w-96 mt-4 md:mt-0">
                                <input
                                    type="search"
                                    id='search'
                                    value={searchTerm}
                                    name="searchProperty"
                                    onChange={(e) => handleSearchTermChange(e.target.value)}
                                    placeholder="Search properties..."
                                    className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 text-sm md:text-base text-gray-700 placeholder-gray-400 focus:ring-primary focus:outline-none"
                                    aria-label="Search properties"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Properties Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-center">
                                        <input type="checkbox" id='allId' className="rounded border-gray-400" aria-label="Select all properties" />
                                    </th>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">
                                        Size <span className="lowercase">(m²)</span>
                                    </th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed">
                                {properties.data.length > 0 ? (
                                    properties.data.map((property) => (
                                        <tr key={property.id} className="hover:bg-gray-50">
                                            <td className="p-3 text-center">
                                                <input  id={property.id} type="checkbox"  className="rounded border-gray-400" />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={property.image_url ? `${imageUrl}${property.image_url}` : '/fallback-image.png'}
                                                        alt={property.title}
                                                        className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-md"
                                                        onError={(e) => (e.currentTarget.src = '/fallback-image.png')}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{property.title}</p>
                                                        <p className="text-xs md:text-sm text-gray-500">{property.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">{property.property_type}, {property.sub_type}</td>
                                            <td className="p-3">
                                                <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[250px]">
                                                    {property.description}
                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">₱ {property.price}</td>
                                            <td className="p-3">
                            <span className={`inline-block font-semibold px-3 py-1 rounded-md text-xs ${getStatusClasses(property.status)}`}>
                              {property.status}
                            </span>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                {property.property_type === 'land' ? property.lot : property.floor_area} m²
                                            </td>
                                            <td className="p-3 text-right">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <div className="p-2 w-9 rounded-full hover:bg-gray-200 cursor-pointer">
                                                            <EllipsisVertical size={20} className="text-gray-600" />
                                                        </div>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content className="absolute right-0 top-10 w-36 bg-white shadow-md rounded-md z-50 text-sm">
                                                        <ul className="divide-y divide-gray-100">
                                                            <Link href={`/seller/properties/${property.id}`}>
                                                                <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                                                                    <FontAwesomeIcon icon={faExpand} /> View
                                                                </li>
                                                            </Link>
                                                            <Link href={`/seller/properties/${property.id}/edit`}>
                                                                <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                                                                    <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                                                </li>
                                                            </Link>
                                                            <li
                                                                onClick={() => handleOpenDeleteDialog(property.id)}
                                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
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

                        {/* Pagination + Items per page */}
                        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 rounded-b-xl p-4 gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">
                                    Items per page:
                                </label>
                                <select
                                    id="selectedItemsPerPage"
                                    value={selectedItemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="border border-gray-300 rounded-md text-sm"
                                >
                                    {[5, 10, 15, 20].map((val) => (
                                        <option key={val} value={val}>
                                            {val}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end" aria-label="Pagination navigation">
                                {properties.links.map((link, i) => {
                                    const query = new URLSearchParams({
                                        search: searchTerm,
                                        status: selectedStatus,
                                        items_per_page: selectedItemsPerPage,
                                    });
                                    const urlWithParams = link.url ? `${link.url}&${query.toString()}` : null;

                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={urlWithParams}
                                            className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition ${
                                                link.active ? 'bg-primary text-white font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            aria-current={link.active ? 'page' : undefined}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            aria-disabled="true"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    };

    export default Index;
