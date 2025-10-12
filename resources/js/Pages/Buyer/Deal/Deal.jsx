import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faSearch, faFilter, faCircleCheck, faCircleXmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/** Utility helpers **/
const php = (n) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    try {
        return Number(n).toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
    } catch {
        return `₱${Number(n).toFixed(0)}`;
    }
};

const statusStyles = {
    Accepted: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
    Cancelled: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    default: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200",
};

const StatusPill = ({ status }) => (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.default}`}>
    <span className={`block h-1.5 w-1.5 rounded-full ${
        status === "Accepted" ? "bg-green-500" : status === "Cancelled" ? "bg-red-500" : status === "Pending" ? "bg-amber-500" : "bg-gray-400"
    }`} />
        {status}
  </span>
);

const AgentCard = ({ agent }) => (
    <div className="flex items-start gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition">
        <div className="w-12 h-12 rounded-full overflow-hidden border shadow-sm flex-shrink-0">
            {agent?.avatar_url ? (
                <img src={agent.avatar_url} alt={agent?.name || "Agent"} className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 font-semibold">
                    {(agent?.name?.[0] || "A").toUpperCase()}
                </div>
            )}
        </div>
        <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{agent?.name ?? "Unknown Agent"}</p>
            <p className="text-xs text-gray-600 flex items-center gap-2"><FontAwesomeIcon icon={faEnvelope} /> {agent?.email ?? "N/A"}</p>
            {agent?.phone && (
                <a href={`tel:${agent.phone}`} className="mt-1 inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700">
                    <FontAwesomeIcon icon={faPhone} /> {agent.phone}
                </a>
            )}
        </div>
    </div>
);

const EmptyState = ({ title = "No deals yet", subtitle = "You currently have no deals." }) => (
    <div className="flex flex-col items-center justify-center text-gray-500 py-20">
        <img src="/images/empty-deals.svg" alt="No deals" className="w-40 mb-4 opacity-80" />
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
);

export default function DealsPage({ deals = [] }) {
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;
    const unreadNotifications = auth?.notifications?.unread ?? [];

    const counterOffers = unreadNotifications.filter((n) => n?.data?.message?.toLowerCase?.().includes("counter your offer"));

    const { data, setData, errors, processing, reset, put } = useForm({ amount: "" });

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);

    // Local UX state
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("recent"); // recent | highest-offer | highest-price
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const markAsRead = (id) => router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    const markAllCounterAsRead = () => counterOffers.forEach((n) => markAsRead(n.id));

    const openModal = (deal) => {
        setSelectedDeal(deal);
        setData("amount", deal?.amount ?? "");
        setOpenUpdateModal(true);
    };

    const closeModal = () => {
        setOpenUpdateModal(false);
        setSelectedDeal(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!selectedDeal) return;
        put(
            route("deal.deals.update", { propertyListing: selectedDeal?.property_listing?.id, deal: selectedDeal?.id }),
            { onSuccess: () => setOpenUpdateModal(false) }
        );
    };

    const handleUpdateStatus = () => {
        if (!selectedDeal || !selectedStatus) return;
        router.put(`/deal/${selectedDeal.id}/${selectedStatus}`, {}, {
            onSuccess: () => {
                setOpenAcceptModal(false);
                setSelectedDeal(null);
            },
        });
    };

    // Derived list with search / filter / sort
    const filtered = useMemo(() => {
        let list = Array.isArray(deals) ? [...deals] : [];

        if (q.trim()) {
            const needle = q.trim().toLowerCase();
            list = list.filter((d) =>
                d?.property_listing?.property?.title?.toLowerCase?.().includes(needle) ||
                d?.property_listing?.property?.address?.toLowerCase?.().includes(needle)
            );
        }

        if (statusFilter !== "All") list = list.filter((d) => d?.status === statusFilter);

        list.sort((a, b) => {
            if (sortBy === "recent") {
                const da = a?.updated_at || a?.created_at || 0;
                const db = b?.updated_at || b?.created_at || 0;
                return dayjs(db).valueOf() - dayjs(da).valueOf();
            }
            if (sortBy === "highest-offer") return (Number(b?.amount) || 0) - (Number(a?.amount) || 0);
            if (sortBy === "highest-price") return (Number(b?.property_listing?.property?.price) || 0) - (Number(a?.property_listing?.property?.price) || 0);
            return 0;
        });

        return list;
    }, [deals, q, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    useEffect(() => { setPage(1); }, [q, statusFilter, sortBy]);
    const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

    return (
        <BuyerLayout>
            <div className="pt-12">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-primary text-2xl md:text-3xl font-semibold">My Deals</h1>
                        <p className="text-gray-500">Keep track of your real estate deals, offers, and negotiations</p>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-auto grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="relative">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by title or address…"
                                className="w-full md:w-72 rounded-xl border-gray-300 pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border-gray-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                                <option>All</option>
                                <option>Pending</option>
                                <option>Accepted</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border-gray-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                            <option value="recent">Sort: Most recent</option>
                            <option value="highest-offer">Sort: Highest offer</option>
                            <option value="highest-price">Sort: Highest price</option>
                        </select>
                    </div>
                </div>

                {/* Counter Offer Banner */}
                <AnimatePresence>
                    {counterOffers.length > 0 && (
                        <motion.div
                            initial={{ y: -40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -40, opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="mt-4"
                        >
                            <div className="mx-auto max-w-3xl flex items-center justify-between bg-amber-50 text-amber-800 px-4 py-2.5 rounded-xl ring-1 ring-amber-200 shadow-sm">
                <span>
                  <strong>{counterOffers.length}</strong> counter offer{counterOffers.length > 1 ? "s" : ""} received
                </span>
                                <div className="flex items-center gap-3">
                                    <button onClick={markAllCounterAsRead} className="text-amber-700 hover:text-amber-900 text-sm font-medium">Mark all read</button>
                                    <button onClick={markAllCounterAsRead} className="text-amber-600 hover:text-amber-800">✕</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Update Modal */}
                <Modal show={openUpdateModal} onClose={closeModal} closeable maxWidth="sm">
                    <motion.form
                        onSubmit={submit}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="p-6 bg-white rounded-xl"
                    >
                        <h3 className="text-lg font-semibold mb-4">{selectedDeal?.amount_last_updated_by === authUserId ? "Edit your offer" : "Counter offer"}</h3>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            inputMode="numeric"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter amount"
                        />
                        {errors?.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}

                        <p className="text-xs text-gray-500 mt-2">Preview: <span className="font-medium text-gray-700">{php(data.amount)}</span></p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" disabled={processing}>Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={processing}>{processing ? "Updating…" : "Update"}</button>
                        </div>
                    </motion.form>
                </Modal>

                {/* Confirm Modal */}
                <ConfirmDialog
                    open={openAcceptModal}
                    onConfirm={handleUpdateStatus}
                    confirmText="Confirm"
                    cancelText="Cancel"
                    setOpen={setOpenAcceptModal}
                    title="Confirm Offer Status"
                    description={`This will set the offer to "${selectedStatus}". You can’t undo this action.`}
                />

                {/* Deal List */}
                <div className="mt-6 md:mt-10">
                    {paged.length === 0 ? (
                            <EmptyState />)
                        : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {paged.map((deal) => {
                                        const property = deal?.property_listing?.property ?? {};
                                        const agents = deal?.property_listing?.agents || [];
                                        const isOwnerUpdate = deal?.amount_last_updated_by === authUserId;
                                        const statusClass = statusStyles[deal?.status] || statusStyles.default;
                                        const thumb = property?.image_url ? `/storage/${property.image_url}` : "/images/placeholder-property.jpg";

                                        return (
                                            <motion.div
                                                key={deal?.id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 16 }}
                                                transition={{ duration: 0.25 }}
                                                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="relative">
                                                    <img src={thumb} alt={property?.title || "Property"} className="w-full h-48 object-cover" />
                                                    <div className="absolute top-3 left-3">
                                                        <StatusPill status={deal?.status} />
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-4">
                                                    <div className="space-y-1">
                                                        <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{property?.title || "Untitled property"}</h2>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{property?.address || "—"}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-gray-500">Listing Price</p>
                                                            <p className="font-semibold text-gray-900">{php(property?.price)}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-gray-500">Your Offer</p>
                                                            <p className="font-semibold text-green-700">{php(deal?.amount)}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-gray-500">Type</p>
                                                            <p className="font-medium">{property?.property_type || "—"}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-gray-500">Area</p>
                                                            <p className="font-medium">{property?.lot_area ? `${property.lot_area} m²` : "—"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>Last updated: {dayjs(deal?.updated_at || deal?.created_at).format("MMM D, YYYY h:mm A")}</span>
                                                        <span>Deal ID: {deal?.id}</span>
                                                    </div>

                                                    {/* Agents */}
                                                    {agents.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-semibold text-gray-600">Agents</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {agents.map((agent, idx) => (
                                                                    <AgentCard key={`${deal.id}-agent-${idx}`} agent={agent} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    {deal?.status === "Pending" ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {isOwnerUpdate ? (
                                                                <button onClick={() => openModal(deal)} className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                                                    Edit Offer
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedDeal(deal);
                                                                            setSelectedStatus("Accepted");
                                                                            setOpenAcceptModal(true);
                                                                        }}
                                                                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCircleCheck} /> Accept
                                                                    </button>
                                                                    <button onClick={() => openModal(deal)} className="w-full px-4 py-2.5 border border-indigo-600 text-indigo-700 rounded-lg hover:bg-indigo-50 transition">
                                                                        Counter Offer
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDeal(deal);
                                                                    setSelectedStatus("Cancelled");
                                                                    setOpenAcceptModal(true);
                                                                }}
                                                                className="w-full px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition border border-red-200"
                                                            >
                                                                <FontAwesomeIcon icon={faCircleXmark} /> Decline
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={`text-center text-sm font-semibold py-2.5 px-3 rounded-lg ${statusClass}`}>{deal?.status}</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-10 px-3 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            disabled={page === 1}
                            aria-label="Previous page"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <div className="text-sm text-gray-600">Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span></div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="h-10 px-3 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            disabled={page === totalPages}
                            aria-label="Next page"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                )}            </div>
        </BuyerLayout>
    );
}
