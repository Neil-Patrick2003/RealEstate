import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { Link, router } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import BrokerPropertyTabFilter from "@/Components/tabs/BrokerProeprtyTabFilter.jsx";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisVertical,
    faEye,
    faPen,
    faSearch,
    faTrash,
    faUserPlus,
    faHome,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "@/Components/Dropdown.jsx";
import AssignAgentModal from "@/Components/modal/Broker/AssignAgentModal.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

// ---------- helpers ----------
const S = (v) => (typeof v === "string" ? v : "");
const N = (v, d = 0) => (v == null || Number.isNaN(Number(v)) ? d : Number(v));
const A = (v) => (Array.isArray(v) ? v : []);

const formatPhp = (amount) =>
    N(amount) > 0
        ? N(amount).toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })
        : "—";

const AvailabilityPill = ({ isPresell }) => {
    const pre = typeof isPresell === "boolean" ? isPresell : isPresell === 1 || isPresell === "1";
    return pre ? (
        <span className="badge-warning">
            Pre-Selling
        </span>
    ) : (
        <span className="badge-success">
            For Sale
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const statusStyles = {
        Published: "badge-success",
        Unpublished: "badge-warning",
        Draft: "badge-gray",
        default: "badge-gray",
    };

    const statusKey = S(status);
    const statusClass = statusStyles[statusKey] || statusStyles.default;

    return (
        <span className={`badge ${statusClass}`}>
            {statusKey}
        </span>
    );
};

export default function Index({
                                  properties,
                                  allCount,
                                  publishedCount,
                                  unpublishedCount,
                                  itemsPerPage = 10,
                                  status = "All",
                                  page = 1,
                                  search = "",
                                  agents,
                              }) {
    const [openPublishModal, setOpenPublishModal] = useState(false);
    const [openUnpublishModal, setOpenUnpublishModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedSort, setSelectedSort] = useState("desc");
    const [searchTerm, setSearchTerm] = useState(search);

    const [openAssignAgentModal, setOpenAssignAgentModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const debouncedFilter = useRef(
        debounce((params) => {
            router.get("/broker/properties", params, { preserveState: true, replace: true });
        }, 400)
    ).current;

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    useEffect(() => () => debouncedFilter.cancel(), []);

    // Apply filters helper
    const handleFiltersChange = (newFilters) => {
        debouncedFilter({
            page,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
            sort: selectedSort,
            ...newFilters,
        });
    };

    // Keep backend in sync when status changes via tabs
    useEffect(() => {
        handleFiltersChange({ status: selectedStatus, page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus]);

    const handlePublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(
            `/broker/properties/${selectedPropertyId}/publish`,
            {},
            {
                onSuccess: () => {
                    setSelectedPropertyId(null);
                    setOpenPublishModal(false);
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleUnpublished = () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        router.patch(
            `/broker/properties/${selectedPropertyId}/unpublish`,
            {},
            {
                onSuccess: () => {
                    setSelectedPropertyId(null);
                    setOpenUnpublishModal(false);
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const pages = [{ name: "Properties", href: "/broker/properties", current: true }];

    const rows = A(properties?.data);
    const links = A(properties?.links);

    return (
        <AuthenticatedLayout>
            <Breadcrumb pages={pages} />

            {/* Assign Agent Modal */}
            <AssignAgentModal
                selectedProperty={selectedProperty?.property}
                openAssignAgentModal={openAssignAgentModal}
                setOpenAssignAgentModal={setOpenAssignAgentModal}
                agents={agents}
                selectedPropertyId={selectedPropertyId}
            />

            {/* Publish / Unpublish Confirmation Dialogs */}
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

            <div className="page-container">
                <div className="page-content space-y-6">
                    {/* Header */}
                    <div className="section">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 gradient-text">Property Portfolio</h1>
                                <p className="section-description">
                                    Manage your property listings, assign agents, and track publication status.
                                </p>
                            </div>
                            <Link
                                href="/broker/properties/create"
                                className="btn btn-primary btn-sm"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Add Property
                            </Link>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="card">
                        <BrokerPropertyTabFilter
                            selectedItemsPerPage={selectedItemsPerPage}
                            selectedStatus={selectedStatus}
                            setSelectedStatus={setSelectedStatus}
                            page={page}
                            count={[allCount, publishedCount, unpublishedCount]}
                        />
                    </div>

                    {/* Filters Card */}
                    <div className="card">
                        <div className="card-body">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleFiltersChange({ search: e.target.value, page: 1 });
                                        }}
                                        placeholder="Search by title, agent, or address..."
                                        className="form-input pl-10"
                                    />
                                </div>

                                {/* Sort + Per Page */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        aria-label="Sort by date"
                                        value={selectedSort}
                                        onChange={(e) => {
                                            setSelectedSort(e.target.value);
                                            handleFiltersChange({ sort: e.target.value, page: 1 });
                                        }}
                                        className="form-select text-sm"
                                    >
                                        <option value="desc">Date: Newest</option>
                                        <option value="asc">Date: Oldest</option>
                                    </select>

                                    <select
                                        aria-label="Items per page"
                                        value={selectedItemsPerPage}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedItemsPerPage(val);
                                            router.get(
                                                "/broker/properties",
                                                {
                                                    page: 1,
                                                    items_per_page: val,
                                                    status: selectedStatus,
                                                    search: searchTerm,
                                                    sort: selectedSort,
                                                },
                                                { preserveState: true, replace: true }
                                            );
                                        }}
                                        className="form-select text-sm"
                                    >
                                        <option value="5">5 per page</option>
                                        <option value="10">10 per page</option>
                                        <option value="20">20 per page</option>
                                        <option value="50">50 per page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Properties Table */}
                    <div className="card relative">
                        {/* Loading Overlay */}
                        {loading && (
                            <div
                                className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg"
                                aria-live="polite"
                            >
                                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg border">
                                    <div className="spinner spinner-lg" />
                                    <span className="text-sm text-gray-700 font-medium">Updating property...</span>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 text-center w-12">
                                        <input type="checkbox" className="form-checkbox" id="all" />
                                    </th>
                                    <th className="p-4 font-semibold">Property Details</th>
                                    <th className="p-4 font-semibold">Assigned Agents</th>
                                    <th className="p-4 font-semibold">Availability</th>
                                    <th className="p-4 font-semibold">Location</th>
                                    <th className="p-4 font-semibold">Price</th>
                                    <th className="p-4 font-semibold">Size</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                {rows.length > 0 ? (
                                    rows.map((row) => {
                                        const prop = row?.property || {};
                                        const agentsList = A(row?.agents);
                                        const lot = N(prop?.lot_area, null);
                                        const floor = N(prop?.floor_area, null);
                                        const sizeText =
                                            lot || floor
                                                ? `${lot ? `Lot: ${lot} m²` : ""}${lot && floor ? " • " : ""}${floor ? `Floor: ${floor} m²` : ""}`
                                                : "—";

                                        return (
                                            <tr key={row.id} className="hover:bg-gray-50 transition">
                                                {/* Checkbox */}
                                                <td className="p-4 text-center">
                                                    <input type="checkbox" className="form-checkbox" id={`row-${row.id}`} />
                                                </td>

                                                {/* Property Details */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={prop?.image_url ? `/storage/${prop.image_url}` : "/images/placeholder.jpg"}
                                                            alt={S(prop?.title) || "Property"}
                                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 line-clamp-1">
                                                                {S(prop?.title) || "Untitled Property"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {S(prop?.property_type) || "—"}
                                                                {prop?.sub_type ? ` • ${prop.sub_type}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Assigned Agents */}
                                                <td className="p-4">
                                                    {agentsList.length ? (
                                                        <div className="flex items-center -space-x-2">
                                                            {agentsList.map((agent) =>
                                                                agent?.photo_url ? (
                                                                    <img
                                                                        key={agent.id || agent.email || agent.name}
                                                                        src={`/storage/${agent.photo_url}`}
                                                                        alt={agent?.name || "Agent"}
                                                                        title={agent?.name || "Agent"}
                                                                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:scale-105 transition"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        key={agent.id || agent.email || agent.name}
                                                                        title={agent?.name || "Agent"}
                                                                        className="avatar-sm rounded-full bg-primary-600 text-white font-semibold border-2 border-white shadow-sm"
                                                                    >
                                                                        {(agent?.name?.charAt(0) || "A").toUpperCase()}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">No agents</span>
                                                    )}
                                                </td>

                                                {/* Availability */}
                                                <td className="p-4">
                                                    <AvailabilityPill isPresell={prop?.isPresell} />
                                                </td>

                                                {/* Address */}
                                                <td className="p-4">
                                                    <p className="text-gray-700 max-w-xs line-clamp-2">
                                                        {S(prop?.address) || "—"}
                                                    </p>
                                                </td>

                                                {/* Price */}
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900">{formatPhp(prop?.price)}</p>
                                                </td>

                                                {/* Size */}
                                                <td className="p-4">
                                                    <p className="text-gray-700 text-sm">{sizeText}</p>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4">
                                                    <div className="relative inline-block">
                                                        <select
                                                            id={`status-${row.id}`}
                                                            value={row?.status || "Unpublished"}
                                                            onChange={(e) => {
                                                                setSelectedPropertyId(row.id);
                                                                if (e.target.value === "Published") setOpenPublishModal(true);
                                                                else setOpenUnpublishModal(true);
                                                            }}
                                                            className={`form-select text-xs pr-6 cursor-pointer ${
                                                                row?.status === "Published"
                                                                    ? "border-green-200 bg-green-50 text-green-700"
                                                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                                            }`}
                                                            aria-label={`Set status for ${S(prop?.title) || "property"}`}
                                                        >
                                                            <option value="Unpublished">Unpublished</option>
                                                            <option value="Published">Published</option>
                                                        </select>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setOpenAssignAgentModal(true);
                                                                setSelectedProperty(row);
                                                                setSelectedPropertyId(row.id);
                                                            }}
                                                            title="Assign Agent"
                                                            className="btn btn-primary btn-sm p-2"
                                                        >
                                                            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
                                                        </button>

                                                        <Dropdown>
                                                            <Dropdown.Trigger>
                                                                <button
                                                                    title="More actions"
                                                                    className="btn btn-ghost btn-sm p-2"
                                                                >
                                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                                </button>
                                                            </Dropdown.Trigger>
                                                            <Dropdown.Content
                                                                align="right"
                                                                width="32"
                                                                contentClasses="bg-white border border-gray-200 shadow-lg rounded-lg"
                                                            >
                                                                <div className="w-36 py-1 text-sm text-gray-700">
                                                                    <Link
                                                                        href={`/broker/properties/${row.id}`}
                                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition rounded-md"
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-gray-500" />
                                                                        <span>View Details</span>
                                                                    </Link>
                                                                    <Link
                                                                        href={`/broker/properties/${row.id}/edit`}
                                                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition rounded-md"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-gray-500" />
                                                                        <span>Edit Property</span>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => {
                                                                            // TODO: implement delete confirmation + route
                                                                        }}
                                                                        className="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50 transition rounded-md"
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
                                    })
                                ) : (
                                    <tr>
                                        <td className="p-12 text-center text-gray-500" colSpan={9}>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="feature-icon bg-gray-100 text-gray-400">
                                                    <FontAwesomeIcon icon={faHome} />
                                                </div>
                                                <div className="text-lg font-medium text-gray-400">No properties found</div>
                                                <p className="text-gray-500 text-sm max-w-sm text-center">
                                                    {searchTerm
                                                        ? "No properties match your search criteria. Try adjusting your search terms."
                                                        : "Get started by adding your first property listing."
                                                    }
                                                </p>
                                                {!searchTerm && (
                                                    <Link
                                                        href="/broker/properties/create"
                                                        className="btn btn-primary btn-sm mt-2"
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                        Add First Property
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {links.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            {links.map((link, idx) =>
                                link.url ? (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`btn btn-sm ${
                                            link.active ? 'btn-primary' : 'btn-outline'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={idx}
                                        className="btn btn-outline btn-sm opacity-50 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
