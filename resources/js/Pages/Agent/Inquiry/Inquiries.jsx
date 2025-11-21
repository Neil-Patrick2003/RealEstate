// resources/js/Pages/Agents/Inquiries.jsx
import AgentLayout from '@/Layouts/AgentLayout';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AgentInquiriesFilterTab from '@/Components/tabs/AgentInquiriesFilterTab.jsx';
import ConfirmDialog from '@/Components/modal/ConfirmDialog.jsx';
import {
    Search, ChevronDown, Check, X, Mail, Phone, MapPin, Home, Clock, Calendar, MessageSquare, User, Tag, Send
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPesoSign } from '@fortawesome/free-solid-svg-icons';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

dayjs.extend(relativeTime);

const cn = (...c) => c.filter(Boolean).join(' ');
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

/* ==== Professional Status Badges ==== */
const STATUS_THEME = {
    accepted: 'badge-success',
    rejected: 'badge-error',
    pending: 'badge-warning',
    cancelled: 'badge-gray',
    default: 'badge-secondary',
};

function StatusBadge({ status = '' }) {
    const s = status?.toLowerCase?.() || '';
    const cls = STATUS_THEME[s] || STATUS_THEME.default;
    const Icon = s === 'accepted' ? Check : s === 'rejected' ? X : Clock;

    return (
        <span className={cn('badge', cls)}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
}

function TypePill({ inquiry }) {
    const isBuyerInquiry = inquiry?.buyer_id && !inquiry?.seller_id;
    const isAgentRequest = inquiry?.agent_id && inquiry?.property_id;

    let label = 'Internal Inquiry';
    let cls = 'badge-gray';

    if (isBuyerInquiry) {
        label = 'Client Request';
        cls = 'badge-primary';
    } else if (isAgentRequest) {
        label = inquiry?.seller_id ? 'Seller Request' : 'Agent Inquiry';
        cls = 'badge-accent';
    }

    return (
        <span className={cn("badge", cls)}>
            <Tag className="w-3 h-3" />
            {label}
        </span>
    );
}

function Avatar({ name, photo_url }) {
    const initials = (name || '?').slice(0, 1).toUpperCase();

    if (photo_url) {
        return (
            <img
                src={`/storage/${photo_url}`}
                alt={`${name || 'User'} avatar`}
                className='avatar-md rounded-full object-cover border-2 border-white shadow-sm shrink-0'
                onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                }}
            />
        );
    }

    return (
        <div
            className='avatar-md rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 shadow-sm'
            title={name || 'User'}
        >
            <span className="text-sm font-semibold">{initials}</span>
        </div>
    );
}

export default function Inquiries({
                                      inquiries,
                                      inquiriesCount,
                                      rejectedCount,
                                      acceptedCount,
                                      pendingCount,
                                      cancelledCount,
                                      page = 1,
                                      itemsPerPage = 10,
                                      status = '',
                                      buyerInquiryCount,
                                      sellerInquiryCount,
                                  }) {
    /* ---------- local state ---------- */
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedType, setSelectedType] = useState('my');
    const [searchRaw, setSearchRaw] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');

    const [selectedId, setSelectedId] = useState(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [isOpenAcceptDialog, setIsOpenAcceptDialog] = useState(false);
    const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);
    const [loadingPatch, setLoadingPatch] = useState(false);

    /* debounce search */
    useEffect(() => {
        const id = setTimeout(() => setSearch(searchRaw.trim().toLowerCase()), 250);
        return () => clearTimeout(id);
    }, [searchRaw]);

    /* ---------- actions ---------- */
    const handleAccept = () => {
        if (!selectedId) return;
        setLoadingPatch(true);
        router.patch(`/agents/inquiries/${selectedId}/accept`, {}, {
            onSuccess: () => {
                setSelectedId(null);
                setIsOpenAcceptDialog(false);
            },
            onFinish: () => setLoadingPatch(false),
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        if (!selectedId) return;
        setLoadingPatch(true);
        router.patch(`/agents/inquiries/${selectedId}/reject`, {}, {
            onSuccess: () => {
                setSelectedId(null);
                setIsOpenRejectDialog(false);
            },
            onFinish: () => setLoadingPatch(false),
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        if (!selectedId) return;
        setLoadingPatch(true);
        router.patch(`/agents/inquiries/${selectedId}`, {}, {
            onSuccess: () => {
                setSelectedId(null);
                setOpenCancelDialog(false);
            },
            onFinish: () => setLoadingPatch(false),
            preserveScroll: true,
        });
    };

    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = Number(e.target.value);
        setSelectedItemsPerPage(newItemsPerPage);
        router.get(
            '/agents/inquiries',
            { page: 1, items_per_page: newItemsPerPage, status },
            { preserveState: true, replace: true }
        );
    };

    /* ---------- derived data ---------- */
    const rows = useMemo(() => {
        let list = Array.isArray(inquiries?.data) ? inquiries.data : [];

        if (search) {
            list = list.filter((inq) => {
                const p = inq?.property || {};
                const buyer = inq?.buyer || {};
                const seller = inq?.seller || {};
                const hay = `${p.title || ''} ${p.address || ''} ${buyer.name || ''} ${seller.name || ''} ${inq.status || ''}`.toLowerCase();
                return hay.includes(search);
            });
        }

        list = [...list].sort((a, b) => {
            if (sort === 'price_asc') return (a?.property?.price ?? Infinity) - (b?.property?.price ?? Infinity);
            if (sort === 'price_desc') return (b?.property?.price ?? -Infinity) - (a?.property?.price ?? -Infinity);
            const A = new Date(a?.created_at || 0).valueOf();
            const B = new Date(b?.created_at || 0).valueOf();
            return B - A;
        });

        return list;
    }, [inquiries?.data, search, sort]);

    /* ---------- improved card component ---------- */
    const Card = ({ inquiry }) => {
        const property = inquiry.property ?? {};
        const buyer = inquiry.buyer ?? null;
        const seller = inquiry.seller ?? null;

        const price = property.price != null ? money.format(Number(property.price)) : 'N/A';
        const contact = (seller || buyer);
        const agentStatus = inquiry.status?.toLowerCase();

        return (
            <div className="card card-hover animate-fade-in">
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Property & Message Section */}
                    <div className="lg:col-span-8 flex flex-col sm:flex-row gap-5">
                        {/* Property Image */}
                        <div className="relative rounded-lg overflow-hidden w-full sm:w-[150px] h-[120px] shadow-md shrink-0 border border-gray-200">
                            <img
                                src={property.image_url ? `/storage/${property.image_url}` : '/placeholder.png'}
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                alt={property.title ?? 'Property Image'}
                                className="property-card-image"
                                loading="lazy"
                            />
                            {/* Price Overlay */}
                            <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                <FontAwesomeIcon icon={faPesoSign} className="h-3" />
                                {price}
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div className='mb-3'>
                                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3'>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                                        {property.title ?? 'Unknown Property'}
                                    </h3>
                                    <StatusBadge status={inquiry.status} />
                                </div>

                                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                    <span className="line-clamp-2">{property.address ?? 'No address provided'}</span>
                                </p>
                            </div>

                            {/* Metadata & Message Preview */}
                            <div className="space-y-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                    <p className='flex items-center gap-1.5 font-medium text-gray-700'>
                                        <Home className="w-4 h-4 text-primary-500" />
                                        {property.property_type ?? 'Type'}
                                        {property.sub_type ? ` - ${property.sub_type}` : ''}
                                    </p>
                                    <p className='flex items-center gap-1.5 text-xs'>
                                        <Send className="w-4 h-4 text-gray-400" />
                                        Sent {dayjs(inquiry.created_at).fromNow()}
                                    </p>
                                </div>

                                {/* Message Preview */}
                                <div className="gray-card p-3 rounded-md">
                                    <p className="flex items-start gap-2 text-sm text-gray-800">
                                        <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>
                                            <span className='font-semibold'>Notes:</span> {inquiry?.notes || 'No message provided.'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Actions Section */}
                    <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-4 lg:pt-0">
                        {/* Contact Header */}
                        <div className="flex items-center pb-3 border-b border-gray-100 mb-4">
                            <Avatar name={contact?.name} photo_url={contact?.photo_url}/>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {contact?.name || '—'}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {seller ? 'Seller' : buyer ? 'Buyer' : 'Client Profile'}
                                </p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-sm text-gray-600 mb-4 space-y-2.5">
                            <p className='flex items-center gap-3'>
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className='truncate font-medium'>{contact?.email || 'N/A'}</span>
                            </p>
                            <p className='flex items-center gap-3'>
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className='font-medium'>{contact?.phone || 'N/A'}</span>
                            </p>
                        </div>

                        {/* Inquiry Type */}
                        <div className='mt-auto mb-4'>
                            <TypePill inquiry={inquiry} />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            {/* Agent-initiated inquiries */}
                            {inquiry.seller_id && (
                                agentStatus === 'accepted' ? (
                                    <Link
                                        href={`/agents/my-listings/${inquiry.property?.id}`}
                                        className="btn btn-primary btn-sm text-center"
                                        aria-label="View in My Listing"
                                    >
                                        View Listing
                                    </Link>
                                ) : (
                                    <button
                                        className="btn btn-secondary btn-sm cursor-not-allowed opacity-75"
                                        disabled
                                    >
                                        {inquiry.status}
                                    </button>
                                )
                            )}

                            {/* Buyer inquiry actions */}
                            {!inquiry.seller_id && (
                                <>
                                    {agentStatus === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-success flex-1 btn-sm"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenAcceptDialog(true);
                                                }}
                                                aria-label={`Accept inquiry ${inquiry.id}`}
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline flex-1 btn-sm !border-red-300 !text-red-600 hover:!bg-red-50"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenRejectDialog(true);
                                                }}
                                                aria-label={`Reject inquiry ${inquiry.id}`}
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {agentStatus === 'accepted' && (
                                        <Link
                                            href={`/agents/trippings/create?inquiry=${inquiry.id}`}
                                            className="btn btn-primary btn-sm text-center"
                                            aria-label={`Create tripping for inquiry ${inquiry.id}`}
                                        >
                                            Schedule Visit
                                        </Link>
                                    )}

                                    {/* Fallback for other statuses */}
                                    {!['pending', 'accepted'].includes(agentStatus) && (
                                        <button
                                            className="btn btn-secondary btn-sm cursor-not-allowed opacity-75"
                                            disabled
                                        >
                                            {inquiry.status}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /* ---------- render ---------- */
    return (
        <AuthenticatedLayout>
            {/* --- Dialogs --- */}
            <ConfirmDialog
                open={openCancelDialog}
                setOpen={setOpenCancelDialog}
                title="Cancel Inquiry"
                description="Are you sure you want to cancel this inquiry? This action cannot be undone."
                confirmText="Confirm"
                cancelText="Close"
                onConfirm={handleCancel}
                loading={loadingPatch}
            />
            <ConfirmDialog
                open={isOpenAcceptDialog}
                setOpen={setIsOpenAcceptDialog}
                title="Accept Client Inquiry"
                description="Accepting this inquiry will notify the client and enable scheduling a site visit."
                confirmText="Accept"
                cancelText="Close"
                onConfirm={handleAccept}
                loading={loadingPatch}
            />
            <ConfirmDialog
                open={isOpenRejectDialog}
                setOpen={setIsOpenRejectDialog}
                title="Reject Client Inquiry"
                description="Are you sure you want to reject this inquiry? You may want to follow up with the client regarding other options."
                confirmText="Reject"
                cancelText="Close"
                onConfirm={handleReject}
                loading={loadingPatch}
            />

            <div className="page-container">
                <div className="page-content">
                    {/* 🧭 Header & Controls */}
                    <div className="section">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 gradient-text">Inquiry Management</h1>
                                <p className="section-description">
                                    View and process all client requests and internal property inquiries.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                {/* Search Input */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        value={searchRaw}
                                        onChange={(e) => setSearchRaw(e.target.value)}
                                        placeholder="Search property, client, status…"
                                        className="form-input pl-9 w-full"
                                        aria-label="Search inquiries"
                                    />
                                </div>

                                {/* Items Per Page Dropdown */}
                                <div className="relative">
                                    <select
                                        value={selectedItemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="form-select w-32"
                                        title="Items per page"
                                    >
                                        {[10, 20, 30, 50].map((n) => (
                                            <option key={n} value={n}>{n} / page</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 🏷️ Status Tabs */}
                        <div className="glass-card p-3">
                            <AgentInquiriesFilterTab
                                count={[inquiriesCount, sellerInquiryCount, buyerInquiryCount]}
                                selectedStatus={status}
                                selectedType={selectedType}
                                setSelectedType={setSelectedType}
                                page={page}
                                selectedItemsPerPage={selectedItemsPerPage}
                            />
                        </div>
                    </div>

                    {/* 📝 Inquiry List */}
                    <div className="section">
                        {!inquiries?.data?.length ? (
                            <div className="card p-12 text-center">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Inquiries Found</h3>
                                <p className="text-gray-500">
                                    You currently have no pending, accepted, or rejected inquiries based on the active filters.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rows.map((inquiry) => (
                                    <Card key={inquiry.id} inquiry={inquiry} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 📄 Pagination */}
                    {Array.isArray(inquiries?.links) && inquiries.links.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center items-center pt-8">
                            {inquiries.links.map((link, idx) =>
                                link.url ? (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={cn(
                                            'btn btn-sm',
                                            link.active
                                                ? 'btn-primary'
                                                : 'btn-outline'
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={idx}
                                        className="btn btn-outline btn-sm cursor-not-allowed opacity-50"
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
