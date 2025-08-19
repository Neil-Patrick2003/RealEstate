import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { Link, router } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import BrokerPropertyTabFilter from "@/Components/tabs/BrokerProeprtyTabFilter.jsx";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEllipsisVertical, faEye, faPen, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "@/Components/Dropdown.jsx";
import AssignAgentModal from "@/Components/modal/Broker/AssignAgentModal.jsx"

export default function Index({ properties, allCount, assignedCount, publishedCount, unpublishedCount, itemsPerPage = 10, status = "All", page = 1, search = "", agents }) {
    const imageUrl = "/storage/";
    const statusStyles = {
        accepted: "bg-green-100 text-green-700 ring-green-200",
        rejected: "bg-red-100 text-red-700 ring-red-200",
        pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
        cancelled: "bg-gray-100 text-gray-700 ring-gray-200",
        default: "bg-orange-100 text-orange-700 ring-orange-200",
    };

    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [openUnpublishModal, setOpenUnpublishModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedSort, setSelectedSort] = useState("latest");
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [openAssignAgentModal, setOpenAssignAgentModal] = useState(false);

    const debouncedFilter = useRef(debounce(params => {
        router.get("/broker/properties", params, { preserveState: true, replace: true });
    }, 500)).current;

    useEffect(() => { if (search) setSearchTerm(search); }, [search]);
    useEffect(() => () => debouncedFilter.cancel(), []);

    const handleFiltersChange = newFilters => {
        const params = {
            page,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
            sort: selectedSort,
            ...newFilters,
        };
        debouncedFilter(params);
    };

    const handleSearchTermChange = value => { setSearchTerm(value); handleFiltersChange({ search: value }); };
    const handleSortChange = e => { setSelectedSort(e.target.value); handleFiltersChange({ sort: e.target.value }); };
    const handleItemsPerPageChange = e => {
        setSelectedItemsPerPage(e.target.value);
        router.get("/broker/properties", {
            page: 1,
            items_per_page: e.target.value,
            status: selectedStatus,
            search: searchTerm,
            sort: selectedSort,
        }, { preserveState: true, replace: true });
    };

    const handlePublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(`/broker/properties/${selectedPropertyId}/publish`, {}, {
            onSuccess: () => { setSelectedPropertyId(null); setOpenPublishModal(false); setLoading(false); }
        });
    };

    const handleUnpublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(`/broker/properties/${selectedPropertyId}/unpublish`, {}, {
            onSuccess: () => { setSelectedPropertyId(null); setOpenUnpublishModal(false); setLoading(false); }
        });
    };

    return (
        <BrokerLayout>

            <AssignAgentModal openAssignAgentModal={openAssignAgentModal} setOpenAssignAgentModal={setOpenAssignAgentModal} agents={agents} selectedPropertyId={selectedPropertyId} />
            <ConfirmDialog {...{ open: openPublishModal, setOpen: setOpenPublishModal, title: "Confirm Publish", description: "Are you sure you want to publish this property?", confirmText: "Publish", cancelText: "Cancel", onConfirm: handlePublished, loading }} />
            <ConfirmDialog {...{ open: openUnpublishModal, setOpen: setOpenUnpublishModal, title: "Confirm Unpublish", description: "Are you sure you want to unpublish this property?", confirmText: "Unpublish", cancelText: "Cancel", onConfirm: handleUnpublished, loading }} />

            <div className='flex-center-between'>
                <h1 className="text-primary text-xl font-bold mb-4  ">Properties</h1>
                <Link href='/broker/properties/create'>Add Properties</Link>
            </div>

            {/* Tab Filters */}
            <div className="rounded-t-xl border border-gray-100 shadow-sm ">
                <BrokerPropertyTabFilter
                    selectedItemsPerPage={selectedItemsPerPage}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    page={page}
                    count={[allCount, publishedCount, assignedCount, unpublishedCount]}
                />

                {/* Filters */}
                <div className="p-6 flex flex-wrap md:flex-row gap-4 justify-between relative z-30">
                    <div className="relative w-full md:w-1/4">
                        <input
                            value={searchTerm}
                            onChange={e => handleSearchTermChange(e.target.value)}
                            type="text"
                            placeholder="Search by title, agent, or address..."
                            className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                    <div className='flex gap-2'>
                        <select className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto" value={selectedSort} onChange={handleSortChange}>
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                        <select className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto" value={selectedItemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Properties Table */}
            <div className="overflow-x-auto min-h-[55vh] bg-white border border-gray-100 scrollbar-thumb-gray-300 shadow-sm  scrollbar-track-transparent max-h-[56vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group sticky top-0 z-20 shadow-sm">
                    <tr>
                        <th className="p-3 text-center"><input type="checkbox" /></th>
                        <th className="p-3 text-start">Property</th>
                        <th className="p-3 text-start">Agent(s)</th>
                        <th className="p-3 text-start">Type</th>
                        <th className="p-3 text-start">Address</th>
                        <th className="p-3 text-start">Price</th>
                        <th className="p-3 text-start">Size</th>
                        <th className="p-3 text-start">Status</th>
                        <th className="p-3 text-start">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed ">
                    {properties?.data?.length > 0 ? properties?.data?.map(property => {
                        const statusClass = statusStyles[property.status] || statusStyles.default;
                        return (
                            <tr key={property.id} className="flex flex-col md:table-row hover:bg-gray-50">
                                <td className="p-3 text-center hidden md:table-cell"><input type="checkbox" /></td>
                                <td className="p-3 md:table-cell">
                                    <div className="flex items-center gap-3">
                                        <img src={`${imageUrl}${property.property.image_url}`} alt="" className="w-14 h-14 object-cover rounded-md" />
                                        <div>
                                            <p className="font-semibold">{property.property.title}</p>
                                            <p className="text-xs text-gray-500">{property.property.property_type} | {property.property.sub_type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 md:table-cell">
                                    {property.agent?.length > 0
                                        ? property.agent.map((a, i) => <span key={i}>{a.name}{i < property.agent.length - 1 && ', '}</span>)
                                        : 'No agents assigned'
                                    }
                                </td>
                                <td className="p-3 md:table-cell">{property.property.property_type} | {property.property.sub_type}</td>
                                <td className="p-3 md:table-cell">{property.property.address}</td>
                                <td className="p-3 md:table-cell">₱ {property.property.price}</td>
                                <td className="p-3 md:table-cell">{property.property.lot_area} m²</td>
                                <td className="p-3 md:table-cell">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>
                                            {property.status}
                                        </span>
                                </td>
                                <td className="p-3 text-right md:table-cell">
                                    <div className="flex flex-col md:flex-row md:justify-end md:space-x-2 space-y-2 md:space-y-0">
                                        {/* Publish / Unpublish Button */}
                                        {property.status === "Published" ? (
                                            <button
                                                className="border px-4 py-2 bg-secondary w-full md:w-24 rounded-md text-white text-sm"
                                                onClick={() => {
                                                    setSelectedPropertyId(property.id);
                                                    setOpenUnpublishModal(true);
                                                }}
                                            >
                                                Unpublish
                                            </button>
                                        ) : (
                                            <button
                                                className="border px-4 py-2 bg-primary w-full md:w-24 rounded-md text-white text-sm"
                                                onClick={() => {
                                                    setSelectedPropertyId(property.id);
                                                    setOpenPublishModal(true);
                                                }}
                                            >
                                                Publish
                                            </button>
                                        )}

                                        <button onClick={() => {
                                            setOpenAssignAgentModal(true);
                                            setSelectedPropertyId(property.id);
                                        }}>Assign Agent</button>

                                        {/* Dropdown Menu */}
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition">
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content align="right" width="32" contentClasses="bg-white ring-1 ring-gray-200 shadow-md">
                                                <div className="w-32 py-1 text-sm text-gray-700">
                                                    <Link
                                                        href={`/broker/properties/${property.id}`}
                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-gray-500" />
                                                        <span>View</span>
                                                    </Link>

                                                    <Link
                                                        href={`/broker/properties/${property.id}/edit`}
                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-gray-500" />
                                                        <span>Edit</span>
                                                    </Link>

                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 text-red-600 hover:text-red-700 transition rounded"
                                                        onClick={() => {
                                                            // Handle delete logic
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </td>

                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="10" className="py-6 text-center text-gray-400">No properties found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap gap-2 justify-center items-center p-4 border border-gray-100  shadow-sm rounded-b-xl">
                {properties?.links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            className={`px-4 py-2 text-sm rounded-md border transition ${link.active ? "bg-gray-500 text-white font-semibold" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span key={i} className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed" dangerouslySetInnerHTML={{ __html: link.label }} />
                    )
                ))}

            </div>
        </BrokerLayout>
    );
}
