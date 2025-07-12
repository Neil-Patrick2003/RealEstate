import AgentLayout from '@/Layouts/AgentLayout';
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import AgentInquiriesFilterTab from '@/Components/tabs/AgentInquiriesFilterTab.jsx';
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    faCalendarCheck, faCheck,
    faClock,
    faEnvelope,
    faHouseChimney,
    faLocationDot, faPaperPlane,
    faPesoSign,
    faPhone, faTrashAlt, faXmark
} from "@fortawesome/free-solid-svg-icons";

const Inquiries = ({
                       inquiries,
                       inquiriesCount,
                       rejectedCount,
                       acceptedCount,
                       pendingCount,
                       cancelledCount,
                       page = 1,
                       itemsPerPage = 10,
                       status = 'All',
                   }) => {
    const imageUrl = '/storage/';

    // UI state
    const [selectedStatus, setSelectedStatus] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);

    // Inquiry action state
    const [selectedId, setSelectedId] = useState(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [isOpenAcceptDialog, setIsOpenAcceptDialog] = useState(false);
    const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);

    // =======================
    // HANDLERS
    // =======================

    // Accept Inquiry
    const handleAccept = () => {
        if (!selectedId) return;
        router.patch(`/agents/inquiries/${selectedId}/accept`, {
            onSuccess: () => {
                setSelectedId(null);
                setIsOpenAcceptDialog(false);
            },
        });
    };

    // Reject Inquiry
    const handleReject = () => {
        if (!selectedId) return;
        router.patch(`/agents/inquiries/${selectedId}/reject`, {
            onSuccess: () => {
                setSelectedId(null);
                setIsOpenRejectDialog(false);
            },
        });
    };

    // Cancel Inquiry
    const handleCancel = () => {
        if (!selectedId) return;
        router.patch(`/agents/inquiries/${selectedId}`, {
            onSuccess: () => {
                setSelectedId(null);
                setOpenCancelDialog(false);
            },
        });
    };

    // Open Confirm Dialogs
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

    // Items per page change
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = e.target.value;
        setSelectedItemsPerPage(newItemsPerPage);
        router.get('/agents/inquiries', {
            page: 1,
            items_per_page: newItemsPerPage,
            status: selectedStatus,
        }, { preserveState: true, replace: true });
    };

    // Inquiry status color styles
    const statusStyles = {
        accepted: 'bg-green-100 text-green-700 ring-green-200',
        rejected: 'bg-red-100 text-red-700 ring-red-200',
        pending: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
        cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
        default: 'bg-orange-100 text-orange-700 ring-orange-200'
    };

    // Get inquiry type label
    const getInquiryType = (inquiry) => {
        if (inquiry.buyer_id && inquiry.agent_id && !inquiry.seller_id) return 'Buyer Request';
        if (inquiry.agent_id && inquiry.property_id) return 'Agent Request';
        return 'Unknown Type';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-800";
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
                loading={false}
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
                loading={false}
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
                loading={false}
            />

            {/* Page Header */}
            <div className="flex flex-col px-4">
                <h1 className="text-xl font-bold text-gray-800 mb-4">All Inquiries</h1>

                {/* Filter Tabs */}
                <div className="rounded-t-xl shadow-sm overflow-x-auto">
                    <AgentInquiriesFilterTab
                        count={[inquiriesCount, pendingCount, acceptedCount, rejectedCount, cancelledCount]}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        page={page}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>

                {/* Inquiries Table */}
                {/*<div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">*/}
                {/*    <table className="min-w-full text-sm text-left text-gray-700">*/}
                {/*        <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">*/}
                {/*        <tr>*/}
                {/*            <th className="p-3 text-center"><input type="checkbox" className="rounded border-gray-400" /></th>*/}
                {/*            <th className="p-3">Image</th>*/}
                {/*            <th className="p-3">Seller</th>*/}
                {/*            <th className="p-3">Type</th>*/}
                {/*            <th className="p-3">Status</th>*/}
                {/*            <th className="p-3">Date Inquired</th>*/}
                {/*            <th className="p-3 text-right">Actions</th>*/}
                {/*        </tr>*/}
                {/*        </thead>*/}
                {/*        <tbody className="divide-y divide-dashed">*/}
                {/*        {inquiries?.data.length > 0 ? (*/}
                {/*            inquiries.data.map((inquiry) => {*/}
                {/*                const statusClass = statusStyles[inquiry.status] || statusStyles.default;*/}
                {/*                const isPending = inquiry.status.toLowerCase() === 'pending';*/}
                {/*                const isCancelled = inquiry.status.toLowerCase() === 'cancelled';*/}

                {/*                return (*/}
                {/*                    <tr key={inquiry.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">*/}
                {/*                        <td className="p-3 text-center hidden md:table-cell">*/}
                {/*                            <input type="checkbox" className="rounded border-gray-400" />*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 md:table-cell">*/}
                {/*                            <div className="flex items-center gap-3">*/}
                {/*                                <img*/}
                {/*                                    src={`${imageUrl}${inquiry.property.image_url}`}*/}
                {/*                                    onError={(e) => e.target.src = '/placeholder.png'}*/}
                {/*                                    alt={inquiry.property.title}*/}
                {/*                                    className="w-14 h-14 object-cover rounded-md"*/}
                {/*                                />*/}
                {/*                                <div className="flex flex-col">*/}
                {/*                                    <p className="font-semibold text-gray-800">{inquiry.property.title}</p>*/}
                {/*                                    <p className="text-xs text-gray-500">*/}
                {/*                                        {inquiry.property.property_type} | {inquiry.property.sub_type}*/}
                {/*                                    </p>*/}
                {/*                                </div>*/}
                {/*                            </div>*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 whitespace-nowrap md:table-cell">*/}
                {/*                            <p className="flex flex-col cursor-pointer hover:underline text-primary">*/}
                {/*                                {inquiry?.seller?.name ?? inquiry?.agent?.name ?? 'Unknown User'}*/}
                {/*                                <span>{inquiry?.seller?.role ?? inquiry?.agent?.role ?? 'Unknown'}</span>*/}
                {/*                            </p>*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 whitespace-nowrap md:table-cell">*/}
                {/*                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">*/}
                    {/*                                    {getInquiryType(inquiry)}*/}
                {/*                                </span>*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 md:table-cell">*/}
                {/*                                <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>*/}
                {/*                                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}*/}
                {/*                                </span>*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 whitespace-nowrap md:table-cell">*/}
                {/*                            {dayjs(inquiry.created_at).format('MMMM D, YYYY')}*/}
                {/*                        </td>*/}
                {/*                        <td className="p-3 text-right md:table-cell align-middle">*/}
                {/*                            /!* Buyer Actions: Accept / Reject *!/*/}
                {/*                            {inquiry?.buyer_id && (*/}
                {/*                                <div className="space-x-2">*/}
                {/*                                    <button*/}
                {/*                                        className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-md transition"*/}
                {/*                                        onClick={() => handleOpenAcceptDialog(inquiry.id)}*/}
                {/*                                    >*/}
                {/*                                        Accept*/}
                {/*                                    </button>*/}
                {/*                                    <button*/}
                {/*                                        className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-md transition"*/}
                {/*                                        onClick={() => handleOpenRejectDialog(inquiry.id)}*/}
                {/*                                    >*/}
                {/*                                        Reject*/}
                {/*                                    </button>*/}
                {/*                                </div>*/}
                {/*                            )}*/}

                {/*                            /!* Seller Cancel Button *!/*/}
                {/*                            {inquiry?.seller_id && (*/}
                {/*                                <div className="mt-2">*/}
                {/*                                    {isPending ? (*/}
                {/*                                        <button*/}
                {/*                                            onClick={() => handleOpenCancelDialog(inquiry.id)}*/}
                {/*                                            className="bg-yellow-600 hover:bg-yellow-500 text-white text-sm px-4 py-2 rounded-md transition"*/}
                {/*                                            disabled={isCancelled}*/}
                {/*                                        >*/}
                {/*                                            Cancel*/}
                {/*                                        </button>*/}
                {/*                                    ) : (*/}
                {/*                                        <div className="text-sm text-gray-400 italic text-center">*/}
                {/*                                            {inquiry.status}*/}
                {/*                                        </div>*/}
                {/*                                    )}*/}
                {/*                                </div>*/}
                {/*                            )}*/}
                {/*                        </td>*/}
                {/*                    </tr>*/}
                {/*                );*/}
                {/*            })*/}
                {/*        ) : (*/}
                {/*            <tr>*/}
                {/*                <td colSpan="7" className="text-center py-6 text-gray-400">*/}
                {/*                    No inquiries found.*/}
                {/*                </td>*/}
                {/*            </tr>*/}
                {/*        )}*/}
                {/*        </tbody>*/}
                {/*    </table>*/}
                {/*</div>*/}

                {/*/!* Pagination and Items Per Page *!/*/}
                {/*<div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">*/}
                {/*    <div className="flex items-center gap-2">*/}
                {/*        <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">Items per page:</label>*/}
                {/*        <select*/}
                {/*            id="selectedItemsPerPage"*/}
                {/*            value={selectedItemsPerPage}*/}
                {/*            onChange={handleItemsPerPageChange}*/}
                {/*            className="border-gray-300 rounded-md text-sm"*/}
                {/*        >*/}
                {/*            {[5, 10, 15, 20].map(val => (*/}
                {/*                <option key={val} value={val}>{val}</option>*/}
                {/*            ))}*/}
                {/*        </select>*/}
                {/*    </div>*/}

                {/*    <div className="flex flex-wrap gap-2 justify-end">*/}
                {/*        {inquiries?.links.map((link, index) =>*/}
                {/*            link.url ? (*/}
                {/*                <Link*/}
                {/*                    key={index}*/}
                {/*                    href={link.url}*/}
                {/*                    className={`px-4 py-2 text-sm rounded-md border transition ${*/}
                {/*                        link.active*/}
                {/*                            ? 'bg-gray-500 text-white font-semibold'*/}
                {/*                            : 'bg-white text-gray-600 hover:bg-gray-100'*/}
                {/*                    }`}*/}
                {/*                    dangerouslySetInnerHTML={{ __html: link.label }}*/}
                {/*                />*/}
                {/*            ) : (*/}
                {/*                <span*/}
                {/*                    key={index}*/}
                {/*                    className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"*/}
                {/*                    dangerouslySetInnerHTML={{ __html: link.label }}*/}
                {/*                />*/}
                {/*            )*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*</div>*/}
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
                                <div><span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                                        {getInquiryType(inquiry)}
                                                                   </span></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">

                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={`/storage/${property.image_url}`}
                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                alt={property.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {property.price?.toLocaleString() ?? "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-primary leading-tight">
                                                    {property.title ?? "Unknown Property"}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(inquiry.status)}`}
                                                >
                                                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                    {inquiry.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                {property.address ?? "No address provided"}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-3">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {property.property_type ?? "Type"} – {property.sub_type ?? "Sub-type"}
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    <strong>Your message: </strong>
                                                    {message || "No message provided."}
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                {/*Sent {dayjs(inquiry.created_at).fromNow()}*/}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                                <img
                                                    src="https://placehold.co/80x80"
                                                    alt={agent.name ?? "Agent"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {agent.name ?? "Unknown Agent"}
                                                </p>
                                                <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                                            <p><FontAwesomeIcon icon={faEnvelope} className="mr-1" /> {agent.email ?? "N/A"}</p>
                                            <p><FontAwesomeIcon icon={faPhone} className="mr-1" /> +63 912 345 6789</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {/*{inquiry.status === 'accepted' ? (*/}
                                            {/*    <button*/}
                                            {/*        type="button"*/}
                                            {/*        className="w-full px-4 py-2 border border-secondary hover:bg-primary-dark text-secondary rounded-md font-medium transition"*/}
                                            {/*        onClick={() => {*/}
                                            {/*            setSelectedVisitData({*/}
                                            {/*                property: inquiry.property,*/}
                                            {/*                agentId: agent.id,*/}
                                            {/*                inquiryId: inquiry.id,*/}
                                            {/*            });*/}
                                            {/*            setIsAddVisitModal(true);*/}
                                            {/*        }}*/}
                                            {/*    >*/}
                                            {/*        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />*/}
                                            {/*        Schedule Visit*/}
                                            {/*    </button>*/}
                                            {/*) : (*/}
                                            {/*    <div*/}

                                            {/*        className="w-full flex-center justify-center px-4 py-2 border border-secondary hover:bg-primary-dark text-secondary rounded-md font-medium transition"*/}
                                            {/*    >*/}
                                            {/*        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />*/}
                                            {/*        Scheduled!*/}
                                            {/*    </div>*/}
                                            {/*)}*/}

                                            <div className="flex gap-x-2">
                                                {/*if pending accpet / delete*/}
                                                {inquiry.status === 'Pending' && (
                                                    <pan>
                                                        <button
                                                                type="button"
                                                                className="w-full px-4 py-2 bg-primary hover:bg-accent text-white rounded-md text-sm font-medium transition"
                                                                onClick={() => handleOpenAcceptDialog(inquiry.id)}
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className='mr-2' />
                                                                Accept
                                                        </button>
                                                        <button
                                                                type="button"
                                                                className="w-full px-4 py-2 border border-secondary hover:bg-secondary text-secondary hover:text-white rounded-md text-sm font-medium transition"
                                                                onClick={() => {
                                                                    setCancelId(inquiry.id);
                                                                    setIsCancelModalOpen(true);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                                                Reject
                                                        </button>

                                                    </pan>
                                                )}

                                                {/*if accepted only view*/}
                                                {inquiry.status === 'Accepted' ? (
                                                    <span
                                                        className="w-full px-4 py-2 flex justify-center items-center    bg-primary hover:bg-accent text-white rounded-md font-medium transition"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className='mr-2' />
                                                        View
                                                    </span>
                                                ) : (
                                                    <button className='w-full border border-secondary py-2  rounded-md flex justify-center items-center cursor-not-allowed disabled '>{inquiry.status}</button>
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
