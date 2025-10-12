// resources/js/Pages/Agents/Inquiries.jsx
import AgentLayout from '@/Layouts/AgentLayout';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AgentInquiriesFilterTab from '@/Components/tabs/AgentInquiriesFilterTab.jsx';
import ConfirmDialog from '@/Components/modal/ConfirmDialog.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faClock,
    faEnvelope,
    faHouseChimney,
    faLocationDot,
    faPesoSign,
    faPhone,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, ArrowUpDown, Eye } from 'lucide-react';

dayjs.extend(relativeTime);

const cn = (...c) => c.filter(Boolean).join(' ');
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

/* ==== theme-aligned badges ==== */
const STATUS_THEME = {
    accepted: 'bg-green-50 text-green-700 border border-green-200',
    rejected: 'bg-red-50 text-red-600 border border-red-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    cancelled: 'bg-gray-50 text-gray-600 border border-gray-200',
    default: 'bg-primary/10 text-primary border border-primary/20',
};

function StatusBadge({ status = '' }) {
    const s = status?.toLowerCase?.() || '';
    const cls = STATUS_THEME[s] || STATUS_THEME.default;
    return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', cls)}>
      <FontAwesomeIcon icon={faClock} className="mr-1" />
            {status}
    </span>
    );
}

function TypePill({ inquiry }) {
    const label =
        inquiry?.buyer_id && !inquiry?.seller_id
            ? 'Buyer Request'
            : inquiry?.agent_id && inquiry?.property_id
                ? 'My Request'
                : 'Unknown Type';
    return (
        <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
      {label}
    </span>
    );
}

function Avatar({ name, photo_url, size = 40, altSuffix = '' }) {
    const initials = (name || '?').slice(0, 1).toUpperCase();
    const px = `w-[${size}px] h-[${size}px]`;
    if (photo_url) {
        return (
            <img
                src={`/storage/${photo_url}`}
                alt={`${name || 'User'} ${altSuffix}`.trim()}
                className={cn('rounded-full object-cover border bg-white', px)}
                onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                }}
            />
        );
    }
    return (
        <div
            className={cn('rounded-full bg-secondary text-white border flex items-center justify-center w-8 h-8' ,  )}
            title={name || 'User'}
        >
            <span className="text-xs">{initials}</span>
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
    /* ---------- local state ---------- */
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [selectedType, setSelectedType] = useState('my'); // 'my' | 'buyer' | 'seller'
    const [searchRaw, setSearchRaw] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest'); // newest | price_asc | price_desc

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

    /* ---------- card ---------- */
    const Card = ({ inquiry }) => {
        const property = inquiry.property ?? {};
        const buyer = inquiry.buyer ?? null;
        const seller = inquiry.seller ?? null;

        const price = property.price != null ? money.format(Number(property.price)) : 'N/A';
        const sentWhen = inquiry.created_at ? dayjs(inquiry.created_at).fromNow() : '';

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                {/* top meta */}
                <div className="flex items-center justify-between px-6 pt-4">
                    <TypePill inquiry={inquiry} />
                    <StatusBadge status={inquiry.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-5 gap-y-6 p-6">
                    {/* image */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="relative rounded-lg overflow-hidden h-44 shadow-sm">
                            <img
                                src={property.image_url ? `/storage/${property.image_url}` : '/placeholder.png'}
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                alt={property.title ?? 'Property Image'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                {price}
                            </div>
                        </div>
                    </div>

                    {/* property & message */}
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                {property.title ?? 'Unknown Property'}
                            </h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                                {dayjs(inquiry.created_at).format('MMM D, YYYY')}
              </span>
                        </div>

                        <p className="text-gray-700 text-sm">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-primary" />
                            {property.address ?? 'No address provided'}
                        </p>

                        <p className="text-xs text-gray-500">
                            <FontAwesomeIcon icon={faHouseChimney} className="mr-1 text-secondary" />
                            {property.property_type ?? 'Type'} {property.sub_type ? `– ${property.sub_type}` : ''}
                        </p>

                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                            <p className="text-sm text-gray-800">
                                <strong className="text-primary">Message: </strong>
                                {inquiry?.notes || 'No message provided.'}
                            </p>
                        </div>

                        <p className="text-xs text-gray-500">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            Sent {sentWhen}
                        </p>
                    </div>

                    {/* contact & actions */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                        {/* who */}
                        <div className="flex items-center mb-4">
                            <div className="mr-3">
                                <Avatar
                                    name={(seller && seller.name) || (buyer && buyer.name)}
                                    photo_url={(seller && seller.photo_url) || (buyer && buyer.photo_url)}
                                    altSuffix="avatar"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {seller ? seller.name : buyer ? buyer.name : '—'}
                                </p>
                                <p className="text-xs text-gray-500">{seller ? 'Seller' : buyer ? 'Buyer' : 'Profile'}</p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 mb-4 space-y-1">
                            <p>
                                <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-secondary" />
                                {(seller && seller.email) || (buyer && buyer.email) || 'N/A'}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faPhone} className="mr-1 text-secondary" />
                                {(seller && seller.phone) || (buyer && buyer.phone) || 'N/A'}
                            </p>
                        </div>

                        {/* actions */}
                        <div className="flex gap-2">
                            {/* Agent-initiated (seller_id present) */}
                            {inquiry.seller_id && (
                                inquiry.status?.toLowerCase() === 'accepted' ? (
                                    <Link
                                        href={`/agents/my-listings/${inquiry.property?.id}`}
                                        className="flex-1 bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-accent text-center transition"
                                        aria-label="View in My Listing"
                                    >
                                        View in My Listing
                                    </Link>
                                ) : (
                                    <button
                                        className="flex-1 border border-secondary py-2 rounded-md text-sm text-secondary bg-white cursor-not-allowed"
                                        disabled
                                        aria-label={`Inquiry status is ${inquiry.status}`}
                                    >
                                        {inquiry.status}
                                    </button>
                                )
                            )}

                            {/* Buyer inquiry */}
                            {!inquiry.seller_id && (
                                <>
                                    {inquiry.status?.toLowerCase() === 'pending' && (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenAcceptDialog(true);
                                                }}
                                                aria-label={`Accept inquiry ${inquiry.id}`}
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-2 border border-secondary hover:bg-secondary text-secondary hover:text-white rounded-md text-sm font-medium transition"
                                                onClick={() => {
                                                    setSelectedId(inquiry.id);
                                                    setIsOpenRejectDialog(true);
                                                }}
                                                aria-label={`Reject inquiry ${inquiry.id}`}
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {inquiry.status?.toLowerCase() === 'accepted' && (
                                        <Link
                                            href={`/agents/trippings/create?inquiry=${inquiry.id}`}
                                            className="flex-1 px-4 py-2 bg-primary hover:bg-accent text-white rounded-md font-medium transition text-center"
                                            aria-label={`Create tripping for inquiry ${inquiry.id}`}
                                        >
                                            Schedule Visit
                                        </Link>
                                    )}

                                    {['pending', 'accepted'].includes(inquiry.status?.toLowerCase()) ? null : (
                                        <button
                                            className="flex-1 border border-secondary py-2 rounded-md text-sm text-secondary bg-white cursor-not-allowed"
                                            disabled
                                            aria-label={`Inquiry status is ${inquiry.status}`}
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
            {/* dialogs */}
            <ConfirmDialog
                open={openCancelDialog}
                setOpen={setOpenCancelDialog}
                title="Cancel Inquiry"
                description="Are you sure you want to cancel this inquiry?"
                confirmText="Confirm"
                cancelText="Close"
                onConfirm={handleCancel}
                loading={loadingPatch}
            />
            <ConfirmDialog
                open={isOpenAcceptDialog}
                setOpen={setIsOpenAcceptDialog}
                title="Accept Buyer Inquiry"
                description="Are you sure you want to accept this inquiry?"
                confirmText="Accept"
                cancelText="Close"
                onConfirm={handleAccept}
                loading={loadingPatch}
            />
            <ConfirmDialog
                open={isOpenRejectDialog}
                setOpen={setIsOpenRejectDialog}
                title="Reject Buyer Inquiry"
                description="Are you sure you want to reject this inquiry?"
                confirmText="Reject"
                cancelText="Close"
                onConfirm={handleReject}
                loading={loadingPatch}
            />

            {/* header + controls (theme-aligned) */}
            <div className="px-4 py-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Inquiries</h1>
                        <p className="text-sm text-gray-600">Manage buyer requests and your own property inquiries.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={searchRaw}
                                onChange={(e) => setSearchRaw(e.target.value)}
                                placeholder="Search title, address, name…"
                                className="pl-9 pr-3 py-2 text-sm rounded-md bg-gray-100 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:outline-none w-[260px]"
                                aria-label="Search inquiries"
                            />
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <select
                                value={selectedItemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className=" py-2 text-sm rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-primary/30"
                                title="Items per page"
                            >
                                {[10, 20, 30, 50].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* tabs row (kept, but wrapper matches theme) */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                    <AgentInquiriesFilterTab
                        count={[inquiriesCount, sellerInquiryCount, buyerInquiryCount]}
                        selectedStatus={status}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        page={page}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>

                {/* list */}
                {!inquiries?.data?.length ? (
                    <div className="p-10 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
                        No inquiries yet.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {rows.map((inquiry) => (
                            <Card key={inquiry.id} inquiry={inquiry} />
                        ))}
                    </div>
                )}

                {/* pagination */}
                {Array.isArray(inquiries?.links) && inquiries.links.length > 1 && (
                    <div className="flex flex-wrap gap-2 justify-center items-center pt-6">
                        {inquiries.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={cn(
                                        'px-3 py-2 rounded-md text-sm border transition',
                                        link.active
                                            ? 'bg-primary text-white border-primary hover:bg-accent'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="px-3 py-2 text-sm text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
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
