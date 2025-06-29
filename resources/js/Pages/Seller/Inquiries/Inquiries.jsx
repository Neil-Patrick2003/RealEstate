import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import React, {useState} from "react";
import dayjs from "dayjs";
import {Link, router} from "@inertiajs/react";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

export default function Inquiries({
      inquiries,
      inquiriesCount,
      rejectedCount,
      acceptedCount,
      pendingCount,
      cancelledCount,
      page = 1,
      itemsPerPage = 10,
      status = 'All',
  }){

    const imageUrl = '/storage/'
    const [ selectedStatus, setSelectedStatus ] = useState(status);
    const [selectedItemsPerPage, setSelectedItemsPerPage ] = useState(itemsPerPage);
    const [ openAcceptDialog, setOpenAcceptDialog ] = useState(false);
    const [ openRejectDialog, setRejectDialog ] = useState(false)
    const [ selectedId, setSelectedId ] = useState(null);

    // handle change items per page iin table
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = e.target.value;
        setSelectedItemsPerPage(newItemsPerPage);
        router.get('/inquiries', {
            page: 1,
            items_per_page: newItemsPerPage,
            status: selectedStatus,
        }, { preserveState: true, replace: true });
    };

    //handle open accept dialog
    const handleOpenAcceptDialog = (id) => {
        setOpenAcceptDialog(true);
        setSelectedId(id);
    }


    //handle accept
    const handleAccept = () => {
        if (!selectedId) return;

        router.patch(`/sellers/inquiries/${selectedId}/accept`, {
            onSuccess: () => {
                selectedId(null);
            }
        });
    }

    //handle open reject dialog
    const handleOpenRejectDialog = (id) => {
        setRejectDialog(true);
        setSelectedId(id);
    }

    //handle reject
    const handleReject = () => {

        router.patch(`/sellers/inquiries/${selectedId}/reject`, {
            onSuccess: () => {
                selectedId(null);
            }
        });
    }





    return(


        <AuthenticatedLayout>
            <ConfirmDialog
                open={openAcceptDialog}
                setOpen={setOpenAcceptDialog}
                title="Accpet Inquiry"
                description="Are you sure you want to accept this inquiry? This allow agent to handle your property posting"
                confirmText='Confirm'
                cancelText='Cancel'
                onConfirm={handleAccept}
                loading={false}
            />

            <ConfirmDialog
                open={openRejectDialog}
                setOpen={setRejectDialog}
                title="Reject Inquiry"
                description="Are you sure you want to reject this inquiry? This action cannot be undone."
                confirmText='Confirm'
                cancelText='Cancel'
                onConfirm={handleReject}
                loading={false}
            />
            <div className='flex flex-col max-w-7xl mx-auto'>
                <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                        <tr>
                            <th className="p-3 text-center">
                                <input type="checkbox" id='deleteAll' className="rounded border-gray-400" />
                            </th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Agent</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date Inquire</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed">
                        {inquiries.data.length > 0 ? (
                            inquiries.data.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                    <td className="p-3 text-center hidden md:table-cell">
                                        <input id={inquiry.id} type="checkbox" className="rounded border-gray-400" />
                                    </td>
                                    <td className="p-3 md:table-cell ">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`${imageUrl}${inquiry.property.image_url}`}
                                                alt={inquiry.id}
                                                className="w-14 h-14 object-cover rounded-md"
                                            />
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-gray-800">{inquiry.property.title}</p>
                                                <p className="text-xs text-gray-500">{inquiry.property.property_type} | {inquiry.property.sub_type}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-3 whitespace-nowrap md:table-cell">
                                        <p className="hover:cursor-pointer hover:underline hover:text-primary">{inquiry.agent.name}</p>
                                    </td>
                                    <td className="p-3 md:table-cell">
                                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs ring-1 ring-orange-200">
                                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap md:table-cell">
                                        {dayjs(inquiry.created_at).format('MMMM D, YYYY')}
                                    </td>
                                    <td className="p-3 text-right md:table-cell">
                                        <button className='border bg-primary px-4 py-1.5 text-xs text-white rounded-l-md' onClick={() => setOpenAcceptDialog(true)}>Accept</button>
                                        <button className='bg-secondary px-4 py-1.5 text-xs text-white rounded-r-md' onClick={() => setRejectDialog(true)}>Reject</button>

                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-400">
                                    No inquiries found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Items Per Page */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">Items per page:</label>
                        <select
                            id="selectedItemsPerPage"
                            value={selectedItemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border-gray-300 rounded-md text-sm"
                        >
                            {[5, 10, 15, 20].map((val) => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        {inquiries.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm rounded-md border transition ${
                                        link.active ? 'bg-gray-500 text-white font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
