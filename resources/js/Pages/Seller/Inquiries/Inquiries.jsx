    //
    // import React, {useEffect, useState} from "react";
    // import dayjs from "dayjs";
    // import {router} from "@inertiajs/react";
    // import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
    // import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
    // import { Link } from '@inertiajs/react';
    // import {debounce} from "lodash";
    // import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
    //
    // export default function Inquiries({
    //                                       properties,
    //                                       itemsPerPage = 10,
    //                                       search = '',
    //                                       allCount,
    //                                       acceptedCount,
    //                                       rejectedCount,
    //                                       pendingCount,
    //                                       filters = {},
    //                                   }) {
    //
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
    //                                     router.visit(route('seller.messages', { selectedUserId: selectedId }));
    //                         }}>
    //                         Sent a Message
    //                     </button></li>
    //                 </ul>
    //             </div>
    //         </div>
    //     );
    //     const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    //     const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    //     const [selectedType, setSelectedType] = useState(filters.property_type || '');
    //     const [searchTerm, setSearchTerm] = useState(search || '');
    //
    //     const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
    //     const [openRejectDialog, setRejectDialog] = useState(false);
    //     const [selectedId, setSelectedId] = useState(null);
    //     const [currentPage, setCurrentPage] = useState(properties.current_page || 1);
    //
    //     // ⏳ Debounced search
    //     useEffect(() => {
    //         const delayedSearch = debounce(() => {
    //             setCurrentPage(1); // Reset page when filters/search change
    //             fetchFilteredResults(1);
    //         }, 500);
    //
    //         delayedSearch();
    //         return () => delayedSearch.cancel();
    //     }, [searchTerm, selectedItemsPerPage, selectedStatus, selectedType]);
    //
    //     const fetchFilteredResults = (page = currentPage) => {
    //         router.get('/seller/inquiries', {
    //             search: searchTerm,
    //             items_per_page: selectedItemsPerPage,
    //             status: selectedStatus,
    //             property_type: selectedType,
    //             page: page,
    //         }, {
    //             preserveState: true,
    //             replace: true,
    //         });
    //     };
    //
    //
    //     const handleSearchTermChange = (value) => setSearchTerm(value);
    //     const handleStatusChange = (e) => setSelectedStatus(e.target.value);
    //     const handleTypeChange = (e) => setSelectedType(e.target.value);
    //     const handleItemsPerPageChange = (e) => setSelectedItemsPerPage(parseInt(e.target.value));
    //
    //     return (
    //         <AuthenticatedLayout>
    //
    //             <div>
    //                 <ConfirmDialog
    //                     open={openAcceptDialog}
    //                     setOpen={setOpenAcceptDialog}
    //                     title="Accept Inquiry"
    //                     description="Are you sure you want to accept this inquiry? This allows the agent to handle your property posting."
    //                     confirmText="Confirm"
    //                     cancelText="Cancel"
    //                     onConfirm={() => handleStatusUpdate('accept')}
    //                     loading={false}
    //                 />
    //
    //                 {/* Reject Dialog */}
    //                 <ConfirmDialog
    //                     open={openRejectDialog}
    //                     setOpen={setRejectDialog}
    //                     title="Reject Inquiry"
    //                     description="Are you sure you want to reject this inquiry? This action cannot be undone."
    //                     confirmText="Confirm"
    //                     cancelText="Cancel"
    //                     onConfirm={() => handleStatusUpdate('reject')}
    //                     loading={false}
    //                 />
    //                 <header className="bg-white shadow-sm">
    //                     <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
    //                         <div>
    //                             <h1 className="text-2xl font-bold text-gray-900">Property Inquiries</h1>
    //                             <p className="text-sm text-gray-600">Manage inquiries grouped by property</p>
    //                         </div>
    //                         <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
    //                             <i className="fas fa-plus mr-2"></i> New Property
    //                         </button>
    //                     </div>
    //                 </header>
    //
    //                 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //                     <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
    //                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    //                             <div className="flex items-center justify-between">
    //                                 <div>
    //                                     <p className="text-sm font-medium text-gray-500">Total Properties</p>
    //                                     <h3 className="text-2xl font-bold text-gray-900">{allCount}</h3>
    //                                 </div>
    //                                 <div className="p-3 rounded-full bg-blue-100 text-blue-600">
    //                                     <i className="fas fa-home text-xl"></i>
    //                                 </div>
    //                             </div>
    //                         </div>
    //
    //                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    //                             <div className="flex items-center justify-between">
    //                                 <div>
    //                                     <p className="text-sm font-medium text-gray-500">Active Inquiries</p>
    //                                     <h3 className="text-2xl font-bold text-indigo-600">24</h3>
    //                                 </div>
    //                                 <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
    //                                     <i className="fas fa-envelope-open-text text-xl"></i>
    //                                 </div>
    //                             </div>
    //                         </div>
    //
    //                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    //                             <div className="flex items-center justify-between">
    //                                 <div>
    //                                     <p className="text-sm font-medium text-gray-500">Pending</p>
    //                                     <h3 className="text-2xl font-bold text-amber-500">{pendingCount}</h3>
    //                                 </div>
    //                                 <div className="p-3 rounded-full bg-amber-100 text-amber-600">
    //                                     <i className="fas fa-clock text-xl"></i>
    //                                 </div>
    //                             </div>
    //                         </div>
    //
    //                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    //                             <div className="flex items-center justify-between">
    //                                 <div>
    //                                     <p className="text-sm font-medium text-gray-500">Accepted</p>
    //                                     <h3 className="text-2xl font-bold text-emerald-500">{acceptedCount}</h3>
    //                                 </div>
    //                                 <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
    //                                     <i className="fas fa-check-circle text-xl"></i>
    //                                 </div>
    //                             </div>
    //                         </div>
    //
    //                         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    //                             <div className="flex items-center justify-between">
    //                                 <div>
    //                                     <p className="text-sm font-medium text-gray-500">Rejected</p>
    //                                     <h3 className="text-2xl font-bold text-rose-500">{rejectedCount}</h3>
    //                                 </div>
    //                                 <div className="p-3 rounded-full bg-rose-100 text-rose-600">
    //                                     <i className="fas fa-times-circle text-xl"></i>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //
    //                     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
    //                         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //                             <div className="flex-1">
    //                                 <div className="relative">
    //                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //                                         <i className="fas fa-search text-gray-400"></i>
    //                                     </div>
    //                                     <input
    //                                         type="search"
    //                                         name='search'
    //                                         placeholder="Search properties or inquiries..."
    //                                         className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    //                                         value={searchTerm}
    //                                         onChange={(e) => handleSearchTermChange(e.target.value)}
    //                                     />
    //                                 </div>
    //                             </div>
    //
    //                             <div className="flex items-center space-x-3">
    //                                 <select
    //                                     name='property_type'
    //                                     value={selectedType}
    //                                     onChange={handleTypeChange}
    //                                     className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
    //                                 >
    //                                     <option value="">All Property Types</option>
    //                                     <option value="Residential">Residential</option>
    //                                     <option value="Commercial">Commercial</option>
    //                                     <option value="Land">Land</option>
    //                                 </select>
    //
    //                                 <select
    //                                     name='status'
    //                                     value={selectedStatus}
    //                                     onChange={handleStatusChange}
    //                                     className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
    //                                 >
    //                                     <option value="">All Status</option>
    //                                     <option value="Pending">Pending</option>
    //                                     <option value="Accepted">Accepted</option>
    //                                     <option value="Rejected">Rejected</option>
    //                                 </select>
    //
    //                                 <select
    //                                     value={selectedItemsPerPage}
    //                                     name='item_per_page'
    //                                     onChange={handleItemsPerPageChange}
    //                                     className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
    //                                 >
    //                                     <option value="5">5 / page</option>
    //                                     <option value="10">10 / page</option>
    //                                     <option value="20">20 / page</option>
    //                                     <option value="50">50 / page</option>
    //                                 </select>
    //                             </div>
    //                         </div>
    //                     </div>
    //
    //                     <div className="space-y-6">
    //                         {properties.data.length === 0 ? (
    //                             <div>No inquiries Yet</div>
    //                         ) : (
    //                             <>
    //                                 {properties.data.map((property) => (
    //                                     <InquiriesCollapsable key={property.id}
    //                                           header={
    //                                               <div className="flex items-center justify-between w-full">
    //                                                   <div className="flex items-center space-x-4">
    //                                                       <img src={`/storage/${property.image_url}`} alt="Property" className="w-24 h-18 rounded object-cover" />
    //                                                       <div>
    //                                                           <h2 className="text-lg font-bold text-primary">{property.title}</h2>
    //                                                           <div className="flex gap-2 mt-1">
    //                                                               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{property.property_type}</span>
    //                                                               <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{property.sub_type}</span>
    //                                                               <span className="text-xs bg-lightaccent text-accent px-2 py-1 rounded">₱1{property.price}</span>
    //                                                           </div>
    //                                                           <div className="flex items-center text-sm text-gray-600 mt-1">
    //                                                               <i className="fas fa-map-marker-alt mr-1"></i>
    //                                                               <span>{property.address}</span>
    //                                                           </div>
    //                                                       </div>
    //                                                   </div>
    //
    //                                                   <div className="flex items-center space-x-2">
    //                                                       <span className="text-sm font-medium text-gray-600">{property.inquiries.length} Inquiries</span>
    //
    //                                                   </div>
    //                                               </div>
    //                                           }
    //                                     >
    //                                         {/* Your inquiry table or list here */}
    //                                         <div className="text-sm text-gray-700">
    //                                             <div className="overflow-x-auto">
    //                                                 <table className="min-w-full divide-y divide-gray-200">
    //                                                     <thead className="bg-gray-50">
    //                                                     <tr>
    //                                                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
    //                                                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
    //                                                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
    //                                                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
    //                                                         <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    //                                                     </tr>
    //                                                     </thead>
    //                                                     <tbody className="bg-white divide-y divide-gray-200">
    //                                                     {property.inquiries.map((inquiry) => (
    //                                                         <tr key={inquiry.id} className="hover:bg-gray-50">
    //                                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                                 <div className="flex items-center">
    //                                                                     <div className="flex-shrink-0 h-10 w-10">
    //                                                                         <img src="https://placehold.co/40x40" alt="Agent David Kim" className="h-10 w-10 rounded-full"/>
    //                                                                     </div>
    //                                                                     <div className="ml-4">
    //                                                                         <div className="text-sm font-medium text-gray-900">{inquiry.agent.name}</div>
    //                                                                         <div className="text-sm text-gray-500">{inquiry.agent.role}</div>
    //                                                                     </div>
    //                                                                 </div>
    //                                                             </td>
    //                                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                                 <div className="text-sm text-gray-900">Request to Handle Property</div>
    //                                                             </td>
    //                                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                                     <span className="status-badge pending">
    //                                                                         <i className="fas fa-clock mr-1"></i> {inquiry.status}
    //                                                                     </span>
    //                                                             </td>
    //                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    //                                                                 May 12, 2023
    //                                                             </td>
    //                                                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    //                                                                 {inquiry.status === 'Pending' && (
    //                                                                     <>
    //                                                                         <button
    //                                                                             onClick={() => handleOpenAcceptDialog(inquiry.id)}
    //                                                                             className="text-green-600 hover:text-green-900 mr-3"
    //                                                                         >
    //                                                                             Accept
    //                                                                         </button>
    //                                                                         <button
    //                                                                             onClick={() => handleOpenRejectDialog(inquiry.id)}
    //                                                                             className="text-red-600 hover:text-red-900"
    //                                                                         >
    //                                                                             Reject
    //                                                                         </button>
    //                                                                     </>
    //                                                                 )}
    //
    //                                                                 {inquiry.status === 'accepted' && (
    //                                                                     <>
    //                                                                         <button
    //                                                                             onClick={() => handleView(inquiry.id)}
    //                                                                             className="text-blue-600 hover:text-blue-900 mr-3"
    //                                                                         >
    //                                                                             View
    //                                                                         </button>
    //
    //                                                                         <button
    //                                                                             className="w-full text-left hover:text-primary"
    //                                                                             onClick={() => {
    //                                                                                 router.visit(route('seller.messages', { selectedUserId: inquiry.agent.id }));
    //                                                                             }}>
    //                                                                             Message
    //                                                                         </button>
    //
    //                                                                     </>
    //                                                                 )}
    //
    //                                                                 {inquiry.status === 'rejected' && (
    //                                                                     <span className="text-gray-500 italic">Rejected</span>
    //                                                                 )}
    //
    //
    //                                                             </td>
    //                                                         </tr>
    //                                                     ))}
    //
    //                                                     </tbody>
    //                                                 </table>
    //                                             </div>
    //                                         </div>
    //                                     </InquiriesCollapsable>
    //                                 ))}
    //                             </>
    //                         )}
    //                     </div>
    //                     <div className='mt-6'>
    //                         {properties.links.map((link, i) =>
    //                             link.url ? (
    //                                 <Link
    //                                     key={i}
    //                                     href={link.url}
    //                                     preserveState
    //                                     replace
    //                                     className={`px-4 py-2 mx-1 text-sm font-medium rounded-md border border-gray-200 transition-all ${
    //                                         link.active
    //                                             ? 'bg-accent text-white font-bold'
    //                                             : 'bg-white text-gray-700 hover:bg-green-100'
    //                                     }`}
    //                                     onClick={() => {
    //                                         const urlParams = new URLSearchParams(link.url.split('?')[1]);
    //                                         const page = parseInt(urlParams.get('page') || '1');
    //                                         setCurrentPage(page); // Track the current page
    //                                     }}
    //                                     dangerouslySetInnerHTML={{ __html: link.label }}
    //                                 />
    //                             ) : (
    //                                 <span
    //                                     key={i}
    //                                     className="px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
    //                                     dangerouslySetInnerHTML={{ __html: link.label }}
    //                                 />
    //                             )
    //                         )}
    //
    //                     </div>
    //                 </main>
    //
    //             </div>
    //         </AuthenticatedLayout>
    //     );
    // }
    //
    //
    import ScheduleVisitModal from "@/Components/modal/ScheduleVisitModal.jsx";
    import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
    import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
    import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
    import {
        faCalendarCheck,
        faClock,
        faEnvelope,
        faHouseChimney,
        faLocationDot,
        faPaperPlane,
        faPesoSign,
        faPhone,
        faTrashAlt
    } from "@fortawesome/free-solid-svg-icons";
    import dayjs from "dayjs";
    import { useEffect, useState } from "react";
    import { debounce } from "lodash";
    import { router, Link } from "@inertiajs/react";
    import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
    import relativeTime from "dayjs/plugin/relativeTime";
    import SellerInquiriesFilterTab from "@/Components/tabs/SellerInquiriesFilter.jsx";

    dayjs.extend(relativeTime);

    export default function Inquiries({
                                          inquiries,
                                          itemsPerPage = 10,
                                          search = '',
                                          page = 1,
                                          status = "",
                                          allCount,
                                          acceptedCount,
                                          rejectedCount,
                                          pendingCount,
                                          cancelledCount
                                      }) {
        const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
        const [selectedStatus, setSelectedStatus] = useState(status || '');
        const [searchTerm, setSearchTerm] = useState(search || '');

        const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
        const [openRejectDialog, setRejectDialog] = useState(false);
        const [selectedId, setSelectedId] = useState(null);

        // Use inquiries.current_page if available, else fallback to 1
        const currentPage = inquiries?.current_page || 1;

        const fetchFilteredResults = (page = currentPage) => {
            router.get('/seller/inquiries', {
                search: searchTerm,
                items_per_page: selectedItemsPerPage,
                status: selectedStatus,
                page: page,
            }, {
                preserveState: true,
                replace: true,
            });
        };

        // Debounce fetch when filters/search changes
        useEffect(() => {
            const debouncedFetch = debounce(() => {
                fetchFilteredResults(1);
            }, 500);

            debouncedFetch();

            return () => debouncedFetch.cancel();
        }, [searchTerm, selectedStatus, selectedItemsPerPage]);

        const getStatusBadge = (status) => {
            switch (status.toLowerCase()) {
                case "accepted": return "bg-green-100 text-green-800";
                case "pending": return "bg-yellow-100 text-yellow-800";
                case "cancelled":
                case "rejected":
                case "cancelled by buyer": return "bg-red-100 text-red-700";
                default: return "bg-gray-100 text-gray-700";
            }
        };

        const handleStatusUpdate = (action) => {
            if (!selectedId) return;

            router.patch(`/seller/inquiries/${selectedId}/${action}`, {}, {
                onSuccess: () => {
                    setOpenAcceptDialog(false);
                    setRejectDialog(false);
                    setSelectedId(null);
                    fetchFilteredResults(); // Refresh list after update
                }
            });
        };

        return (
            <AuthenticatedLayout>
                <div className="py-6 px-4">

                    {/* Accept Dialog */}
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

                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-primary mb-3">My Inquiries</h1>
                        <p className="text-gray-600 font-medium mb-6">
                            Keep track of all your property inquiries and agent communications.
                        </p>
                        <div className='flex justify-between border-b'>
                            <SellerInquiriesFilterTab page={page} count={[allCount, acceptedCount, rejectedCount, pendingCount, cancelledCount]} setSelectedStatus={setSelectedStatus} selectedStatus={selectedStatus} selectedItemsPerPage={selectedItemsPerPage} />

                            {/* Example Search/Input UI (Optional) */}
                            <input
                                type="text"
                                placeholder="Search for agent names..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className=" mb-2 p-2 border border-gray-300 rounded-md w-full max-w-sm"
                            />
                        </div>




                    </div>

                    {inquiries.data.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No inquiries yet.</p>
                    ) : (
                        inquiries.data.map((inquiry) => {
                            const property = inquiry.property ?? {};
                            const agent = inquiry.agent ?? {};
                            const message = inquiry.messages?.message;

                            const statusLower = inquiry.status.toLowerCase();
                            const isAccepted = statusLower === "accepted";
                            const isCancelled = statusLower === "cancelled" || statusLower === "cancelled by buyer";

                            return (
                                <div key={inquiry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-all">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                        <div className="col-span-12 lg:col-span-3">
                                            <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                                <img
                                                    src={`/storage/${property.image_url}`}
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                    alt={property.title || "Property Image"}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faPesoSign} />
                                                    {property.price?.toLocaleString() ?? "N/A"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-semibold text-primary">
                                                        {property.title ?? "Unknown Property"}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(inquiry.status)}`}>
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
                                                    Sent {dayjs(inquiry.created_at).fromNow()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                                    <img
                                                        src={agent.avatar_url || "https://placehold.co/80x80"}
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
                                                <p><FontAwesomeIcon icon={faPhone} className="mr-1" /> {agent.phone ?? "+63 912 345 6789"}</p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    href={`/agent/profile/${agent.id}`}
                                                    className='block w-full border text-center text-secondary border-secondary rounded-md py-2'
                                                >
                                                    View Profile
                                                </Link>
                                                {inquiry.status === 'Pending' ?  (
                                                    <div className="flex gap-x-2 w-full">
                                                        <button
                                                            className='w-full border rounded-md py-2 bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                                            onClick={() => {
                                                                setSelectedId(inquiry.id);
                                                                setOpenAcceptDialog(true);
                                                            }}
                                                            disabled={isAccepted || isCancelled}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            className='w-full border rounded-md py-2 bg-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                                            onClick={() => {
                                                                setSelectedId(inquiry.id);
                                                                setRejectDialog(true);
                                                            }}
                                                            disabled={isCancelled}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={`w-full text-center py-2 cursor-not-allowed text-white rounded-md ${
                                                            inquiry.status === "accepted" ? "bg-primary" : "bg-secondary"
                                                        }`}
                                                    >
                                                        {inquiry.status}
                                                    </button>

                                                ) }

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {inquiries.links?.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => fetchFilteredResults(link.label === '...' ? currentPage : Number(link.label))}
                                className={`px-3 py-1 mx-1 border rounded ${
                                    link.active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

