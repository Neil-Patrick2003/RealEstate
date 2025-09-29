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
} from "@fortawesome/free-solid-svg-icons";

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
    if (s === "accepted") return "bg-green-100 text-green-800";
    if (s === "rejected") return "bg-red-100 text-red-700";
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    if (s === "cancelled") return "bg-gray-100 text-gray-700";
    return "bg-orange-100 text-orange-700";
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
        router.patch(`/broker/inquiries/${id}/${action}`, {}, { onFinish: () => setLoadingId(null), onSuccess: closeConfirm });
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
        <BrokerLayout>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-3xl font-bold">Inquiries</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search by property or buyer…"
                                className="h-10 w-64 max-w-[75vw] rounded-md border border-gray-300 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary"
                            />
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                        </div>
                        <select
                            value={selectedItemsPerPage}
                            onChange={(e) => onPerPageChange(e.target.value)}
                            className="h-10 rounded-md border border-gray-300 text-sm px-2 bg-white"
                            aria-label="Items per page"
                        >
                            <option value="5">5 / page</option>
                            <option value="10">10 / page</option>
                            <option value="20">20 / page</option>
                            <option value="50">50 / page</option>
                        </select>
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
                            all: isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700",
                            pending: isActive ? "bg-primary text-white" : "bg-lightaccent text-green-800",
                            accepted: isActive ? "bg-secondary text-white" : "bg-orange-100 text-secondary",
                            rejected: isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-700",
                            cancelled: isActive ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700",
                        };
                        return map[n] || "bg-gray-100 text-gray-800";
                    }}
                />

                {/* List */}
                <div className="mt-4" role="list">
                    {inquiries?.data?.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-500">No inquiries found.</p>
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
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md hover:-translate-y-[1px] transition-all"
                                    role="listitem"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 p-5">
                                        {/* Image */}
                                        <div className="col-span-12 lg:col-span-3">
                                            <div className="relative h-48 rounded-lg overflow-hidden ring-1 ring-gray-200">
                                                <img
                                                    src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                                    alt={title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                />
                                                <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(inq.status)}`}>
                            {inq.status}
                          </span>
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                    {price}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property info */}
                                        <div className="col-span-12 lg:col-span-6 flex flex-col">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-lg font-semibold text-primary leading-tight">{title}</h3>
                                            </div>

                                            <p className="mt-1 text-gray-600 text-sm flex items-center">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                {address}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {pType} — {pSub}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Client message: </strong>
                                                    <span className="align-middle">{msg}</span>
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400 flex items-center">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                {created ? dayjs(created).format("MMMM D, YYYY, h:mm A") : "—"}
                                                {created && (
                                                    <span className="ml-2 text-gray-500">({dayjs(created).fromNow()})</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Buyer + actions */}
                                        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border bg-gray-200 text-gray-700 font-bold grid place-items-center">
                                                        {avatar ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={avatar}
                                                                alt={buyerName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-sm">{buyerName.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{buyerName}</p>
                                                        <p className="text-xs text-gray-500">{buyerEmail || "—"}</p>
                                                    </div>
                                                </div>

                                                {/* Quick message -> mailto as a sensible default */}
                                                <a
                                                    href={buyerEmail ? `mailto:${buyerEmail}?subject=${encodeURIComponent(`Regarding ${title}`)}` : undefined}
                                                    onClick={(e) => !buyerEmail && e.preventDefault()}
                                                    className={`p-2 rounded hover:bg-gray-100 ${
                                                        buyerEmail ? "cursor-pointer text-gray-600" : "cursor-not-allowed text-gray-300"
                                                    }`}
                                                    aria-label="Message buyer"
                                                    title={buyerEmail ? "Message buyer" : "No email available"}
                                                >
                                                    <FontAwesomeIcon icon={faComment} className="w-5 h-5" />
                                                </a>
                                            </div>

                                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                                                <p className="flex items-center">
                                                    <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                    {buyerAddress}
                                                </p>
                                                <p className="flex items-center">
                                                    <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                                    {buyerPhone ? (
                                                        <a className="underline hover:text-gray-800" href={`tel:${buyerPhone}`}>
                                                            {buyerPhone}
                                                        </a>
                                                    ) : (
                                                        "Not available"
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex flex-col gap-2">
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                            onClick={() => openConfirm(inq.id, "accept")}
                                                            disabled={loadingId === inq.id}
                                                        >
                                                            {loadingId === inq.id ? "Processing…" : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                                    Accept
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-2 border border-secondary hover:bg-secondary text-secondary hover:text-white rounded-md text-sm font-medium transition"
                                                            onClick={() => openConfirm(inq.id, "reject")}
                                                            disabled={loadingId === inq.id}
                                                        >
                                                            {loadingId === inq.id ? "Processing…" : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                                                    Reject
                                                                </>
                                                            )}
                                                        </button>
                                                    </>
                                                ) : /accepted/i.test(inq.status) ? (
                                                    <Link
                                                        href={`/broker/inquiries/${inq.id}`}
                                                        className="w-full px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-md font-medium transition text-center"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                        View
                                                    </Link>
                                                ) : (
                                                    <button
                                                        className="w-full bg-gray-200 py-2 rounded-md text-gray-500 cursor-not-allowed capitalize"
                                                        disabled
                                                    >
                                                        {inq.status}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Confirm dialog */}
                <ConfirmDialog
                    open={confirm.open}
                    setOpen={(v) => (v ? setConfirm((s) => ({ ...s, open: true })) : closeConfirm())}
                    title={`Confirm ${confirm.action === "accept" ? "Acceptance" : "Rejection"}`}
                    description={`Are you sure you want to ${confirm.action} this inquiry?`}
                    confirmText="Confirm"
                    cancelText="Cancel"
                    onConfirm={doAction}
                />

                {/* Pagination */}
                <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t border-gray-100 rounded-b-xl">
                    {inquiries?.links?.map((link, idx) =>
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
            </div>
        </BrokerLayout>
    );
}
