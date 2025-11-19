import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, usePage, router, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPhone,
    faSearch,
    faFilter,
    faCircleCheck,
    faCircleXmark,
    faChevronLeft,
    faChevronRight,
    faHandshake,
    faPesoSign,
    faChartLine,
    faClock,
    faCheckDouble,
    faBusinessTime,
    faArrowRight,
    faMessage,
    faBars,
    faXmark,
    faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";
import ResponsiveHoverDialog from "@/Components/HoverDialog.jsx";
import { StarIcon } from "@heroicons/react/24/solid";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

/** Professional Utils **/
const cn = (...cls) => cls.filter(Boolean).join(" ");

const php = (n) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    try {
        return Number(n).toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
    } catch {
        return `₱${Number(n).toFixed(0)}`;
    }
};

const statusConfig = {
    Accepted: {
        label: "Accepted",
        variant: "success",
        icon: faCircleCheck,
        description: "Inquiry has been accepted"
    },
    Cancelled: {
        label: "Cancelled",
        variant: "error",
        icon: faCircleXmark,
        description: "Inquiry was cancelled"
    },
    Pending: {
        label: "Under Review",
        variant: "warning",
        icon: faClock,
        description: "Waiting for response"
    },
    default: {
        label: "Processing",
        variant: "secondary",
        icon: faBusinessTime,
        description: "Inquiry is being processed"
    }
};

const StatusBadge = ({ status, size = "medium" }) => {
    const config = statusConfig[status] || statusConfig.default;

    const sizeClasses = {
        small: "text-xs px-2 py-1",
        medium: "text-sm px-3 py-1.5",
        large: "text-base px-4 py-2"
    };

    const variantClasses = {
        primary: "badge-primary",
        secondary: "badge-secondary",
        success: "badge-success",
        warning: "badge-warning",
        error: "badge-error"
    };

    return (
        <div className={`badge ${sizeClasses[size]} ${variantClasses[config.variant]} gap-2 font-semibold`}>
            <FontAwesomeIcon icon={config.icon} className="w-3 h-3" />
            {config.label}
        </div>
    );
};

/* ---------- Mobile-Optimized Components ---------- */
function PageHeader({ title, subtitle, action }) {
    return (
        <div className="page-header pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="section-title text-2xl sm:text-3xl font-bold">{title}</h1>
                    {subtitle && (
                        <p className="section-description text-gray-600 text-sm sm:text-base max-w-2xl">{subtitle}</p>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-3">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, color = "primary" }) {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-600",
        accent: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        secondary: "bg-gray-50 text-gray-600"
    };

    return (
        <div className="card-hover p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ml-2 flex-shrink-0 ${colorClasses[color]}`}>
                    <FontAwesomeIcon icon={icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
            </div>
        </div>
    );
}

function AgentCard({ agent, compact = false }) {
    const { rating, reviews } = useMemo(() => {
        const feedbacks = agent?.feedback_received || agent?.feedback_as_receiver || [];
        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
            : null;
        return { rating: avgRating, reviews: feedbacks.length };
    }, [agent]);

    const formatRating = (n) => (n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(1));

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="avatar-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                    {agent?.name ? agent.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{agent?.name ?? "Unknown Agent"}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {rating != null ? (
                            <>
                                <StarIcon className="h-3 w-3 text-amber-400" />
                                <span className="text-xs font-semibold text-gray-700">{formatRating(rating)}</span>
                                <span className="text-xs text-gray-500">({reviews})</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-500">No ratings</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="avatar-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                    {agent?.name ? agent.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1 min-w-0">
                    <ResponsiveHoverDialog
                        title={
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                    {agent?.name ?? "Unknown Agent"}
                                </span>
                                <span className="badge-accent text-xs">
                                    Agent
                                </span>
                            </div>
                        }
                        dialogContent={
                            <div className="space-y-4 pt-2">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-extrabold text-emerald-700">
                                            {formatRating(rating)}
                                        </span>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        rating != null && i < Math.round(rating)
                                                            ? "text-amber-400"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({reviews} {reviews === 1 ? "review" : "reviews"})
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                <button
                                    onClick={() => router.visit(`/agents/${agent.id}`)}
                                    className="btn-primary w-full"
                                >
                                    View Agent Profile
                                </button>
                            </div>
                        }
                    >
                        <button className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors text-left truncate">
                            {agent?.name ?? "Unknown Agent"}
                        </button>
                    </ResponsiveHoverDialog>
                    <p className="text-xs text-gray-500 mt-1">Real Estate Agent</p>

                    <div className="flex items-center gap-1 mt-2">
                        {rating != null ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`h-3 w-3 ${
                                            i < Math.round(rating) ? "text-amber-400" : "text-gray-300"
                                        }`}
                                    />
                                ))}
                                <span className="text-xs font-semibold text-gray-700 ml-1">
                                    {formatRating(rating)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({reviews})
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-500">No ratings yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-gray-400" />
                    <span className="text-xs truncate">{agent?.email ?? "N/A"}</span>
                </div>
                {agent?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-gray-400" />
                        <a href={`tel:${agent.phone}`} className="text-primary-600 hover:text-primary-700 text-xs truncate">
                            {agent.phone}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

function InquiryProgress({ deal }) {
    const steps = [
        { key: 'sent', label: 'Sent', completed: true },
        { key: 'reviewed', label: 'Reviewed', completed: deal?.status !== 'Pending' },
        { key: 'negotiating', label: 'Negotiating', completed: deal?.status === 'Accepted' },
        { key: 'completed', label: 'Completed', completed: deal?.status === 'Accepted' }
    ];

    const currentStep = steps.findIndex(step => !step.completed);
    const activeStep = currentStep === -1 ? steps.length - 1 : currentStep - 1;

    return (
        <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-600">
                {steps.map((step, index) => (
                    <div key={step.key} className="text-center flex-1">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-semibold mx-auto ${
                            index <= activeStep
                                ? 'bg-emerald-500 text-white'
                                : step.completed
                                    ? 'bg-gray-300 text-gray-600'
                                    : 'bg-gray-200 text-gray-400'
                        }`}>
                            {index + 1}
                        </div>
                        <span className="mt-1 block text-xs truncate px-1">{step.label}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center px-2 sm:px-3">
                {steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                        <div className={`flex-1 h-1 ${
                            index < activeStep + 1 ? 'bg-emerald-500' : 'bg-gray-200'
                        }`} />
                        {index < steps.length - 1 && (
                            <div className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full ${
                                index < activeStep ? 'bg-emerald-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ title = "No inquiries yet", subtitle = "You haven't made any property inquiries yet." }) {
    return (
        <div className="card text-center p-6 sm:p-8 md:p-12 animate-fade-in">
            <div className="avatar-lg mx-auto mb-4 sm:mb-6 bg-gray-100">
                <FontAwesomeIcon icon={faMessage} className="text-xl sm:text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">{subtitle}</p>
            <Link
                href="/properties"
                className="btn-primary text-sm sm:text-base"
            >
                <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                Browse Properties
            </Link>
        </div>
    );
}

export default function InquiriesPage({ deals = [] }) {
    const { auth } = usePage().props;
    const authUserId = auth?.user?.id;
    const unreadNotifications = auth?.notifications?.unread ?? [];

    const counterOffers = unreadNotifications.filter((n) => n?.data?.message?.toLowerCase?.().includes("counter your offer"));

    const { data, setData, errors, processing, reset, put } = useForm({ amount: "" });

    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openAcceptModal, setOpenAcceptModal] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Local UX state
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("recent");
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

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: deals.length,
            pending: deals.filter(d => d?.status === 'Pending').length,
            accepted: deals.filter(d => d?.status === 'Accepted').length,
            cancelled: deals.filter(d => d?.status === 'Cancelled').length
        };
    }, [deals]);

    return (
        <AuthenticatedLayout>
            <Head title="My Inquiries" />

            {/* Modals */}
            <Modal show={openUpdateModal} onClose={closeModal} closeable maxWidth="sm">
                <motion.form
                    onSubmit={submit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="card p-4 sm:p-6"
                >
                    <h3 className="text-lg font-semibold mb-4">{selectedDeal?.amount_last_updated_by === authUserId ? "Edit your offer" : "Counter offer"}</h3>

                    <div className="form-group">
                        <label className="form-label">Offer Amount (₱)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            inputMode="numeric"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="form-input"
                            placeholder="Enter amount"
                        />
                        {errors?.amount && <p className="form-error">{errors.amount}</p>}
                    </div>

                    <p className="text-sm text-gray-600 mt-2">Preview: <span className="font-semibold text-gray-900">{php(data.amount)}</span></p>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        <button type="button" onClick={closeModal} className="btn-secondary order-2 sm:order-1" disabled={processing}>Cancel</button>
                        <button type="submit" className="btn-primary order-1 sm:order-2" disabled={processing}>
                            {processing ? "Updating..." : "Update Offer"}
                        </button>
                    </div>
                </motion.form>
            </Modal>

            <ConfirmDialog
                open={openAcceptModal}
                onConfirm={handleUpdateStatus}
                confirmText="Confirm"
                cancelText="Cancel"
                setOpen={setOpenAcceptModal}
                title="Confirm Inquiry Status"
                description={`This will set the inquiry to "${selectedStatus}". You can't undo this action.`}
            />

            <div className="page-container">
                <div className="page-content">
                    {/* Header */}
                    <PageHeader
                        title="Inquiry Management"
                        subtitle="Track and manage your property inquiries with real-time updates and progress tracking"
                        action={
                            <Link
                                href="/properties"
                                className="btn-primary w-full sm:w-auto justify-center"
                            >
                                <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                                Browse Properties
                            </Link>
                        }
                    />

                    {/* Stats Overview - Mobile Optimized */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <StatsCard
                            title="Total Inquiries"
                            value={stats.total}
                            icon={faMessage}
                            color="primary"
                        />
                        <StatsCard
                            title="Under Review"
                            value={stats.pending}
                            icon={faClock}
                            color="warning"
                        />
                        <StatsCard
                            title="Accepted"
                            value={stats.accepted}
                            icon={faCheckDouble}
                            color="accent"
                        />
                        <StatsCard
                            title="Cancelled"
                            value={stats.cancelled}
                            icon={faBusinessTime}
                            color="secondary"
                        />
                    </div>

                    {/* Counter Offer Banner */}
                    <AnimatePresence>
                        {counterOffers.length > 0 && (
                            <motion.div
                                initial={{ y: -40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -40, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="mb-4 sm:mb-6"
                            >
                                <div className="alert alert-warning flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4">
                                    <span className="text-sm sm:text-base text-center sm:text-left">
                                        <strong>{counterOffers.length}</strong> counter offer{counterOffers.length > 1 ? "s" : ""} received
                                    </span>
                                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                                        <button onClick={markAllCounterAsRead} className="text-amber-700 hover:text-amber-900 text-sm font-medium">Mark all read</button>
                                        <button onClick={markAllCounterAsRead} className="text-amber-600 hover:text-amber-800">✕</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="btn-outline w-full justify-center"
                        >
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Filters & Search
                        </button>
                    </div>

                    {/* Mobile Filters Modal */}
                    <AnimatePresence>
                        {mobileFiltersOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                    onClick={() => setMobileFiltersOpen(false)}
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", damping: 30 }}
                                    className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 lg:hidden shadow-2xl"
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Filters Content */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {/* Search */}
                                            <div>
                                                <label className="form-label">Search Inquiries</label>
                                                <div className="relative">
                                                    <FontAwesomeIcon
                                                        icon={faSearch}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Property title or address..."
                                                        value={q}
                                                        onChange={(e) => setQ(e.target.value)}
                                                        className="form-input pl-10"
                                                    />
                                                </div>
                                            </div>

                                            {/* Status Filter */}
                                            <div>
                                                <label className="form-label">Status</label>
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="All">All Status</option>
                                                    <option value="Pending">Under Review</option>
                                                    <option value="Accepted">Accepted</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="form-label">Sort By</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="recent">Most Recent</option>
                                                    <option value="highest-offer">Highest Offer</option>
                                                    <option value="highest-price">Highest Price</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200 space-y-2">
                                            <button
                                                onClick={() => {
                                                    setMobileFiltersOpen(false);
                                                }}
                                                className="btn-primary w-full"
                                            >
                                                Apply Filters
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setQ("");
                                                    setStatusFilter("All");
                                                    setSortBy("recent");
                                                    setMobileFiltersOpen(false);
                                                }}
                                                className="btn-outline w-full"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Desktop Search and Filter Bar */}
                    <div className="hidden lg:block card p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
                            {/* Search Input */}
                            <div className="lg:col-span-4">
                                <label className="form-label">Search Inquiries</label>
                                <div className="relative">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by property title or address..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        className="form-input pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Under Review</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="highest-offer">Highest Offer</option>
                                    <option value="highest-price">Highest Price</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="lg:col-span-2">
                                <button
                                    onClick={() => {
                                        setQ("");
                                        setStatusFilter("All");
                                        setSortBy("recent");
                                    }}
                                    className="btn-outline w-full"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inquiries List */}
                    <div>
                        {paged.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                <AnimatePresence>
                                    {paged.map((deal) => {
                                        const property = deal?.property_listing?.property ?? {};
                                        const agents = deal?.property_listing?.agents || [];
                                        const isOwnerUpdate = deal?.amount_last_updated_by === authUserId;
                                        const thumb = property?.image_url ? `/storage/${property.image_url}` : "/images/placeholder-property.jpg";

                                        return (
                                            <motion.div
                                                key={deal?.id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 16 }}
                                                transition={{ duration: 0.25 }}
                                                className="card-hover"
                                            >
                                                <div className="p-4 sm:p-6">
                                                    <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 sm:gap-6">
                                                        {/* Property Header - Mobile First */}
                                                        <div className="xl:col-span-8 space-y-4 sm:space-y-6">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-square w-16 sm:w-20 flex-shrink-0 shadow-inner">
                                                                        <img
                                                                            src={thumb}
                                                                            alt={property?.title || "Property"}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                                                                                {property?.title || "Untitled property"}
                                                                            </h3>
                                                                            <StatusBadge status={deal?.status} />
                                                                        </div>
                                                                        <p className="text-gray-600 text-sm line-clamp-1 mb-2">
                                                                            {property?.address || "—"}
                                                                        </p>
                                                                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                                                                            <span>{property?.property_type || "—"}</span>
                                                                            <span>•</span>
                                                                            <span>{property?.lot_area ? `${property.lot_area} m²` : "—"}</span>
                                                                            <span>•</span>
                                                                            <span className="font-semibold text-gray-900">{php(property?.price)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Progress Tracking */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-sm font-semibold text-gray-700">Progress</h4>
                                                                    <span className="text-xs text-gray-500">
                                                                        Step {deal?.status === 'Pending' ? '1' : deal?.status === 'Accepted' ? '3' : '2'} of 4
                                                                    </span>
                                                                </div>
                                                                <InquiryProgress deal={deal} />
                                                            </div>

                                                            {/* Message Preview */}
                                                            {deal?.message && (
                                                                <div className="gray-card">
                                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Message</p>
                                                                    <p className="text-sm text-gray-600 italic line-clamp-2">"{deal.message}"</p>
                                                                </div>
                                                            )}

                                                            {/* Updates */}
                                                            <div className="space-y-2">
                                                                <p className="text-sm font-semibold text-gray-700">Last Updated</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {dayjs(deal?.updated_at || deal?.created_at).format("MMM D, YYYY h:mm A")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Right Column - Agents & Actions */}
                                                        <div className="xl:col-span-4 space-y-4 sm:space-y-6">
                                                            {/* Agents */}
                                                            {agents.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <p className="text-sm font-semibold text-gray-700">Agents</p>
                                                                    <div className="space-y-2">
                                                                        {agents.map((agent, idx) => (
                                                                            <AgentCard key={`${deal.id}-agent-${idx}`} agent={agent} compact />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="space-y-3">
                                                                <p className="text-sm font-semibold text-gray-700">Actions</p>
                                                                {deal?.status === "Pending" ? (
                                                                    <div className="space-y-2">
                                                                        {isOwnerUpdate ? (
                                                                            <button
                                                                                onClick={() => openModal(deal)}
                                                                                className="btn-primary w-full text-sm"
                                                                            >
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
                                                                                    className="btn-primary w-full text-sm"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faCircleCheck} className="mr-2" />
                                                                                    Accept Inquiry
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => openModal(deal)}
                                                                                    className="btn-outline w-full text-sm"
                                                                                >
                                                                                    Send Counter Offer
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedDeal(deal);
                                                                                setSelectedStatus("Cancelled");
                                                                                setOpenAcceptModal(true);
                                                                            }}
                                                                            className="btn-outline w-full text-sm text-rose-600 border-rose-200 hover:bg-rose-50"
                                                                        >
                                                                            <FontAwesomeIcon icon={faCircleXmark} className="mr-2" />
                                                                            Decline Inquiry
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className={`text-center py-3 px-4 rounded-lg ${
                                                                        statusConfig[deal?.status]?.variant === 'success'
                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                            : 'bg-gray-50 text-gray-700'
                                                                    }`}>
                                                                        <div className="font-semibold text-sm">{deal?.status}</div>
                                                                        <div className="text-xs mt-1">
                                                                            {statusConfig[deal?.status]?.description || "Inquiry processed"}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Pagination - Mobile Optimized */}
                    {totalPages > 1 && (
                        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8" aria-label="Pagination">
                            <div className="text-sm text-gray-600 text-center sm:text-left">
                                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="btn-outline btn-sm"
                                    disabled={page === 1}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="btn-outline btn-sm"
                                    disabled={page === totalPages}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
