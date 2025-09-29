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
} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "@/Components/Dropdown.jsx";
import AssignAgentModal from "@/Components/modal/Broker/AssignAgentModal.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";

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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 ring-1 ring-orange-200">
      Pre-Selling
    </span>
    ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 ring-1 ring-green-200">
      For Sale
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
    const [selectedSort, setSelectedSort] = useState("desc"); // newest by default
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
        <BrokerLayout>
            <Breadcrumb pages={pages} />

            {/* Assign Agent */}
            <AssignAgentModal
                selectedProperty={selectedProperty?.property}
                openAssignAgentModal={openAssignAgentModal}
                setOpenAssignAgentModal={setOpenAssignAgentModal}
                agents={agents}
                selectedPropertyId={selectedPropertyId}
            />

            {/* Publish / Unpublish confirms */}
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

            {/* Header */}
            <div className="flex justify-between items-center mb-4 border border-gray-100 rounded-xl p-4 md:pb-6 bg-white">
                <h1 className="text-primary text-2xl font-bold">Properties</h1>
                <Link
                    href="/broker/properties/create"
                    className="text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                >
                    Add Property
                </Link>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm mb-4 overflow-hidden">
                <BrokerPropertyTabFilter
                    selectedItemsPerPage={selectedItemsPerPage}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    page={page}
                    count={[allCount, publishedCount, unpublishedCount]}
                />

                <div className="p-4 md:p-6 flex flex-wrap gap-4 justify-between items-center">
                    {/* search */}
                    <div className="relative w-full md:w-1/3">
                        <input
                            id="search"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                handleFiltersChange({ search: e.target.value, page: 1 });
                            }}
                            type="text"
                            placeholder="Search by title, agent, or address..."
                            className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-700 w-full focus:ring-1 focus:ring-primary"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                    </div>

                    {/* sort + per-page */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            aria-label="Sort by date"
                            value={selectedSort}
                            onChange={(e) => {
                                setSelectedSort(e.target.value);
                                handleFiltersChange({ sort: e.target.value, page: 1 });
                            }}
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-700 bg-white focus:ring-1 focus:ring-primary px-2"
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
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-700 bg-white focus:ring-1 focus:ring-primary px-2"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative">
                {/* loading overlay for publish/unpublish */}
                {loading && (
                    <div
                        className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center"
                        aria-live="polite"
                    >
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        <span className="ml-2 text-sm text-gray-700">Updating…</span>
                    </div>
                )}

                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] bg-white border border-gray-100 shadow-sm rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wide sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-center w-12">
                                <input type="checkbox" id="all" />
                            </th>
                            <th className="p-3 text-left">Property</th>
                            <th className="p-3 text-left">Agent(s)</th>
                            <th className="p-3 text-left">Availability</th>
                            <th className="p-3 text-left">Address</th>
                            <th className="p-3 text-left">Price</th>
                            <th className="p-3 text-left">Size</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-dashed">
                        {rows.length > 0 ? (
                            rows.map((row) => {
                                const prop = row?.property || {};
                                const agentsList = A(row?.agents);
                                const statusKey = S(row?.status).toLowerCase();
                                const statusClass = statusStyles[statusKey] || statusStyles.default;

                                const lot = N(prop?.lot_area, null);
                                const floor = N(prop?.floor_area, null);
                                const sizeText =
                                    lot || floor
                                        ? `${lot ? `Lot: ${lot} m²` : ""}${lot && floor ? " • " : ""}${floor ? `Floor: ${floor} m²` : ""}`
                                        : "—";

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-center">
                                            <input type="checkbox" id={`row-${row.id}`} />
                                        </td>

                                        {/* Property cell */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={prop?.image_url ? `/storage/${prop.image_url}` : "/images/placeholder.jpg"}
                                                    alt={S(prop?.title) || "Property"}
                                                    onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                                    className="w-14 h-14 object-cover rounded-md ring-1 ring-gray-200"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 line-clamp-1">{S(prop?.title) || "Untitled"}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {S(prop?.property_type) || "—"}
                                                        {prop?.sub_type ? ` | ${prop.sub_type}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Agents cell */}
                                        <td className="p-3">
                                            {agentsList.length ? (
                                                <div className="flex items-center -space-x-2">
                                                    {agentsList.map((agent) =>
                                                        agent?.photo_url ? (
                                                            <img
                                                                key={agent.id || agent.email || agent.name}
                                                                src={`/storage/${agent.photo_url}`}
                                                                alt={agent?.name || "Agent"}
                                                                title={agent?.name || "Agent"}
                                                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm hover:scale-105 transition"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div
                                                                key={agent.id || agent.email || agent.name}
                                                                title={agent?.name || "Agent"}
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-white text-xs font-semibold ring-2 ring-white"
                                                            >
                                                                {(agent?.name?.charAt(0) || "A").toUpperCase()}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm">No agents assigned</span>
                                            )}
                                        </td>

                                        {/* Availability */}
                                        <td className="p-3">
                                            <AvailabilityPill isPresell={prop?.isPresell} />
                                        </td>

                                        {/* Address */}
                                        <td className="p-3 text-gray-700">{S(prop?.address) || "—"}</td>

                                        {/* Price */}
                                        <td className="p-3 text-gray-800 font-semibold">{formatPhp(prop?.price)}</td>

                                        {/* Size */}
                                        <td className="p-3 text-gray-700">{sizeText}</td>

                                        {/* Status (Published/Unpublished) */}
                                        <td className="p-3">
                                            <div className="relative inline-block">
                                                <select
                                                    id={`status-${row.id}`}
                                                    value={row?.status || "Unpublished"}
                                                    onChange={(e) => {
                                                        setSelectedPropertyId(row.id);
                                                        if (e.target.value === "Published") setOpenPublishModal(true);
                                                        else setOpenUnpublishModal(true);
                                                    }}
                                                    className={`bg-white text-gray-700 text-xs font-medium rounded-full pl-3 pr-6 py-1 ring-1 ${statusClass} appearance-none cursor-pointer`}
                                                    aria-label={`Set status for ${S(prop?.title) || "property"}`}
                                                >
                                                    <option value="Unpublished">Unpublished</option>
                                                    <option value="Published">Published</option>
                                                </select>
                                                <span className="pointer-events-none absolute right-2 top-1.5 text-gray-500">
                            ▾
                          </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3">
                                            <div className="flex flex-wrap md:flex-nowrap justify-end items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setOpenAssignAgentModal(true);
                                                        setSelectedProperty(row);
                                                        setSelectedPropertyId(row.id);
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
                                                        contentClasses="bg-white ring-1 ring-gray-200 shadow-md rounded-md"
                                                    >
                                                        <div className="w-36 py-1 text-sm text-gray-700">
                                                            <Link
                                                                href={`/broker/properties/${row.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-gray-500" />
                                                                <span>View</span>
                                                            </Link>
                                                            <Link
                                                                href={`/broker/properties/${row.id}/edit`}
                                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition rounded"
                                                            >
                                                                <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-gray-500" />
                                                                <span>Edit</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    // TODO: implement delete confirmation + route
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
                            })
                        ) : (
                            <tr>
                                <td className="p-12 text-center text-gray-500" colSpan={9}>
                                    <div className="inline-flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                                                <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-1.4 1.4l.3.3v.8l5 5 1.5-1.5-5-5zM10 15a5 5 0 110-10 5 5 0 010 10z" />
                                            </svg>
                                        </div>
                                        <div>No properties found.</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t border-gray-100 shadow-sm rounded-xl mt-4 bg-white">
                {links.map((link, idx) =>
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
                )}
            </div>
        </BrokerLayout>
    );
}
