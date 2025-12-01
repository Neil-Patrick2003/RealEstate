// resources/js/Pages/Buyer/Inquiries.jsx
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {
    faLocationDot, faClock, faPaperPlane, faTrashAlt, faCalendarCheck,
    faHouseChimney, faEnvelope, faPhone, faFolderOpen, faCircleCheck,
    faCalendarPlus, faHandshakeSimple, faArrowRight, faStar,
    faMessage, faEye, faMapMarkerAlt, faChartLine, faUsers,
    faHome, faBuilding, faMountain, faChevronRight,
    faRocket, faCheckDouble, faBusinessTime, faComments,
    faChevronDown, faFilter, faSort, faBars, faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Head, Link, router } from "@inertiajs/react";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ResponsiveHoverDialog from "@/Components/HoverDialog.jsx";
import { MapPin, Calendar, User, MessageCircle, ArrowUpRight, Filter, SortAsc, MoreVertical } from "lucide-react";
import { StarIcon } from "@heroicons/react/24/solid";
import PageHeader from "@/Components/ui/PageHeader.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import StatsCard from "@/Components/ui/StatsCard.jsx";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

/* ---------- Enhanced Professional Utils ---------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const arr = (v) => (Array.isArray(v) ? v : []);
const peso = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

const formatDate = (date) => {
    return dayjs(date).format('MMM DD, YYYY • hh:mm A');
};

/* ---------- Professional Status System ---------- */
const statusConfig = {
    accepted: {
        label: "Accepted",
        variant: "success",
        icon: faCircleCheck,
        description: "Agent has accepted your inquiry"
    },
    rejected: {
        label: "Declined",
        variant: "error",
        icon: faTrashAlt,
        description: "Agent has declined your inquiry"
    },
    pending: {
        label: "Under Review",
        variant: "warning",
        icon: faClock,
        description: "Waiting for agent response"
    },
    cancelled: {
        label: "Cancelled",
        variant: "secondary",
        icon: faBusinessTime,
        description: "Inquiry was cancelled"
    },

    // NEW STATUSES
    closedWithDeal: {
        label: "Closed (Deal)",
        variant: "primary",
        icon: faHandshakeSimple,
        description: "Transaction completed successfully with a deal"
    },
    closedNoDeal: {
        label: "Closed (No Deal)",
        variant: "secondary",
        icon: faBusinessTime, // or any icon you prefer
        description: "Inquiry was closed without any deal"
    },

    default: {
        label: "Pending",
        variant: "warning",
        icon: faClock,
        description: "Waiting for agent response"
    }
};


const StatusBadge = ({ status, size = "medium" }) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.default;

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

/* ---------- Professional Rating System ---------- */
const RatingDisplay = ({ rating, reviewCount, size = "sm" }) => {
    const sizeClasses = {
        sm: { stars: "h-3 w-3", text: "text-xs" },
        md: { stars: "h-4 w-4", text: "text-sm" },
        lg: { stars: "h-5 w-5", text: "text-base" }
    };

    if (rating == null) {
        return (
            <span className={`text-gray-400 ${sizeClasses[size].text}`}>No ratings</span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <StarIcon
                        key={i}
                        className={`${sizeClasses[size].stars} ${
                            i < Math.floor(rating)
                                ? "text-amber-400"
                                : i < Math.ceil(rating)
                                    ? "text-amber-300"
                                    : "text-gray-200"
                        }`}
                    />
                ))}
            </div>
            <span className={`text-gray-600 font-medium ${sizeClasses[size].text}`}>
                {rating.toFixed(1)} ({reviewCount})
            </span>
        </div>
    );
};

/* ---------- Mobile-Optimized Progress Tracker ---------- */
const ProgressTracker = ({ inquiry }) => {
    // Check if inquiry status contains "Closed" (case insensitive)
    const isClosed = inquiry?.status?.toLowerCase().includes('closed');

    const steps = [
        { key: "submitted", label: "Submitted", status: "completed" },

        {
            key: "reviewed",
            label: "Reviewed",
            status: isClosed
                ? "completed"
                : (inquiry?.status?.trim() === "Accepted" ? "completed" : "upcoming")
        },

        {
            key: "scheduled",
            label: "Scheduled",
            status: isClosed
                ? "completed"
                : (inquiry?.trippings?.length > 0 ? "completed" : "upcoming")
        },

        {
            key: "completed",
            label: "Completed",
            status: isClosed
                ? "completed"
                : (inquiry?.status?.trim() === "closed" ? "completed" : "upcoming")
        }
    ];


    const currentStep = isClosed ? -1 : steps.findIndex(step => step.status === 'upcoming');

    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-900">Progress</span>
                <span className="text-xs text-gray-500">
                    {isClosed ? 'Completed' : `Step ${currentStep === -1 ? 4 : currentStep + 1} of 4`}
                </span>
            </div>

            <div className="flex items-center px-2">
                {steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                step.status === 'completed'
                                    ? 'bg-primary-500 border-primary-500 text-white'
                                    : step.status === 'current'
                                        ? 'bg-white border-primary-500 text-primary-500'
                                        : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                                {step.status === 'completed' ? (
                                    <FontAwesomeIcon icon={faCheckDouble} className="w-2 h-2 sm:w-3 sm:h-3" />
                                ) : (
                                    <span className="text-xs font-medium">{index + 1}</span>
                                )}
                            </div>
                            <span className={`text-xs mt-2 font-medium text-center px-1 ${
                                step.status === 'completed' || step.status === 'current'
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${
                                step.status === 'completed' ? 'bg-primary-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Show completion message for closed inquiries */}
            {isClosed && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-xs text-green-700 font-medium">
                        ✓ All steps completed successfully
                    </p>
                </div>
            )}
        </div>
    );
};

/* ---------- Mobile-Optimized Property Card ---------- */
function PropertyCard({ property, inquiry }) {
    return (
        <div className="card-flat p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
            <img
                src={property?.image_url ? `/storage/${property.image_url}` : '/placeholder.png'}
                alt={property?.title}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover shadow-inner flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {property?.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{property?.address}</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                    {peso(property?.price)}
                </p>
            </div>
        </div>
    );
}

/* ---------- Mobile-Optimized Contact Card ---------- */
function ContactCard({ contact, inquiry, compact = false }) {
    const { rating, reviews } = useMemo(() => {
        const feedbacks = contact?.feedback_received || contact?.feedback_as_receiver || [];
        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
            : null;
        return { rating: avgRating, reviews: feedbacks.length };
    }, [contact]);

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="avatar-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                    {contact?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{contact?.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {rating != null ? (
                            <>
                                <StarIcon className="h-3 w-3 text-amber-400" />
                                <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
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
        <div className="card p-3 sm:p-4">
            <div className="flex items-start gap-3">
                <div className="avatar-sm sm:avatar-md bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                    {contact?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{contact?.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Real Estate Agent</p>
                    <RatingDisplay rating={rating} reviewCount={reviews} size="sm" />
                </div>
            </div>

            <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact?.email || 'Email not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact?.phone || 'Phone not provided'}</span>
                </div>
            </div>

            <button
                onClick={() => router.visit(`/agents/${contact?.id}`)}
                className="bg-gray-200 py-2 rounded-md w-full mt-3 text-xs sm:text-sm"
            >
                View Profile
            </button>
        </div>
    );
}

/* ---------- Mobile-Optimized Inquiry Actions ---------- */
function InquiryActions({ inquiry, onScheduleVisit, onCancel }) {
    const isAccepted = inquiry?.status === 'accepted';
    const hasVisit = inquiry?.trippings?.length > 0;
    const isClosed = inquiry?.status?.toLowerCase().includes('closed');

    return (
        <div className="space-y-2 sm:space-y-3">
            {isClosed ? (
                <div className="alert alert-success text-center py-2 text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faHandshakeSimple} className="mr-1 sm:mr-2" />
                    Deal Successfully Closed
                </div>
            ) : isAccepted && !hasVisit ? (
                <button
                    onClick={() => onScheduleVisit(inquiry)}
                    className="btn-primary w-full text-xs sm:text-sm"
                >
                    <FontAwesomeIcon icon={faCalendarPlus} className="mr-1 sm:mr-2" />
                    Schedule Visit
                </button>
            ) : isAccepted && hasVisit ? (
                <div className="alert alert-success text-center py-2 text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-1 sm:mr-2" />
                    Visit Scheduled
                </div>
            ) : null}

            {!isClosed && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onCancel(inquiry)}
                        className="btn-outline text-xs sm:text-sm text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
                        Cancel
                    </button>
                    <Link
                        href={`/inquiries/${inquiry.id}`}
                        className="btn-secondary text-xs sm:text-sm text-center"
                    >
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Details
                    </Link>
                </div>
            )}

            {isClosed && (
                <Link
                    href={`/inquiries/${inquiry.id}`}
                    className="btn-primary w-full text-xs sm:text-sm text-center"
                >
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    View Details
                </Link>
            )}
        </div>
    );
}

/* ---------- Mobile Inquiry Card (for small screens) ---------- */
function MobileInquiryCard({ inquiry, onScheduleVisit, onCancel }) {
    const property = inquiry.property;
    const contact = inquiry.agent || inquiry.broker;
    const isClosed = inquiry?.status?.toLowerCase().includes('closed');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 space-y-4"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <StatusBadge status={inquiry.status} size="small" />
                    <span className="text-xs text-gray-500">
                        {dayjs(inquiry.created_at).format('MMM DD')}
                    </span>
                </div>
            </div>

            {/* Property Info */}
            <div className="flex items-start gap-3">
                <img
                    src={property?.image_url ? `/storage/${property.image_url}` : '/placeholder.png'}
                    alt={property?.title}
                    className="w-12 h-12 rounded-lg object-cover shadow-inner flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {property?.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{property?.address}</span>
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {peso(property?.price)}
                    </p>
                </div>
            </div>

            {/* Progress Tracker */}
            <ProgressTracker inquiry={inquiry} />

            {/* Contact (Compact) */}
            {contact && (
                <ContactCard contact={contact} inquiry={inquiry} compact />
            )}

            {/* Actions */}
            <InquiryActions
                inquiry={inquiry}
                onScheduleVisit={onScheduleVisit}
                onCancel={onCancel}
            />
        </motion.div>
    );
}

/* ---------- Main Professional Component ---------- */
export default function Inquiries({
                                      inquiries = { data: [], links: [] },
                                      status = "",
                                      allCount = 0,
                                      pendingCount = 0,
                                      acceptedCount = 0,
                                      cancelledCount = 0,
                                      rejectedCount = 0,
                                  }) {
    const [isAddVisitModal, setIsAddVisitModal] = useState(false);
    const [selectedVisitData, setSelectedVisitData] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelId, setCancelId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(status?.trim() ? status : "All");
    const [sortBy, setSortBy] = useState('latest');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const list = arr(inquiries?.data);

    const sortedInquiries = useMemo(() => {
        return [...list].sort((a, b) => {
            switch (sortBy) {
                case 'latest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
    }, [list, sortBy]);

    const handleCancelInquiry = () => {
        if (!cancelId) return;
        router.patch(`/inquiries/${cancelId}/cancel`, {}, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
                setCancelId(null);
            },
        });
    };

    const handleScheduleVisit = (inquiry) => {
        setSelectedVisitData({
            property: inquiry.property,
            agent: inquiry.agent,
            broker: inquiry.broker,
            inquiryId: inquiry.id,
        });
        setIsAddVisitModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inquiry Management" />

            {/* Modals */}
            {isAddVisitModal && (
                <ScheduleVisitModal
                    open={isAddVisitModal}
                    setOpen={setIsAddVisitModal}
                    visitData={selectedVisitData}
                />
            )}
            <ConfirmDialog
                onConfirm={handleCancelInquiry}
                confirmText="Cancel Inquiry"
                open={isCancelModalOpen}
                setOpen={setIsCancelModalOpen}
                title="Cancel Inquiry"
                description="Are you sure you want to cancel this inquiry? This action cannot be undone."
                cancelText="Keep Inquiry"
            />

            <div className="page-container">
                <div className="page-content">
                    {/* Header */}
                    <div className="page-header pb-4 md:pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="section-title text-2xl sm:text-3xl font-bold">Inquiry Management</h1>
                                <p className="section-description text-gray-600 text-sm sm:text-base max-w-2xl">
                                    Track and manage your property inquiries with real-time updates and progress tracking
                                </p>
                            </div>
                            <Link
                                href="/all-properties"
                                className="btn-primary w-full sm:w-auto justify-center"
                            >
                                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                Browse Properties
                            </Link>
                        </div>
                    </div>

                    {/* Stats Overview - Mobile Optimized */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <StatsCard
                            title="Total Inquiries"
                            value={allCount}
                            icon={faMessage}
                            color="primary"
                        />
                        <StatsCard
                            title="Under Review"
                            value={pendingCount}
                            icon={faClock}
                            color="warning"
                        />
                        <StatsCard
                            title="Accepted"
                            value={acceptedCount}
                            icon={faCircleCheck}
                            color="accent"
                        />
                        <StatsCard
                            title="Closed/Declined"
                            value={cancelledCount + rejectedCount}
                            icon={faBusinessTime}
                            color="secondary"
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="btn-outline w-full justify-center"
                        >
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Filters & Sort
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
                                            <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Filters Content */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                            {/* Status Filter */}
                                            <div>
                                                <label className="form-label">Filter by Status</label>
                                                <BuyerInquiriesFilterTab
                                                    setSelectedStatus={setSelectedStatus}
                                                    count={[allCount, pendingCount, acceptedCount, cancelledCount, rejectedCount]}
                                                    selectedStatus={selectedStatus}
                                                    mobile
                                                />
                                            </div>

                                            {/* Sort Options */}
                                            <div>
                                                <label className="form-label">Sort By</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="form-select text-sm"
                                                >
                                                    <option value="latest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                    <option value="status">By Status</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200">
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="btn-primary w-full"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Desktop Filters and Controls */}
                    <div className="hidden lg:block card p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <BuyerInquiriesFilterTab
                                setSelectedStatus={setSelectedStatus}
                                count={[allCount, pendingCount, acceptedCount, cancelledCount, rejectedCount]}
                                selectedStatus={selectedStatus}
                            />

                            <div className="flex items-center gap-3">
                                <div className="form-group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="form-select text-sm"
                                    >
                                        <option value="latest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="status">By Status</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiries List */}
                    {sortedInquiries.length === 0 ? (
                        <div className="card text-center p-6 sm:p-8 md:p-12 animate-fade-in">
                            <div className="avatar-lg mx-auto mb-4 sm:mb-6 bg-gray-100">
                                <FontAwesomeIcon icon={faFolderOpen} className="text-xl sm:text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No inquiries found</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-6">Start by exploring properties and sending inquiries to agents.</p>
                            <Link
                                href="/all-properties"
                                className="btn-primary text-sm sm:text-base"
                            >
                                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            <AnimatePresence>
                                {sortedInquiries.map((inquiry) => (
                                    <React.Fragment key={inquiry.id}>
                                        {/* Mobile View */}
                                        <div className="lg:hidden">
                                            <MobileInquiryCard
                                                inquiry={inquiry}
                                                onScheduleVisit={handleScheduleVisit}
                                                onCancel={() => {
                                                    setCancelId(inquiry.id);
                                                    setIsCancelModalOpen(true);
                                                }}
                                            />
                                        </div>

                                        {/* Desktop View */}
                                        <div className="hidden lg:block card">
                                            <div className="card-body">
                                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                                                    {/* Property Information */}
                                                    <div className="xl:col-span-2">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className='bg-gray-200 p-2 rounded-xl '>
                                                                         {inquiry.status}
                                                                    </span>

                                                                    <span className="text-sm text-gray-500">
                                                                        {formatDate(inquiry.created_at)}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-xl font-semibold text-gray-900">
                                                                    {inquiry.property?.title}
                                                                </h3>
                                                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                                                                    {inquiry.property?.address}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 ml-4">
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                    {peso(inquiry.property?.price)}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {inquiry.property?.property_type} • {inquiry.property?.sub_type}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Message */}
                                                        <div className="gray-card">
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Your message:</span> {inquiry.notes || "No message provided."}
                                                            </p>
                                                        </div>

                                                        {/* Progress Tracker */}
                                                        <ProgressTracker inquiry={inquiry} />
                                                    </div>

                                                    {/* Contact and Actions */}
                                                    <div className="space-y-4">
                                                        <ContactCard contact={inquiry.agent || inquiry.broker} inquiry={inquiry} />
                                                        <InquiryActions
                                                            inquiry={inquiry}
                                                            onScheduleVisit={handleScheduleVisit}
                                                            onCancel={() => {
                                                                setCancelId(inquiry.id);
                                                                setIsCancelModalOpen(true);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
