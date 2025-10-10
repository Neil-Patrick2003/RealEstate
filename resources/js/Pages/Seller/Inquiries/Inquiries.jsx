
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
                            const message = inquiry?.notes || null;
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
                                                        {Number(property.price).toLocaleString('en-PH', {style: 'currency', currency: 'PHP' }) ?? "N/A"}
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
                                                        <strong>message: </strong>
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
                                                {agent.photo_url ? (
                                                    <img
                                                        src={`/storage/${agent.photo_url}`}
                                                        alt={agent.name ?? "Agent"}
                                                        className="w-10 h-10 object-cover mr-2"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 flex items-center mr-2 justify-center bg-gray-300 text-gray-700 text-xl font-bold rounded-full">
                                                        {agent.name ? agent.name.charAt(0).toUpperCase() : "A"}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {agent.name ?? "Unknown Agent"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 mb-4 space-y-1">
                                                <p><FontAwesomeIcon icon={faEnvelope} className="mr-1" /> {agent.email ?? "N/A"}</p>
                                                <p><FontAwesomeIcon icon={faPhone} className="mr-1" /> {agent.contact_number ?? "Not provided"}</p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    href={`/seller/inquiries/agent/${agent.id}`}
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

