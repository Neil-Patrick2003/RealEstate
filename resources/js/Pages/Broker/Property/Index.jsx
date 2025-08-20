import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { Link, router } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import BrokerPropertyTabFilter from "@/Components/tabs/BrokerProeprtyTabFilter.jsx";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faEllipsisVertical,
    faEye,
    faPen,
    faSearch,
    faTrash,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "@/Components/Dropdown.jsx";
import AssignAgentModal from "@/Components/modal/Broker/AssignAgentModal.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";

export default function Index({
                                  properties,
                                  allCount,
                                  publishedCount,
                                  unpublishedCount,
                                  itemsPerPage = 10,
                                  status = "All",
                                  page = 1,
                                  search = "",
                                  agents
                              }) {
    const imageUrl = "/storage/";
    const statusStyles = {
        accepted: "bg-green-100 text-green-700 ring-green-200",
        rejected: "bg-red-100 text-red-700 ring-red-200",
        pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
        cancelled: "bg-gray-100 text-gray-700 ring-gray-200",
        default: "bg-orange-100 text-orange-700 ring-orange-200"
    };

    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [openUnpublishModal, setOpenUnpublishModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedSort, setSelectedSort] = useState("latest");
    const [searchTerm, setSearchTerm] = useState(search);
    const [openAssignAgentModal, setOpenAssignAgentModal] = useState(false);

    const debouncedFilter = useRef(
        debounce(params => {
            router.get("/broker/properties", params, { preserveState: true, replace: true });
        }, 500)
    ).current;

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    useEffect(() => () => debouncedFilter.cancel(), []);

    const handleFiltersChange = newFilters => {
        debouncedFilter({
            page,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
            sort: selectedSort,
            ...newFilters
        });
    };

    const handlePublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(`/broker/properties/${selectedPropertyId}/publish`, {}, {
            onSuccess: () => {
                setSelectedPropertyId(null);
                setOpenPublishModal(false);
                setLoading(false);
            }
        });
    };

    const handleUnpublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(`/broker/properties/${selectedPropertyId}/unpublish`, {}, {
            onSuccess: () => {
                setSelectedPropertyId(null);
                setOpenUnpublishModal(false);
                setLoading(false);
            }
        });
    };

    const pages = [
        { name: 'Properties', href: '/broker/properties', current: true },
    ];

    return (
        <BrokerLayout>
            <Breadcrumb pages={pages} />
            <AssignAgentModal
                openAssignAgentModal={openAssignAgentModal}
                setOpenAssignAgentModal={setOpenAssignAgentModal}
                agents={agents}
                selectedPropertyId={selectedPropertyId}
            />

            <ConfirmDialog
                open={openPublishModal}
                setOpen={setOpenPublishModal}
                title="Confirm Publish"
                description="Are you sure you want to publish this property?"
                confirmText="Publish"
                cancelText="Cancel"
                onConfirm={handlePublished}
                loading={loading}
            />
            <ConfirmDialog
                open={openUnpublishModal}
                setOpen={setOpenUnpublishModal}
                title="Confirm Unpublish"
                description="Are you sure you want to unpublish this property?"
                confirmText="Unpublish"
                cancelText="Cancel"
                onConfirm={handleUnpublished}
                loading={loading}
            />

            <div className="flex justify-between items-center mb-4 border border-gray-100 p-4 md:pb-6">
                <h1 className="text-primary text-2xl font-bold">Properties</h1>
                <Link
                    href="/broker/properties/create"
                    className="text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                >
                    Add Property
                </Link>
            </div>

            <div className="rounded-t-xl border border-gray-100 shadow-sm mb-4">
                <BrokerPropertyTabFilter
                    selectedItemsPerPage={selectedItemsPerPage}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    page={page}
                    count={[allCount, publishedCount, unpublishedCount]}
                />
                <div className="p-4 md:p-6 flex flex-wrap gap-4 justify-between">
                    <div className="relative w-full md:w-1/4">
                        <input
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                handleFiltersChange({ search: e.target.value });
                            }}
                            type="text"
                            placeholder="Search by title, agent, or address..."
                            className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-700 w-full focus:ring-1 focus:ring-primary"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={selectedSort}
                            onChange={e => {
                                setSelectedSort(e.target.value);
                                handleFiltersChange({ sort: e.target.value });
                            }}
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-700 bg-white focus:ring-1 focus:ring-primary"
                        >
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </select>
                        <select
                            value={selectedItemsPerPage}
                            onChange={e => {
                                setSelectedItemsPerPage(e.target.value);
                                router.get("/broker/properties", {
                                    page: 1,
                                    items_per_page: e.target.value,
                                    status: selectedStatus,
                                    search: searchTerm,
                                    sort: selectedSort
                                }, {
                                    preserveState: true,
                                    replace: true
                                });
                            }}
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-700 bg-white focus:ring-1 focus:ring-primary"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] bg-white border border-gray-100 shadow-sm scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
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
                    <tbody className="divide-y divide-dashed">
                    {properties?.data?.length > 0 ? properties.data.map(property => {
                        const statusClass = statusStyles[property.status.toLowerCase()] || statusStyles.default;
                        return (
                            <tr key={property.id} className="flex flex-col md:table-row hover:bg-gray-50">
                                <td className="p-3 text-center hidden md:table-cell"><input type="checkbox" /></td>
                                <td className="p-3 md:table-cell">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`${imageUrl}${property.property.image_url}`}
                                            alt={property.property.title}
                                            className="w-14 h-14 object-cover rounded-md"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-700">{property.property.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {property.property.property_type} | {property.property.sub_type}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 md:table-cell">
                                    {property.agents?.length ? (
                                        <div className="flex items-center -space-x-2 overflow-hidden">
                                            {property.agents.map((agent, idx) =>
                                                agent.photo_url ? (
                                                    <img
                                                        key={idx}
                                                        src={`/storage/${agent.photo_url}`}
                                                        alt={agent.name}
                                                        title={agent.name}
                                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm hover:scale-105 transition-transform duration-200"
                                                    />
                                                ) : (
                                                    <div
                                                        key={idx}
                                                        title={agent.name}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-white text-xs font-semibold ring-2 ring-white"
                                                    >
                                                        {agent.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-sm">No agents assigned</span>
                                    )}
                                </td>
                                <td className="p-3 md:table-cell text-gray-700">
                                        {property.property.isPresell !== 1 ? (
                                        <span className="bg-green-100 text-green-700 ring-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                                                        For Sale
                                                    </span>
                                    ) : (
                                        <span className="bg-orange-100 text-orange-700 ring-orange-200 px-2 py-1 rounded-full text-xs font-semibold">
                                                        Pre-Sale
                                                    </span>
                                    )}

                                </td>
                                <td className="p-3 md:table-cell text-gray-700">
                                    {property.property.address}
                                </td>
                                <td className="p-3 md:table-cell text-gray-700">
                                    ₱ {property.property.price.toLocaleString()}
                                </td>
                                <td className="p-3 md:table-cell text-gray-700">
                                    {property.property?.lot_area} {property.property?.floor_area} m²
                                </td>
                                <td className="p-3 md:table-cell relative">
                                    <select
                                        value={property.status}
                                        onChange={e => {
                                            setSelectedPropertyId(property.id);
                                            if (e.target.value === "Published") {
                                                setOpenPublishModal(true);
                                            } else {
                                                setOpenUnpublishModal(true);
                                            }
                                        }}
                                        className={`bg-white text-gray-700 text-xs font-medium rounded-full px-3 py-1 pr-6 ring-1 ${statusClass} appearance-none cursor-pointer`}
                                    >
                                        <option value="Unpublished">Unpublished</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </td>
                                <td className="p-3 text-right md:table-cell">
                                    <div className="flex flex-wrap md:flex-nowrap justify-end items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setOpenAssignAgentModal(true);
                                                setSelectedPropertyId(property.id);
                                            }}
                                            title="Assign Agent"
                                            className="flex items-center justify-center px-2.5 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition"
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
                                        </button>
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    title="More actions"
                                                    className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition"
                                                >
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content
                                                align="right"
                                                width="32"
                                                contentClasses="bg-white ring-1 ring-gray-200 shadow-md"
                                            >
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
                                                        onClick={() => {
                                                            // Handle delete logic
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition rounded"
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
                            <td className="p-6 text-center text-gray-500" colSpan="9">
                                No properties found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t border-gray-100 shadow-sm rounded-b-xl">
                {properties?.links.map((link, idx) => (
                    link.url ? (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`px-3 py-2 rounded-md text-sm border transition ${
                                link.active ? "bg-primary text-white font-semibold" : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={idx}
                            className="px-3 py-2 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        </BrokerLayout>
    );
}
