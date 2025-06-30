import AgentLayout from "@/Layouts/AgentLayout.jsx";
import dayjs from "dayjs";
import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import AgentInquiriesFilterTab from "@/Components/tabs/AgentInquiriesFilterTab.jsx";
import AgentPropertyListingFilterTab from "@/Components/tabs/AgentPropertyListingFIlterTab.jsx";

export default function Properties({properties, propertiesCount, forPublishCount, publishedCount, soldCount,                        itemsPerPage = 10, status = 'All', page = 1}) {

    // styles for status
    const statusStyles = {
        accepted: 'bg-green-100 text-green-700 ring-green-200',
        rejected: 'bg-red-100 text-red-700 ring-red-200',
        pending: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
        cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
        default: 'bg-orange-100 text-orange-700 ring-orange-200'
    };

    // const formatStatusLabel = (status) => {
    //     switch (status.toLowerCase()) {
    //         case 'for_publish':
    //             return 'For Publish';
    //         case 'published':
    //             return 'Published';
    //         case 'sold':
    //             return 'Sold';
    //         default:
    //             return status.charAt(0).toUpperCase() + status.slice(1);
    //     }
    // };


    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);

    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = e.target.value;
        setSelectedItemsPerPage(newItemsPerPage);
        router.get('/agents/my-listings', {
            page: 1,
            items_per_page: newItemsPerPage,
            status: selectedStatus,
        }, { preserveState: true, replace: true });
    };


    const imageUrl = '/storage/';

    return (
        <AgentLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">My Property Listings</h1>
                <p className="text-gray-700 mb-6">
                    This is the agent dashboard page where you can view and manage the property listings you handle for sellers. Keep track of active, pending, or sold properties easily from here.
                </p>


                <div className="rounded-t-xl shadow-sm overflow-x-auto">
                    <AgentPropertyListingFilterTab
                        count={[propertiesCount, forPublishCount, publishedCount, soldCount]}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        page={page}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>
                <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                        <tr>
                            <th className="p-3 text-center">
                                <input  id='deleteAll' type="checkbox" className="rounded border-gray-400" />
                            </th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Seller</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Size(m2)</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date Inquired</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed">
                        {properties?.data.length > 0 ? (
                            properties.data.map((property) => {
                                const statusClass = statusStyles[property.status] || statusStyles.default;
                                const isPending = property.status.toLowerCase() === 'pending';
                                const isCancelled = property.status.toLowerCase() === 'cancelled';

                                return (
                                    <tr key={property.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                        <td className="p-3 text-center hidden md:table-cell">
                                            <input id={property.id} type="checkbox" className="rounded border-gray-400" />
                                        </td>
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`${imageUrl}${property.property.image_url}`}
                                                    onError={(e) => e.target.src = '/placeholder.png'}
                                                    alt={property.property.title}
                                                    className="w-14 h-14 object-cover rounded-md"
                                                />
                                                <div className="flex flex-col">
                                                    <p className="font-semibold text-gray-800">{property.property.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {property.property.property_type} | {property.property.sub_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap md:table-cell">
                                            <p className="flex flex-col cursor-pointer font-bold hover:underline text-primary">
                                                {property.seller.name}
                                                <span className='font-medium text-xs'>{property.seller.email}</span>
                                            </p>
                                        </td>
                                        <td className="p-3 whitespace-nowrap  md:table-cell">
                                            {property.property.property_type}|{property.property.sub_type}
                                        </td>
                                        <td className="p-3 whitespace-nowrap  md:table-cell">
                                            {property.property.address}
                                        </td>
                                        <td className="p-3 whitespace-nowrap  md:table-celll">
                                            {property.property.price}
                                        </td>
                                        <td className="p-3 whitespace-nowrap  md:table-cell">
                                            {property.property?.lot_area}
                                        </td>
                                        <td className="p-3 whitespace-nowrap  md:table-cell">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>
                                                    {/*{formatStatusLabel(property.status)}*/}
                                                    {property.status}
                                                </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap md:table-cell">
                                            {dayjs(property.created_at).format('MMMM D, YYYY')}
                                        </td>
                                        <td className="p-3 text-right md:table-cell">
                                            <button>edit    </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-400">
                                    No properties found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {properties?.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`px-4 py-2 text-sm rounded-md border transition ${
                                    link.active
                                        ? 'bg-gray-500 text-white font-semibold'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="px-4 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            </div>
        </AgentLayout>
    );
}
