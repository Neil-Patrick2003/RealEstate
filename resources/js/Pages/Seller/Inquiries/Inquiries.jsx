// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// import React, { useState } from "react";
// import dayjs from "dayjs";
// import { Link, router, useForm } from "@inertiajs/react";
// import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
// import SellerInquiriesFilterTab from "@/Components/tabs/SellerInquiriesFilter.jsx";
// import {Popover} from "react-tiny-popover";
// import * as PropTypes from "prop-types";
//
// function RxCaretSort(props) {
//     return null;
// }
//
// RxCaretSort.propTypes = {className: PropTypes.string};
// export default function Inquiries({
//                                       inquiries,
//                                       inquiriesCount,
//                                       rejectedCount,
//                                       acceptedCount,
//                                       pendingCount,
//                                       cancelledCount,
//                                       page = 1,
//                                       itemsPerPage = 10,
//                                       status = 'All',
//                                   }) {
//     const imageUrl = '/storage/';
//     const [selectedStatus, setSelectedStatus] = useState(status);
//     const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
//     const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
//     const [openRejectDialog, setRejectDialog] = useState(false);
//     const [selectedId, setSelectedId] = useState(null);
//
//     const { data, setData } = useForm({
//         status: '',
//     });
//
//     const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//
//
//     const handleItemsPerPageChange = (e) => {
//         const newItemsPerPage = e.target.value;
//         setSelectedItemsPerPage(newItemsPerPage);
//         router.get('/inquiries', {
//             page: 1,
//             items_per_page: newItemsPerPage,
//             status: selectedStatus,
//         }, { preserveState: true, replace: true });
//     };
//
//     const handleOpenAcceptDialog = (id) => {
//         setSelectedId(id);
//         setOpenAcceptDialog(true);
//     };
//
//     const handleOpenRejectDialog = (id) => {
//         setSelectedId(id);
//         setRejectDialog(true);
//     };
//
//     const handleStatusUpdate = (statusType) => {
//         if (!selectedId) return;
//
//         router.patch(`/sellers/inquiries/${selectedId}/${statusType}`, {}, {
//             onSuccess: () => {
//                 setSelectedId(null);
//                 setOpenAcceptDialog(false);
//                 setRejectDialog(false);
//             },
//         });
//     };
//
//     const popoverContent = (
//         <div className="relative">
//             {/* Arrow */}
//             <div className="absolute top-6  -left-1.5 w-3 h-3 rotate-45 bg-white z-10" />
//
//             {/* Popover box */}
//             <div className="bg-white border-gray-200 shadow-lg rounded-md p-2 w-40 z-20">
//                 <ul className="space-y-1 text-sm">
//                     <li><button className="w-full text-left hover:text-primary">View Profile</button></li>
//                     <li><
//                         button className="w-full text-left hover:text-primary"
//                                 onClick={() => {
//                                 router.visit(route('seller.messages', { selectedUserId: selectedId }));
//                         }}>
//                         Sent a Message
//                     </button></li>
//                 </ul>
//             </div>
//         </div>
//     );
//
//
//     return (
//         <AuthenticatedLayout>
//             {/* Accept Dialog */}
//             <ConfirmDialog
//                 open={openAcceptDialog}
//                 setOpen={setOpenAcceptDialog}
//                 title="Accept Inquiry"
//                 description="Are you sure you want to accept this inquiry? This allows the agent to handle your property posting."
//                 confirmText="Confirm"
//                 cancelText="Cancel"
//                 onConfirm={() => handleStatusUpdate('accept')}
//                 loading={false}
//             />
//
//             {/* Reject Dialog */}
//             <ConfirmDialog
//                 open={openRejectDialog}
//                 setOpen={setRejectDialog}
//                 title="Reject Inquiry"
//                 description="Are you sure you want to reject this inquiry? This action cannot be undone."
//                 confirmText="Confirm"
//                 cancelText="Cancel"
//                 onConfirm={() => handleStatusUpdate('reject')}
//                 loading={false}
//             />
//
//
//
//
//
//             <div className="flex flex-col max-w-7xl mx-auto">
//                 <h1 className="text-2xl font-semibold text-gray-800">Seller Inquiries</h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                     View and manage inquiries sent by agents for your listed properties. You can choose to accept or reject each request based on your preferences.
//                 </p>
//                 <div className="bg-white mt-6 rounded-t-xl">
//                     <SellerInquiriesFilterTab
//                         count={[inquiriesCount, pendingCount, acceptedCount, rejectedCount, cancelledCount]}
//                         selectedStatus={selectedStatus}
//                         setSelectedStatus={setSelectedStatus}
//                         page={page}
//                         selectedItemsPerPage={selectedItemsPerPage}
//                     />
//                 </div>
//
//                 <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
//                     <table className="min-w-full text-sm text-left text-gray-700">
//                         <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
//                         <tr>
//                             <th className="p-3 text-center">
//                                 <input type="checkbox" id="deleteAll" className="rounded border-gray-400" />
//                             </th>
//                             <th className="p-3">Image</th>
//                             <th className="p-3">Agent</th>
//                             <th className="p-3">Status</th>
//                             <th className="p-3">Date Inquire</th>
//                             <th className="p-3 text-right">Actions</th>
//                         </tr>
//                         </thead>
//                         <tbody className="divide-y divide-dashed">
//                         {inquiries.data.length > 0 ? (
//                             inquiries.data.map((inquiry) => (
//                                 <tr key={inquiry.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
//                                     <td className="p-3 text-center hidden md:table-cell">
//                                         <input id={inquiry.id} type="checkbox" className="rounded border-gray-400" />
//                                     </td>
//                                     <td className="p-3 md:table-cell">
//                                         <div className="flex items-center gap-3">
//                                             <img
//                                                 src={`${imageUrl}${inquiry.property.image_url}`}
//                                                 alt={inquiry.id}
//                                                 className="w-14 h-14 object-cover rounded-md"
//                                             />
//                                             <div className="flex flex-col">
//                                                 <p className="font-semibold text-gray-800">{inquiry.property.title}</p>
//                                                 <p className="text-xs text-gray-500">
//                                                     {inquiry.property.property_type} | {inquiry.property.sub_type}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="p-3 whitespace-nowrap md:table-cell">
//                                         <p className="hover:cursor-pointer hover:underline hover:text-primary">
//                                             <Popover
//                                                 isOpen={isPopoverOpen}
//                                                 positions={["right"]} // try bottom or top
//                                                 padding={8}
//                                                 onClickOutside={() => setIsPopoverOpen(false)}
//                                                 content={popoverContent}
//                                             >
//                                                 <button
//                                                     onClick={() => {
//                                                         setSelectedId(inquiry.agent.id);
//                                                         setIsPopoverOpen(!isPopoverOpen);
//                                                     }}
//
//                                                     className="flex items-center gap-1  px-3 py-1 rounded text-sm "
//                                                 >
//                                                     {inquiry.agent.name}
//                                                 </button>
//                                             </Popover>
//
//                                         </p>
//                                     </td>
//                                     <td className="p-3 md:table-cell">
//                                         <span
//                                             className={`inline-block px-3 py-1 rounded-full text-xs ring-1
//                                                 ${
//                                                     inquiry.status === 'accepted'
//                                                 ? 'bg-green-100 text-green-700 ring-green-200'
//                                                 : inquiry.status === 'rejected'
//                                                     ? 'bg-red-100 text-red-700 ring-red-200'
//                                                     : inquiry.status === 'pending'
//                                                     ? 'bg-yellow-100 text-yellow-700 ring-yellow-200'
//                                                     : inquiry.status === 'cancelled'
//                                                     ? 'bg-gray-100 text-gray-700 ring-gray-200'
//                                                     : 'bg-orange-100 text-orange-700 ring-orange-200'
//                                                     }`}
//                                                 >
//                                               {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
//                                         </span>
//
//                                     </td>
//                                     <td className="p-3 whitespace-nowrap md:table-cell">
//                                         {dayjs(inquiry.created_at).format('MMMM D, YYYY')}
//                                     </td>
//                                     <td className="p-3 text-right md:table-cell">
//                                         {inquiry.status?.toLowerCase() === 'pending' ? (
//                                             <div className="flex justify-center gap-2">
//                                                 <button
//                                                     type="button"
//                                                     title="Accept Inquiry"
//                                                     className="bg-primary hover:bg-primary-dark border border-primary px-4 py-1.5 text-xs text-white rounded-l-md transition"
//                                                     onClick={() => handleOpenAcceptDialog(inquiry.id)}
//                                                 >
//                                                     Accept
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     title="Reject Inquiry"
//                                                     className="bg-secondary hover:bg-secondary-dark border border-secondary px-4 py-1.5 text-xs text-white rounded-r-md transition"
//                                                     onClick={() => handleOpenRejectDialog(inquiry.id)}
//                                                 >
//                                                     Reject
//                                                 </button>
//                                             </div>
//                                         ) : (
//                                             <div
//                                                 className="flex justify-center text-gray-400 text-sm italic"
//                                                 title="Actions already taken"
//                                             >
//                                                 {inquiry.status}
//                                             </div>
//                                         )}
//
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="7" className="text-center py-6 text-gray-400">
//                                     No inquiries found.
//                                 </td>
//                             </tr>
//                         )}
//                         </tbody>
//                     </table>
//                 </div>
//
//                 {/* Pagination & Items Per Page */}
//                 <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
//                     <div className="flex items-center gap-2">
//                         <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">
//                             Items per page:
//                         </label>
//                         <select
//                             id="selectedItemsPerPage"
//                             value={selectedItemsPerPage}
//                             onChange={handleItemsPerPageChange}
//                             className="border-gray-300 rounded-md text-sm"
//                         >
//                             {[5, 10, 15, 20].map((val) => (
//                                 <option key={val} value={val}>
//                                     {val}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <div className="flex flex-wrap gap-2 justify-end">
//                         {inquiries.links.map((link, i) =>
//                             link.url ? (
//                                 <Link
//                                     key={i}
//                                     href={link.url}
//                                     className={`px-4 py-2 text-sm rounded-md border transition ${
//                                         link.active
//                                             ? "bg-gray-500 text-white font-semibold"
//                                             : "bg-white text-gray-600 hover:bg-gray-100"
//                                     }`}
//                                     dangerouslySetInnerHTML={{ __html: link.label }}
//                                 />
//                             ) : (
//                                 <span
//                                     key={i}
//                                     className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
//                                     dangerouslySetInnerHTML={{ __html: link.label }}
//                                 />
//                             )
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }


import AuthenticatedLayout from "@/Layouts/AgentLayout.jsx";
import React, {useState} from "react";
import dayjs from "dayjs";
import {router} from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

export default function Inquiries({ properties, itemsPerPage = 0 }) {
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
    const [openRejectDialog, setRejectDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleOpenAcceptDialog = (id) => {
        setSelectedId(id);
        setOpenAcceptDialog(true);
    };

    const handleOpenRejectDialog = (id) => {
        setSelectedId(id);
        setRejectDialog(true);
    };

    const handleStatusUpdate = (statusType) => {
        if (!selectedId) return;

        router.patch(`/sellers/inquiries/${selectedId}/${statusType}`, {}, {
            onSuccess: () => {
                setSelectedId(null);
                setOpenAcceptDialog(false);
                setRejectDialog(false);
            },
        });
    };

    const popoverContent = (
        <div className="relative">
            {/* Arrow */}
            <div className="absolute top-6  -left-1.5 w-3 h-3 rotate-45 bg-white z-10" />

            {/* Popover box */}
            <div className="bg-white border-gray-200 shadow-lg rounded-md p-2 w-40 z-20">
                <ul className="space-y-1 text-sm">
                    <li><button className="w-full text-left hover:text-primary">View Profile</button></li>
                    <li><
                        button className="w-full text-left hover:text-primary"
                                onClick={() => {
                                router.visit(route('seller.messages', { selectedUserId: selectedId }));
                        }}>
                        Sent a Message
                    </button></li>
                </ul>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <ConfirmDialog
                open={openAcceptDialog}
                setOpen={setOpenAcceptDialog}
                title="Accept Inquiry"
                description="Are you sure you want to accept this inquiry? This allows the agent to handle your property posting."
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => handleStatusUpdate('accept')}
                loading={false}
            />

            {/* Reject Dialog */}
            <ConfirmDialog
                open={openRejectDialog}
                setOpen={setRejectDialog}
                title="Reject Inquiry"
                description="Are you sure you want to reject this inquiry? This action cannot be undone."
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => handleStatusUpdate('reject')}
                loading={false}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <h1 className="text-2xl font-bold text-gray-800">Property Inquiries</h1>

                {properties.data.length === 0 ? (
                    <div className="text-gray-500 text-center py-12">
                        No properties with inquiries yet.
                    </div>
                ) : (
                    properties.data.map((property) => (
                        <div
                            key={property.id}
                            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                        >
                            {/* Property Header */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 border-b">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">{property.title}</h2>
                                        <p className="text-sm text-gray-500">
                                            {property.property_type} - {property.sub_type}
                                        </p>
                                        <p className="text-sm text-gray-600">{property.address}</p>
                                        <p className="text-sm text-green-600 font-medium">
                                            ₱{Number(property.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 mt-4 md:mt-0">
                                    {property.inquiries.length} Inquiry{property.inquiries.length !== 1 && "ies"}
                                </div>
                            </div>

                            {/* Inquiries */}
                            <div className="divide-y">
                                {property.inquiries.map((inquiry) => (
                                    <div
                                        key={inquiry.id}
                                        className="p-4 flex flex-col sm:flex-row justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-gray-800 font-medium">{inquiry.agent.name}</p>
                                            <p className="text-sm text-gray-600">{inquiry.agent.email}</p>
                                            {inquiry.status?.toLowerCase() === 'pending' ? (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    title="Accept Inquiry"
                                                    className="bg-primary hover:bg-primary-dark border border-primary px-4 py-1.5 text-xs text-white rounded-l-md transition"
                                                    onClick={() => handleOpenAcceptDialog(inquiry.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Reject Inquiry"
                                                    className="bg-secondary hover:bg-secondary-dark border border-secondary px-4 py-1.5 text-xs text-white rounded-r-md transition"
                                                    onClick={() => handleOpenRejectDialog(inquiry.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex justify-center text-gray-400 text-sm italic"
                                                title="Actions already taken"
                                            >
                                                {inquiry.status}
                                            </div>
                                        )}

                                        </div>
                                        <div className="text-sm text-gray-500 whitespace-nowrap">
                                            {dayjs(inquiry.created_at).format("MMM D, YYYY h:mm A")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}

