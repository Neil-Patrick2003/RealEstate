
    import React, {useEffect, useState} from "react";
    import dayjs from "dayjs";
    import {router} from "@inertiajs/react";
    import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
    import InquiriesCollapsable from "@/Components/collapsable/InquiriesClosable.jsx";
    import { Link } from '@inertiajs/react';
    import {debounce} from "lodash";
    import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

    export default function Inquiries({
                                          properties,
                                          itemsPerPage = 10,
                                          search = '',
                                          allCount,
                                          acceptedCount,
                                          rejectedCount,
                                          pendingCount,
                                          filters = {},
                                      }) {


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
        const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
        const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
        const [selectedType, setSelectedType] = useState(filters.property_type || '');
        const [searchTerm, setSearchTerm] = useState(search || '');

        const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
        const [openRejectDialog, setRejectDialog] = useState(false);
        const [selectedId, setSelectedId] = useState(null);
        const [currentPage, setCurrentPage] = useState(properties.current_page || 1);

        // ⏳ Debounced search
        useEffect(() => {
            const delayedSearch = debounce(() => {
                setCurrentPage(1); // Reset page when filters/search change
                fetchFilteredResults(1);
            }, 500);

            delayedSearch();
            return () => delayedSearch.cancel();
        }, [searchTerm, selectedItemsPerPage, selectedStatus, selectedType]);

        const fetchFilteredResults = (page = currentPage) => {
            router.get('/seller/inquiries', {
                search: searchTerm,
                items_per_page: selectedItemsPerPage,
                status: selectedStatus,
                property_type: selectedType,
                page: page,
            }, {
                preserveState: true,
                replace: true,
            });
        };


        const handleSearchTermChange = (value) => setSearchTerm(value);
        const handleStatusChange = (e) => setSelectedStatus(e.target.value);
        const handleTypeChange = (e) => setSelectedType(e.target.value);
        const handleItemsPerPageChange = (e) => setSelectedItemsPerPage(parseInt(e.target.value));

        return (
            <AuthenticatedLayout>

                <div>
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
                    <header className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Property Inquiries</h1>
                                <p className="text-sm text-gray-600">Manage inquiries grouped by property</p>
                            </div>
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <i className="fas fa-plus mr-2"></i> New Property
                            </button>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Properties</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{allCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <i className="fas fa-home text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Active Inquiries</p>
                                        <h3 className="text-2xl font-bold text-indigo-600">24</h3>
                                    </div>
                                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                        <i className="fas fa-envelope-open-text text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Pending</p>
                                        <h3 className="text-2xl font-bold text-amber-500">{pendingCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                                        <i className="fas fa-clock text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Accepted</p>
                                        <h3 className="text-2xl font-bold text-emerald-500">{acceptedCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                                        <i className="fas fa-check-circle text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Rejected</p>
                                        <h3 className="text-2xl font-bold text-rose-500">{rejectedCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-full bg-rose-100 text-rose-600">
                                        <i className="fas fa-times-circle text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="fas fa-search text-gray-400"></i>
                                        </div>
                                        <input
                                            type="search"
                                            name='search'
                                            placeholder="Search properties or inquiries..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={searchTerm}
                                            onChange={(e) => handleSearchTermChange(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <select
                                        name='property_type'
                                        value={selectedType}
                                        onChange={handleTypeChange}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                                    >
                                        <option value="">All Property Types</option>
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Land">Land</option>
                                    </select>

                                    <select
                                        name='status'
                                        value={selectedStatus}
                                        onChange={handleStatusChange}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>

                                    <select
                                        value={selectedItemsPerPage}
                                        name='item_per_page'
                                        onChange={handleItemsPerPageChange}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                                    >
                                        <option value="5">5 / page</option>
                                        <option value="10">10 / page</option>
                                        <option value="20">20 / page</option>
                                        <option value="50">50 / page</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {properties.data.length === 0 ? (
                                <div>No inquiries Yet</div>
                            ) : (
                                <>
                                    {properties.data.map((property) => (
                                        <InquiriesCollapsable key={property.id}
                                              header={
                                                  <div className="flex items-center justify-between w-full">
                                                      <div className="flex items-center space-x-4">
                                                          <img src={`/storage/${property.image_url}`} alt="Property" className="w-24 h-18 rounded object-cover" />
                                                          <div>
                                                              <h2 className="text-lg font-bold text-primary">{property.title}</h2>
                                                              <div className="flex gap-2 mt-1">
                                                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{property.property_type}</span>
                                                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{property.sub_type}</span>
                                                                  <span className="text-xs bg-lightaccent text-accent px-2 py-1 rounded">₱1{property.price}</span>
                                                              </div>
                                                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                                                  <span>{property.address}</span>
                                                              </div>
                                                          </div>
                                                      </div>

                                                      <div className="flex items-center space-x-2">
                                                          <span className="text-sm font-medium text-gray-600">{property.inquiries.length} Inquiries</span>

                                                      </div>
                                                  </div>
                                              }
                                        >
                                            {/* Your inquiry table or list here */}
                                            <div className="text-sm text-gray-700">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                        {property.inquiries.map((inquiry) => (
                                                            <tr key={inquiry.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0 h-10 w-10">
                                                                            <img src="https://placehold.co/40x40" alt="Agent David Kim" className="h-10 w-10 rounded-full"/>
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">{inquiry.agent.name}</div>
                                                                            <div className="text-sm text-gray-500">{inquiry.agent.role}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">Request to Handle Property</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="status-badge pending">
                                                                            <i className="fas fa-clock mr-1"></i> {inquiry.status}
                                                                        </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    May 12, 2023
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    {inquiry.status === 'Pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleOpenAcceptDialog(inquiry.id)}
                                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                                            >
                                                                                Accept
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOpenRejectDialog(inquiry.id)}
                                                                                className="text-red-600 hover:text-red-900"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {inquiry.status === 'accepted' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleView(inquiry.id)}
                                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                                            >
                                                                                View
                                                                            </button>

                                                                            <button
                                                                                className="w-full text-left hover:text-primary"
                                                                                onClick={() => {
                                                                                    router.visit(route('seller.messages', { selectedUserId: inquiry.agent.id }));
                                                                                }}>
                                                                                Message
                                                                            </button>

                                                                        </>
                                                                    )}

                                                                    {inquiry.status === 'rejected' && (
                                                                        <span className="text-gray-500 italic">Rejected</span>
                                                                    )}


                                                                </td>
                                                            </tr>
                                                        ))}

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </InquiriesCollapsable>
                                    ))}
                                </>
                            )}
                        </div>
                        <div className='mt-6'>
                            {properties.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        replace
                                        className={`px-4 py-2 mx-1 text-sm font-medium rounded-md border border-gray-200 transition-all ${
                                            link.active
                                                ? 'bg-accent text-white font-bold'
                                                : 'bg-white text-gray-700 hover:bg-green-100'
                                        }`}
                                        onClick={() => {
                                            const urlParams = new URLSearchParams(link.url.split('?')[1]);
                                            const page = parseInt(urlParams.get('page') || '1');
                                            setCurrentPage(page); // Track the current page
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}

                        </div>
                    </main>

                </div>
            </AuthenticatedLayout>
        );
    }


