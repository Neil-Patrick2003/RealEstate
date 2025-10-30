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
// Keeping faPesoSign for specific currency clarity
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPesoSign } from '@fortawesome/free-solid-svg-icons';


dayjs.extend(relativeTime);

const cn = (...c) => c.filter(Boolean).join(' ');
// Consistent currency formatting
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

/* ==== Professional Status Badges ==== */
const STATUS_THEME = {
    // Subtle colors with strong text for data clarity
    accepted: 'bg-green-50 text-green-700 font-medium border border-green-200',
    rejected: 'bg-red-50 text-red-600 font-medium border border-red-200',
    pending: 'bg-amber-50 text-amber-700 font-medium border border-amber-200',
    cancelled: 'bg-gray-100 text-gray-600 font-medium border border-gray-300',
    default: 'bg-blue-50 text-blue-700 font-medium border border-blue-200',
};

function StatusBadge({ status = '' }) {
    const s = status?.toLowerCase?.() || '';
    const cls = STATUS_THEME[s] || STATUS_THEME.default;
    const Icon = s === 'accepted' ? Check : s === 'rejected' ? X : Clock;

    return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs transition-colors duration-150', cls)}>
            <Icon className="w-3.5 h-3.5 mr-1" />
            {status}
        </span>
    );
}

function TypePill({ inquiry }) {
    const isBuyerInquiry = inquiry?.buyer_id && !inquiry?.seller_id;
    const isAgentRequest = inquiry?.agent_id && inquiry?.property_id;

    let label = 'Internal Inquiry';
    // Using simple, professional grays/primary for type identification
    let cls = 'bg-gray-100 text-gray-700';

    if (isBuyerInquiry) {
        label = 'Client Request';
        cls = 'bg-primary/10 text-primary font-medium'; // Primary color for direct client business
    } else if (isAgentRequest) {
        label = inquiry?.seller_id ? 'Seller Request' : 'Agent Inquiry';
        cls = 'bg-blue-100 text-blue-700 font-medium';
    }

    return (
        <span className={cn("inline-flex items-center text-[11px] px-2 py-0.5 rounded-full", cls)}>
            <Tag className="w-3 h-3 mr-1" />
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
                className='w-10 h-10 rounded-full object-cover border-2 border-white bg-white shadow-sm shrink-0'
                onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                }}
            />
        );
    }
    // Professional neutral fallback
    return (
        <div
            className='w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center shrink-0 shadow-sm'
            title={name || 'User'}
        >
            <span className="text-sm font-medium">{initials}</span>
        </div>
    );
}

export default function Inquiries({
                                      inquiries,           // paginator
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
    /* ---------- local state (UNCHANGED LOGIC) ---------- */
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

    /* ---------- actions (UNCHANGED LOGIC) ---------- */
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

    /* ---------- derived data (UNCHANGED LOGIC) ---------- */
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

    /* ---------- card (PROFESSIONAL REDESIGN) ---------- */
    const Card = ({ inquiry }) => {
        const property = inquiry.property ?? {};
        const buyer = inquiry.buyer ?? null;
        const seller = inquiry.seller ?? null;

        const price = property.price != null ? money.format(Number(property.price)) : 'N/A';
        const contact = (seller || buyer);
        const agentStatus = inquiry.status?.toLowerCase();


        return (
            <div className="bg-white rounded-xl  hover:shadow-xl transition-all duration-200 overflow-hidden  ">
                <div className="p-5 grid grid-cols-12 gap-x-6 gap-y-4">

                    {/* LEFT: Property & Message (Span 8/12) */}
                    <div className="col-span-12 lg:col-span-8 flex gap-5">

                        {/* Image */}
                        <div className="relative rounded-lg overflow-hidden w-full max-w-[150px] h-[120px] shadow-md shrink-0 border border-gray-100">
                            <img
                                src={property.image_url ? `/storage/${property.image_url}` : '/placeholder.png'}
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                alt={property.title ?? 'Property Image'}
                                className="w-full h-full object-cover transition-transform duration-300"
                                loading="lazy"
                            />
                            {/* Price chip */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <FontAwesomeIcon icon={faPesoSign} className="h-3" />
                                {price}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div className='mb-2'>
                                <div className='flex items-start justify-between gap-4'>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-1">
                                        {property.title ?? 'Unknown Property'}
                                    </h3>
                                    <StatusBadge status={inquiry.status} />
                                </div>

                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2 truncate">
                                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    {property.address ?? 'No address provided'}
                                </p>
                            </div>

                            {/* Metadata & Message Preview */}
                            <div className="flex flex-col gap-1 text-sm text-gray-500 pt-2 border-t border-gray-100">
                                <div className='flex items-center justify-between'>
                                    <p className='flex items-center gap-1.5 font-medium text-gray-700'>
                                        <Home className="w-4 h-4 text-primary" />
                                        {property.property_type ?? 'Type'}
                                        {property.sub_type ? ` - ${property.sub_type}` : ''}
                                    </p>
                                    <p className='flex items-center gap-1.5'>
                                        <Send className="w-4 h-4 text-gray-400" />
                                        Sent {dayjs(inquiry.created_at).fromNow()}
                                    </p>
                                </div>

                                {/* Message Preview (Subtle background highlight) */}
                                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 mt-1">
                                    <p className="flex items-start gap-2 max-w-full line-clamp-2">
                                        <MessageSquare className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                        <span className='font-medium'>Notes:</span> {inquiry?.notes || 'No message provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Contact & Actions (Span 4/12) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-4 lg:pt-0">

                        {/* Who */}
                        <div className="flex items-center pb-3 border-b border-gray-100 mb-3">
                            <Avatar name={contact?.name} photo_url={contact?.photo_url}/>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {contact?.name || '—'}
                                </p>
                                <p className="text-xs text-gray-500">{seller ? 'Seller' : buyer ? 'Buyer' : 'Client Profile'}</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-sm text-gray-600 mb-3 space-y-2">
                            <p className='flex items-center gap-3'>
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className='truncate'>{(contact?.email) || 'N/A'}</span>
                            </p>
                            <p className='flex items-center gap-3'>
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{(contact?.phone) || 'N/A'}</span>
                            </p>
                        </div>

                        <div className='mt-auto pt-2'>
                            <TypePill inquiry={inquiry} />
                        </div>

                        {/* Actions (Clear, high-priority primary actions) */}
                        <div className="flex gap-2 mt-3">
                            {/* Agent-initiated */}
                            {inquiry.seller_id && (
                                agentStatus === 'accepted' ? (
                                    <Link
                                        href={`/agents/my-listings/${inquiry.property?.id}`}
                                        className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 text-center transition shadow-md"
                                        aria-label="View in My Listing"
                                    >
                                        View Listing
                                    </Link>
                                ) : (
                                    <button
                                        className="flex-1 border border-gray-300 py-2 rounded-lg text-sm text-gray-600 bg-gray-50 cursor-not-allowed font-medium"
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
                                        <div className="flex gap-2 w-full">
                                            <button
                                                type="button"
                                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition shadow-md"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenAcceptDialog(true);
                                                }}
                                                aria-label={`Accept inquiry ${inquiry.id}`}
                                            >
                                                <Check className="w-4 h-4 inline mr-1" />
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 px-3 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenRejectDialog(true);
                                                }}
                                                aria-label={`Reject inquiry ${inquiry.id}`}
                                            >
                                                <X className="w-4 h-4 inline mr-1" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {agentStatus === 'accepted' && (
                                        <Link
                                            href={`/agents/trippings/create?inquiry=${inquiry.id}`}
                                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold transition text-center text-sm hover:bg-primary/90 shadow-md"
                                            aria-label={`Create tripping for inquiry ${inquiry.id}`}
                                        >
                                            Schedule Visit
                                        </Link>
                                    )}

                                    {/* Fallback for other statuses */}
                                    {['pending', 'accepted'].includes(agentStatus) ? null : (
                                        <button
                                            className="flex-1 border border-gray-300 py-2 rounded-lg text-sm text-gray-600 bg-gray-50 cursor-not-allowed font-medium"
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
        <AgentLayout>
            {/* --- Dialogs (UNCHANGED) --- */}
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

            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* 🧭 Header & Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inquiry Management Console</h1>
                        <p className="text-sm text-gray-600 mt-1">View and process all client requests and internal property inquiries.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Search Input (Standardized) */}
                        <div className="relative w-full sm:w-[240px] shrink-0">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={searchRaw}
                                onChange={(e) => setSearchRaw(e.target.value)}
                                placeholder="Search property, client, status…"
                                className="pl-9 pr-3 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none w-full transition"
                                aria-label="Search inquiries"
                            />
                        </div>

                        {/* Items Per Page Dropdown (Standardized) */}
                        <div className="relative inline-flex items-center shrink-0">
                            <select
                                value={selectedItemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="pl-3 pr-8 py-2.5 text-sm rounded-lg border border-gray-300 bg-white appearance-none cursor-pointer focus:ring-1 focus:ring-primary/40 transition"
                                title="Items per page"
                            >
                                {[10, 20, 30, 50].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 🏷️ Status Tabs (Clean, professional segment) */}
                <div className="rounded-lg bg-white p-2 shadow-sm border border-gray-200 overflow-x-auto">
                    <AgentInquiriesFilterTab
                        count={[inquiriesCount, sellerInquiryCount, buyerInquiryCount]}
                        selectedStatus={status}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        page={page}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>

                {/* 📝 List */}
                {!inquiries?.data?.length ? (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800">No Inquiries Found</h3>
                        <p className="text-sm mt-1">You currently have no pending, accepted, or rejected inquiries based on the active filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rows.map((inquiry) => (
                            <Card key={inquiry.id} inquiry={inquiry} />
                        ))}
                    </div>
                )}

                {/* 📄 Pagination */}
                {Array.isArray(inquiries?.links) && inquiries.links.length > 1 && (
                    <div className="flex flex-wrap gap-2 justify-center items-center pt-6">
                        {inquiries.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                                        link.active
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="px-4 py-2 text-sm text-gray-400 bg-white rounded-lg border border-gray-200 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </AgentLayout>
    );
}
