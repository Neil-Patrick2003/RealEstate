import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import FilterTabs from "@/Components/tabs/FilterTabs.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faClock,
    faComment,
    faHouseChimney,
    faLocationDot,
    faXmark,
    faPhone,
    faMagnifyingGlass,
    faEnvelope,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

/** Currency helper */
const formatPHP = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return "—";
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(num);
};

/** Badge classes by status */
const badgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") return "badge-success";
    if (s === "rejected") return "badge-error";
    if (s === "pending") return "badge-warning";
    if (s === "cancelled") return "badge-gray";
    return "badge-secondary";
};

export default function Index({
                                  inquiries,
                                  inquiriesCount,
                                  rejectedCount,
                                  acceptedCount,
                                  pendingCount,
                                  cancelledCount,
                                  page = 1,
                                  itemsPerPage = 10,
                                  status = "All",
                              }) {
    const [loadingId, setLoadingId] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null, action: null });

    const [selectedStatus, setSelectedStatus] = useState(status || "All");
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [searchTerm, setSearchTerm] = useState("");

    // Debounced search
    const debouncedGo = useCallback(
        debounce((q, perPage, stat) => {
            router.get(
                "/broker/inquiries",
                { page: 1, items_per_page: perPage, status: stat, search: q || undefined },
                { preserveState: true, replace: true }
            );
        }, 450),
        []
    );

    useEffect(() => () => debouncedGo.cancel(), [debouncedGo]);

    const onSearchChange = (v) => {
        setSearchTerm(v);
        debouncedGo(v, selectedItemsPerPage, selectedStatus);
    };

    const onTabChange = (name) => {
        const next = name || "All";
        setSelectedStatus(next);
        router.get(
            "/broker/inquiries",
            { items_per_page: selectedItemsPerPage, page: 1, status: next, search: searchTerm || undefined },
            { preserveState: true, replace: true }
        );
    };

    const onPerPageChange = (v) => {
        const per = Number(v) || 10;
        setSelectedItemsPerPage(per);
        router.get(
            "/broker/inquiries",
            { items_per_page: per, page: 1, status: selectedStatus, search: searchTerm || undefined },
            { preserveState: true, replace: true }
        );
    };

    const openConfirm = (id, action) => setConfirm({ open: true, id, action });
    const closeConfirm = () => setConfirm({ open: false, id: null, action: null });

    const doAction = () => {
        const { id, action } = confirm;
        if (!id || !action) return;
        setLoadingId(id);
        router.patch(`/broker/inquiries/${id}/${action}`, {}, {
            onFinish: () => setLoadingId(null),
            onSuccess: closeConfirm
        });
    };

    // Tab meta
    const tabs = useMemo(
        () => [
            { name: "All" },
            { name: "Pending" },
            { name: "Accepted" },
            { name: "Rejected" },
            { name: "Cancelled" },
        ],
        []
    );

    const counts = useMemo(
        () => [inquiriesCount, pendingCount, acceptedCount, rejectedCount, cancelledCount],
        [inquiriesCount, pendingCount, acceptedCount, rejectedCount, cancelledCount]
    );

    return (
        <AuthenticatedLayout>
            <div className="page-content space-y-6">
                {/* Header */}
                <div className="page-header">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inquiries Management</h1>
                            <p className="text-gray-600 mt-1">Manage and respond to property inquiries from potential buyers</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                                />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search by property or buyer…"
                                    className="form-input pl-10 w-64"
                                />
                            </div>
                            <select
                                value={selectedItemsPerPage}
                                onChange={(e) => onPerPageChange(e.target.value)}
                                className="form-select w-32"
                                aria-label="Items per page"
                            >
                                <option value="5">5 / page</option>
                                <option value="10">10 / page</option>
                                <option value="20">20 / page</option>
                                <option value="50">50 / page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <FilterTabs
                    tabs={tabs}
                    counts={counts}
                    selectedTab={selectedStatus}
                    setSelectedTab={setSelectedStatus}
                    onTabChange={onTabChange}
                    getBadgeClass={(name, isActive) => {
                        const n = (name || "").toLowerCase();
                        const map = {
                            all: isActive ? "bg-gray-900 text-white" : "badge-gray",
                            pending: isActive ? "bg-primary-600 text-white" : "badge-warning",
                            accepted: isActive ? "bg-emerald-600 text-white" : "badge-success",
                            rejected: isActive ? "bg-rose-600 text-white" : "badge-error",
                            cancelled: isActive ? "bg-gray-600 text-white" : "badge-secondary",
                        };
                        return map[n] || "badge-gray";
                    }}
                />

                {/* Inquiries List */}
                <div className="space-y-4">
                    {inquiries?.data?.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="text-gray-400 mb-3">
                                <FontAwesomeIcon icon={faEnvelope} className="w-12 h-12 mx-auto" />
                            </div>
                            <p className="text-gray-500 text-lg">No inquiries found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm ? "Try adjusting your search terms" : "New inquiries will appear here"}
                            </p>
                        </div>
                    ) : (
                        inquiries.data.map((inq) => {
                            const property = inq?.property || {};
                            const buyer = inq?.buyer || {};
                            const created = inq?.created_at;
                            const isPending = (inq?.status || "").toLowerCase() === "pending";

                            const price = formatPHP(property?.price);
                            const title = property?.title || "Unknown Property";
                            const address = property?.address || "No address provided";
                            const pType = property?.property_type || "Type";
                            const pSub = property?.sub_type || "Sub-type";
                            const msg = inq?.notes || "No message provided.";

                            const buyerName = buyer?.name || "Unknown";
                            const buyerEmail = buyer?.email || "";
                            const buyerPhone = buyer?.contact_number || "";
                            const buyerAddress = buyer?.address || "Not available";
                            const avatar = buyer?.avatar_url;

                            return (
                                <div
                                    key={inq.id}
                                    className="card-hover"
                                    role="listitem"
                                >
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            {/* Property Image */}
                                            <div className="lg:col-span-3">
                                                <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                                        alt={title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                    />
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`badge ${badgeClass(inq.status)}`}>
                                                            {inq.status}
                                                        </span>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 bg-black/80 text-white text-sm px-3 py-1 rounded-md font-medium">
                                                        {price}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Property Information */}
                                            <div className="lg:col-span-6 flex flex-col">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-gray-400" />
                                                        {address}
                                                    </p>
                                                    <p className="text-gray-500 text-xs flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faHouseChimney} className="w-4 h-4 text-gray-400" />
                                                        {pType} — {pSub}
                                                    </p>
                                                </div>

                                                {/* Client Message */}
                                                <div className="gray-card mb-4">
                                                    <p className="text-sm text-gray-700">
                                                        <strong className="font-semibold text-gray-900">Client message: </strong>
                                                        {msg}
                                                    </p>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                                                    <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                                    <span>
                                                        {created ? dayjs(created).format("MMMM D, YYYY, h:mm A") : "—"}
                                                        {created && (
                                                            <span className="ml-2">({dayjs(created).fromNow()})</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Buyer Information & Actions */}
                                            <div className="lg:col-span-3 flex flex-col">
                                                {/* Buyer Profile */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar-md">
                                                            {avatar ? (
                                                                <img
                                                                    src={avatar}
                                                                    alt={buyerName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{buyerName}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                {buyerEmail || "No email"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Message Button */}
                                                    <a
                                                        href={buyerEmail ? `mailto:${buyerEmail}?subject=${encodeURIComponent(`Regarding ${title}`)}` : undefined}
                                                        onClick={(e) => !buyerEmail && e.preventDefault()}
                                                        className={`btn-ghost btn-sm ${
                                                            buyerEmail ? "text-primary-600 hover:text-primary-700" : "text-gray-300 cursor-not-allowed"
                                                        }`}
                                                        aria-label="Message buyer"
                                                        title={buyerEmail ? "Message buyer" : "No email available"}
                                                    >
                                                        <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                                                    </a>
                                                </div>

                                                {/* Buyer Contact Details */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-gray-400" />
                                                        <span className="truncate">{buyerAddress}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-gray-400" />
                                                        {buyerPhone ? (
                                                            <a className="text-blue-600 hover:text-blue-700 hover:underline" href={`tel:${buyerPhone}`}>
                                                                {buyerPhone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">Not available</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-auto space-y-2">
                                                    {isPending ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn-success w-full"
                                                                onClick={() => openConfirm(inq.id, "accept")}
                                                                disabled={loadingId === inq.id}
                                                            >
                                                                {loadingId === inq.id ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="spinner-sm" />
                                                                        Processing...
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                                                        Accept Inquiry
                                                                    </div>
                                                                )}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn-outline w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                                                onClick={() => openConfirm(inq.id, "reject")}
                                                                disabled={loadingId === inq.id}
                                                            >
                                                                {loadingId === inq.id ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="spinner-sm" />
                                                                        Processing...
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                                                                        Reject Inquiry
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </>
                                                    ) : /accepted/i.test(inq.status) ? (
                                                        <Link
                                                            href={`/broker/inquiries/${inq.id}`}
                                                            className="btn-primary w-full text-center"
                                                        >
                                                            <div className="flex items-center justify-center gap-2">
                                                                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                                                View Details
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            className="btn-secondary w-full cursor-not-allowed opacity-75"
                                                            disabled
                                                        >
                                                            {inq.status}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Confirm Dialog */}
                <ConfirmDialog
                    open={confirm.open}
                    setOpen={(v) => (v ? setConfirm((s) => ({ ...s, open: true })) : closeConfirm())}
                    title={`Confirm ${confirm.action === "accept" ? "Acceptance" : "Rejection"}`}
                    description={`Are you sure you want to ${confirm.action} this inquiry? This action will notify the buyer.`}
                    confirmText="Confirm"
                    cancelText="Cancel"
                    onConfirm={doAction}
                    variant={confirm.action === "accept" ? "success" : "error"}
                />

                {/* Pagination */}
                {inquiries?.links && inquiries.links.length > 3 && (
                    <div className="flex flex-wrap gap-1 justify-center items-center p-4 border-t border-gray-200">
                        {inquiries.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`btn-sm ${
                                        link.active
                                            ? "btn-primary"
                                            : "btn-outline text-gray-700 hover:bg-gray-50"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="btn-sm btn-outline text-gray-400 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
