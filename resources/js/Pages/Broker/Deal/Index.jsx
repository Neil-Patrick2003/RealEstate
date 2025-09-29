import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import StatCard from "@/Components/StatCard.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faDownload,
    faMagnifyingGlass,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import React, { useMemo, useState, useEffect } from "react";
import { useForm, usePage, Link } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import CounterOfferModal from "@/Components/Deal/CounterOfferModal.jsx";

dayjs.extend(relativeTime);

export default function Index({
                                  property_listings = [],
                                  all_deals_count = 0,
                                  pending_deals_count = 0,
                                  cancelled_deals_count = 0,
                                  closed_deals_count = 0,
                                  status = "", // server-selected status (optional)
                              }) {
    const { data, setData, patch, processing, reset } = useForm({
        id: "",
        status: "",
    });

    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [openCounterModal, setOpenCounterModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const [search, setSearch] = useState("");
    const [localStatus, setLocalStatus] = useState(status || "All");
    const [showFilterBar, setShowFilterBar] = useState(false);

    const userId = usePage().props?.auth?.user?.id;

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        accepted: "bg-green-100 text-green-700",
        declined: "bg-red-100 text-red-700",
        upcoming: "bg-blue-100 text-blue-700",
        cancelled: "bg-gray-100 text-gray-600",
        closed: "bg-indigo-100 text-indigo-700",
        sold: "bg-purple-100 text-purple-700",
    };

    const money = (n) =>
        `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

    // Flatten deals for search/export (but keep your current table mapping intact)
    const allDealsFlat = useMemo(() => {
        const rows = [];
        property_listings.forEach((listing) => {
            const deals = Array.isArray(listing?.deal) ? listing.deal : [];
            deals.forEach((deal) => {
                rows.push({
                    id: deal.id,
                    status: deal.status,
                    created_at: deal.created_at,
                    amount: deal.amount,
                    amount_last_updated_by: deal.amount_last_updated_by,
                    buyer: deal.buyer || {},
                    property: listing?.property || {},
                    listingId: listing?.id,
                });
            });
        });
        return rows;
    }, [property_listings]);

    // Local status filter fallback (if server doesn't drive tabs)
    const shouldKeepByStatus = (s) => {
        const target = (localStatus || "All").toLowerCase();
        if (target === "all") return true;
        return s?.toLowerCase() === target;
    };

    const searchMatch = (row) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const hay = `${row?.property?.title || ""} ${row?.property?.address || ""} ${
            row?.buyer?.name || ""
        } ${row?.buyer?.email || ""}`.toLowerCase();
        return hay.includes(q);
    };

    const derivedCounts = useMemo(() => {
        const counts = {
            all: all_deals_count,
            pending: pending_deals_count,
            closed: closed_deals_count,
            cancelled: cancelled_deals_count,
        };
        // If backend didn’t provide, compute locally
        if (!all_deals_count && allDealsFlat.length) {
            counts.all = allDealsFlat.length;
            counts.pending = allDealsFlat.filter((d) => d.status === "Pending").length;
            counts.closed = allDealsFlat.filter((d) => d.status === "Closed" || d.status === "Sold").length;
            counts.cancelled = allDealsFlat.filter((d) => /cancel/i.test(d.status)).length;
        }
        return counts;
    }, [all_deals_count, pending_deals_count, closed_deals_count, cancelled_deals_count, allDealsFlat]);

    // For quick “showing X results”
    const visibleDealCount = useMemo(() => {
        return allDealsFlat.filter((d) => shouldKeepByStatus(d.status) && searchMatch(d)).length;
    }, [allDealsFlat, localStatus, search]);

    const handleStatusUpdate = (deal, next) => {
        setSelectedDeal(deal);
        setData({ id: deal.id, status: next });
        setOpenStatusModal(true);
    };

    const handleCounter = (deal, property) => {
        setSelectedDeal({ deal, property });
        setOpenCounterModal(true);
    };

    const submitStatusUpdate = () => {
        patch(route("broker.deals.update", { deal: data.id, status: data.status }), {
            onSuccess: () => {
                setOpenStatusModal(false);
                reset();
            },
        });
    };

    // CSV Export (current filtered rows)
    const exportCSV = () => {
        const rows = allDealsFlat.filter((r) => shouldKeepByStatus(r.status) && searchMatch(r));
        const header = [
            "Deal ID",
            "Status",
            "Amount",
            "Buyer",
            "Buyer Email",
            "Property",
            "Address",
            "Created At",
        ];
        const body = rows.map((r) => [
            r.id,
            r.status,
            r.amount,
            r?.buyer?.name || "",
            r?.buyer?.email || "",
            r?.property?.title || "",
            r?.property?.address || "",
            dayjs(r.created_at).format("YYYY-MM-DD HH:mm"),
        ]);
        const csv = [header, ...body].map((arr) =>
            arr
                .map((v) => {
                    const s = String(v ?? "");
                    return /,|"|\n/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                })
                .join(",")
        );
        const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `deals_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Per-row action buttons
    const ActionButtons = ({ deal, property }) => {
        const isOwnCounter = deal?.amount_last_updated_by === userId;
        const pending = deal?.status === "Pending";
        const accepted = deal?.status === "Accepted";

        return (
            <div className="flex flex-wrap gap-2 justify-end">
                {pending && (
                    <>
                        <button
                            onClick={() => handleStatusUpdate(deal, "Accepted")}
                            disabled={processing || isOwnCounter}
                            className="text-sm px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isOwnCounter ? "You made the latest counter. Wait for buyer response." : "Accept this offer"}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleCounter(deal, property)}
                            className="text-sm px-3 py-1.5 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                            title={isOwnCounter ? "Edit your counter" : "Send a counter offer"}
                        >
                            {isOwnCounter ? "Edit" : "Counter"}
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(deal, "Declined")}
                            disabled={processing || isOwnCounter}
                            className="text-sm px-3 py-1.5 rounded-md text-red-600 border border-red-300 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isOwnCounter ? "You made the latest counter. Wait for buyer response." : "Decline this offer"}
                        >
                            Decline
                        </button>
                    </>
                )}
                {accepted && (
                    <>
                        <button
                            onClick={() => handleStatusUpdate(deal, "Sold")}
                            className="text-sm px-3 py-1.5 rounded-md text-white bg-orange-500 hover:bg-orange-600 transition"
                            title="Mark deal as sold"
                        >
                            Mark as Sold
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(deal, "Cancelled")}
                            className="text-sm px-3 py-1.5 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition"
                            title="Cancel this deal"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        );
    };

    // Render helpers
    const StatusBadge = ({ value }) => {
        const cls = statusColors[value?.toLowerCase()] || "bg-gray-100 text-gray-700";
        return (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${cls}`}>
        {value || "Unknown"}
      </span>
        );
    };

    const CardProperty = ({ property }) => (
        <div className="flex gap-3 items-start">
            <img
                src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder-image.jpg"}
                alt={property?.title || "Property"}
                className="w-14 h-14 object-cover rounded-md"
                onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
            />
            <div>
                <p className="font-medium text-gray-800">{property?.title || "-"}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{property?.address || "-"}</p>
            </div>
        </div>
    );

    const filteredDealsForListing = (listing) => {
        const deals = Array.isArray(listing?.deal) ? listing.deal : [];
        return deals.filter((d) => shouldKeepByStatus(d.status) && searchMatch({ property: listing.property, buyer: d.buyer }));
    };

    const hasDeals = useMemo(
        () => property_listings?.some((l) => filteredDealsForListing(l).length > 0),
        [property_listings, localStatus, search]
    );

    return (
        <BrokerLayout>
            {/* Confirm Modal */}
            <ConfirmDialog
                open={openStatusModal}
                onConfirm={submitStatusUpdate}
                confirmText="Yes, Confirm"
                cancelText="Cancel"
                setOpen={setOpenStatusModal}
                title="Update Deal Status"
                description={`Are you sure you want to mark this deal as "${data.status}"?`}
                processing={processing}
            />

            {/* Counter Modal */}
            <CounterOfferModal
                show={openCounterModal}
                onClose={() => setOpenCounterModal(false)}
                deal={selectedDeal?.deal || selectedDeal} // supports old call signature
                property={selectedDeal?.property}
                buyer={(selectedDeal?.deal || selectedDeal)?.buyer}
            />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h1 className="text-3xl font-semibold text-gray-800">Deals</h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilterBar((v) => !v)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                            title="Show filters"
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            Filters
                        </button>
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                            title="Export filtered results as CSV"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatCard
                        title="All Deals"
                        count={derivedCounts.all}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600" />}
                        bgColor="bg-gray-100"
                    />
                    <StatCard
                        title="Pending Offers"
                        count={derivedCounts.pending}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-600" />}
                        bgColor="bg-yellow-100"
                    />
                    <StatCard
                        title="Closed Deals"
                        count={derivedCounts.closed}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />}
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Cancelled Deals"
                        count={derivedCounts.cancelled}
                        icon={<FontAwesomeIcon icon={faCalendarAlt} className="text-red-600" />}
                        bgColor="bg-red-100"
                    />
                </div>

                {/* Filter bar */}
                {showFilterBar && (
                    <div className="mb-4 rounded-xl border border-gray-100 bg-white/70 backdrop-blur p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="relative w-full md:w-80">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by property, address, or buyer…"
                                    className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary"
                                />
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                            </div>

                            <select
                                value={localStatus}
                                onChange={(e) => setLocalStatus(e.target.value)}
                                className="h-10 rounded-md border border-gray-300 text-sm px-2 bg-white"
                                title="Quick status filter"
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>Accepted</option>
                                <option>Declined</option>
                                <option>Closed</option>
                                <option>Sold</option>
                                <option>Cancelled</option>
                            </select>

                            <div className="ml-auto text-sm text-gray-600">
                                Showing <span className="font-semibold">{visibleDealCount}</span> result
                                {visibleDealCount === 1 ? "" : "s"}
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-xl">
                    {hasDeals ? (
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-left">Property</th>
                                <th className="p-4 text-left">Buyer</th>
                                <th className="p-4 text-right">Offer</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {property_listings.map(
                                (listing) =>
                                    filteredDealsForListing(listing).length > 0 &&
                                    filteredDealsForListing(listing).map((deal) => (
                                        <tr key={deal.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 align-top">
                                                <CardProperty property={listing.property} />
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="font-medium text-gray-800">{deal?.buyer?.name || "-"}</p>
                                                <p className="text-sm text-gray-500">{deal?.buyer?.email || "-"}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {dayjs(deal?.created_at).format("MMM D, YYYY, h:mm A")} •{" "}
                                                    {dayjs(deal?.created_at).fromNow()}
                                                </p>
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <p className="font-semibold text-gray-900">{money(deal?.amount)}</p>
                                                {deal?.amount_last_updated_by === userId && (
                                                    <p className="text-xs text-amber-700 bg-amber-100 inline-block px-2 py-0.5 mt-1 rounded">
                                                        You made the latest counter
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                <StatusBadge value={deal?.status} />
                                            </td>
                                            <td className="p-4 align-top">
                                                <ActionButtons deal={deal} property={listing.property} />
                                            </td>
                                        </tr>
                                    ))
                            )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">No deals match your filters.</div>
                    )}
                </div>

                {/* Mobile Cards (fixed: no nested map, stable keys, no double compute) */}
                <div className="sm:hidden space-y-4">
                    {(() => {
                        const mobileRows = property_listings.flatMap((listing) => {
                            const deals = filteredDealsForListing(listing);
                            return deals.map((deal) => ({ listing, deal }));
                        });

                        if (mobileRows.length === 0) {
                            return <p className="text-center text-gray-500">No deals match your filters.</p>;
                        }

                        return mobileRows.map(({ listing, deal }) => (
                            <div
                                key={`${listing?.id ?? 'l'}-${deal?.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                            >
                                <div className="mb-3">
                                    <CardProperty property={listing?.property} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Buyer</p>
                                        <p className="font-medium text-gray-800">{deal?.buyer?.name || "-"}</p>
                                        <p className="text-xs text-gray-500">{deal?.buyer?.email || "-"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Offer</p>
                                        <p className="font-semibold text-gray-900">{money(deal?.amount)}</p>
                                        <p className="text-xs text-gray-500">{dayjs(deal?.created_at).format("MMM D, YYYY")}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <StatusBadge value={deal?.status} />
                                    {deal?.amount_last_updated_by === userId && (
                                        <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                          You made the latest counter
                                        </span>
                                    )}
                                </div>

                                <ActionButtons deal={deal} property={listing?.property} />
                            </div>
                        ));
                    })()}
                </div>


            </div>
        </BrokerLayout>
    );
}
