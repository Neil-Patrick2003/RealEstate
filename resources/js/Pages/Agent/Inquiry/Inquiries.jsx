import AgentLayout from '@/Layouts/AgentLayout';
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AgentInquiriesFilterTab from '@/Components/tabs/AgentInquiriesFilterTab.jsx';
import ConfirmDialog from '@/Components/modal/ConfirmDialog.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck,
    faCheck,
    faClock,
    faEnvelope,
    faHouseChimney,
    faLocationDot,
    faPesoSign,
    faPhone,
    faTrashAlt,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';

dayjs.extend(relativeTime);

const Inquiries = ({
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
                       sellerInquiryCount
                   }) => {


    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);

    const [selectedId, setSelectedId] = useState(null);

    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [isOpenAcceptDialog, setIsOpenAcceptDialog] = useState(false);
    const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);

    // Loading states for patch requests (optional)
    const [loading, setLoading] = useState(false);

    const [selectedType, setSelectedType] = useState('my');

    // Normalize status string for comparisons
    const normalizedStatus = selectedStatus.toLowerCase();

    // Handlers for Accept/Reject/Cancel actions
    const handleAccept = () => {
        if (!selectedId) return;
        setLoading(true);
        router.patch(
            `/agents/inquiries/${selectedId}/accept`,
            {},
            {
                onSuccess: () => {
                    setSelectedId(null);
                    setIsOpenAcceptDialog(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleReject = () => {
        if (!selectedId) return;
        setLoading(true);
        router.patch(
            `/agents/inquiries/${selectedId}/reject`,
            {},
            {
                onSuccess: () => {
                    setSelectedId(null);
                    setIsOpenRejectDialog(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleCancel = () => {
        if (!selectedId) return;
        setLoading(true);
        router.patch(
            `/agents/inquiries/${selectedId}`,
            {},
            {
                onSuccess: () => {
                    setSelectedId(null);
                    setOpenCancelDialog(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    // Open confirm dialogs with inquiry id
    const handleOpenAcceptDialog = (id) => {
        setSelectedId(id);
        setIsOpenAcceptDialog(true);
    };

    const handleOpenRejectDialog = (id) => {
        setSelectedId(id);
        setIsOpenRejectDialog(true);
    };

    const handleOpenCancelDialog = (id) => {
        setSelectedId(id);
        setOpenCancelDialog(true);
    };

    // Handle change in items per page (reload with new params)
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = e.target.value;
        setSelectedItemsPerPage(newItemsPerPage);
        router.get(
            '/agents/inquiries',
            {
                page: 1,
                items_per_page: newItemsPerPage,
                status: selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    // Helper to get inquiry type label
    const getInquiryType = (inquiry) => {
        if (inquiry.buyer_id  && !inquiry.seller_id) return 'Buyer Request';
        if (inquiry.agent_id && inquiry.property_id) return 'My Request';
        return 'Unknown Type';
    };



    // Helper for status badge classes
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-orange-100 text-orange-700';
        }
    };



    return (
        <AgentLayout>
            {/* Cancel Dialog */}
            <ConfirmDialog
                open={openCancelDialog}
                setOpen={setOpenCancelDialog}
                title="Cancel Inquiry"
                description="Are you sure you want to cancel this inquiry?"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={handleCancel}
                loading={loading}
            />

            {/* Accept Dialog */}
            <ConfirmDialog
                open={isOpenAcceptDialog}
                setOpen={setIsOpenAcceptDialog}
                title="Accept Buyer Inquiry"
                description="Are you sure you want to accept this inquiry?"
                confirmText="Accept"
                cancelText="Cancel"
                onConfirm={handleAccept}
                loading={loading}
            />

            {/* Reject Dialog */}
            <ConfirmDialog
                open={isOpenRejectDialog}
                setOpen={setIsOpenRejectDialog}
                title="Reject Buyer Inquiry"
                description="Are you sure you want to reject this inquiry?"
                confirmText="Reject"
                cancelText="Cancel"
                onConfirm={handleReject}
                loading={loading}
            />

            {/* Page Header */}
            <div className="flex flex-col px-4">
                <h1 className="text-xl font-bold text-gray-800 mb-4">All Inquiries</h1>

                {/* Filter Tabs */}
                <div className="rounded-t-xl shadow-sm overflow-x-auto">
                    <AgentInquiriesFilterTab
                        count={[inquiriesCount, sellerInquiryCount, buyerInquiryCount,]}
                        selectedStatus={selectedStatus}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        page={page}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>

                {inquiries.data.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No inquiries yet.</p>
                ) : (
                    inquiries.data.map((inquiry) => {
                        const property = inquiry.property ?? {};
                        const agent = inquiry.agent ?? {};
                        const message = inquiry.messages?.message;

                        return (
                            <div
                                key={inquiry.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-all"
                            >
                                <div>
                                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                    {getInquiryType(inquiry)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={`/storage/${property.image_url}`}
                                                onError={(e) => (e.target.src = '/placeholder.png')}
                                                alt={property.title ?? 'Property Image'}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {property.price?.toLocaleString() ?? 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-primary leading-tight">
                                                    {property.title ?? 'Unknown Property'}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                        inquiry.status
                                                    )}`}
                                                >
                                                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                                            {inquiry.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                {property.address ?? 'No address provided'}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {property.property_type ?? 'Type'} – {property.sub_type ?? 'Sub-type'}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    <strong>Your message: </strong>
                                                    {message || 'No message provided.'}
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                Sent {dayjs(inquiry.created_at).fromNow()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                                <img
                                                    src="https://placehold.co/80x80"
                                                    alt={agent.name ?? 'Agent'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{agent.name ?? 'Unknown Agent'}</p>
                                                <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                                            <p>
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> {agent.email ?? 'N/A'}
                                            </p>
                                            <p>
                                                <FontAwesomeIcon icon={faPhone} className="mr-1" /> +63 912 345 6789
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-x-2">
                                                {/* If it's the agent's own inquiry ("My Inquiry"), just show the status */}
                                                {inquiry.seller_id && (
                                                    <>
                                                        {inquiry.status === 'Accepted' ? (
                                                            <Link href={`/agents/my-listings/${inquiry.property.id}`}
                                                                className="flex-1 border bg-secondary py-2 rounded-md flex justify-center items-center text-white "

                                                                aria-label={`Inquiry status is ${inquiry.status}`}
                                                            >
                                                                View in My Listing
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                className="flex-1 border border-secondary py-2 rounded-md flex justify-center items-center cursor-not-allowed text-secondary bg-gray-50"
                                                                disabled
                                                                aria-label={`Inquiry status is ${inquiry.status}`}
                                                            >
                                                                {inquiry.status}
                                                            </button>
                                                        ) }
                                                    </>

                                                )}

                                                {/* If it's a buyer inquiry */}
                                                {!inquiry.seller_id && (
                                                    <>
                                                        {/* If pending, show Accept and Reject */}
                                                        {inquiry.status.toLowerCase() === 'pending' && (
                                                            <span className="flex gap-2 w-full">
                                                                <button
                                                                    type="button"
                                                                    className="flex-1 px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                                    onClick={() => handleOpenAcceptDialog(inquiry.id)}
                                                                    aria-label={`Accept inquiry ${inquiry.id}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="flex-1 px-4 py-2 border border-secondary hover:bg-secondary text-secondary hover:text-white rounded-md text-sm font-medium transition"
                                                                    onClick={() => handleOpenRejectDialog(inquiry.id)}
                                                                    aria-label={`Reject inquiry ${inquiry.id}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                                                    Reject
                                                                </button>
                                                            </span>
                                                        )}

                                                        {/* If accepted, show View */}
                                                        {inquiry.status.toLowerCase() === 'accepted' && (
                                                            <button
                                                                type="button"
                                                                className="flex-1 px-4 py-2 bg-primary hover:bg-accent text-white rounded-md font-medium transition"
                                                                aria-label={`View accepted inquiry ${inquiry.id}`}
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                                View
                                                            </button>
                                                        )}

                                                        {/* Other statuses - disabled button */}
                                                        {inquiry.status.toLowerCase() !== 'pending' &&
                                                            inquiry.status.toLowerCase() !== 'accepted' && (
                                                                <button
                                                                    className="flex-1 border border-secondary py-2 rounded-md flex justify-center items-center cursor-not-allowed text-secondary bg-gray-50"
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
                            </div>
                        );
                    })
                )}
            </div>
        </AgentLayout>
    );
};

export default Inquiries;
