import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import {Link, router} from "@inertiajs/react";
import React, {useCallback, useEffect} from "react";
import { Download } from 'lucide-react';
import {debounce} from "lodash";

export default function Transaction({ transactions }) {

    const [selectedSort, setSelectedSort] = React.useState('asc');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [itemsPerPage, setItemsPerPage] = React.useState(5);


    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get('/broker/transactions', {
                page: 1,
                search: value,
                perPage: itemsPerPage,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 500),
        [selectedSort, itemsPerPage]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
        router.get('/broker/agents', {
            page: 1,
            search: searchTerm,
            perPage: itemsPerPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (value) => {
        setItemsPerPage(value);
        router.get('/broker/transactions', {
            page: 1,
            search: searchTerm,
            perPage: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <BrokerLayout>
            <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
            <p className="text-gray-500 mb-6">
                A complete history of all transactions made by your partners.
            </p>

            {/* Filter & Search */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <select className="border border-gray-300 rounded-md text-sm px-4 py-2">
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <div className="flex items-center gap-2">
                    <input
                        id='search'
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchTermChange(e.target.value)}
                        placeholder="Search by property, buyer, or date..."
                        className="border border-gray-300 rounded-md text-sm px-4 py-2"
                    />
                    <button className="border border-gray-300 py-2 px-2.5 rounded-md text-gray-500 hover:bg-gray-200 transition cursor-not-allowed">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] bg-white scrollbar-thumb-gray-300 scrollbar-track-transparent rounded-t-lg">
                <table className="min-w-full divide-y border-b divide-gray-200 text-gray-700">
                    <thead className="bg-gray-100 text-sm text-gray-500 uppercase tracking-wide hidden md:table-header-group sticky top-0 z-20">
                    <tr>
                        <th className="p-3 text-start rounded-tl-lg">Property</th>
                        <th className="p-3 text-start">Buyer</th>
                        <th className="p-3 text-start">Date</th>
                        <th className="p-3 text-start">Type</th>
                        <th className="p-3 text-start">Address</th>
                        <th className="p-3 text-start">Price</th>
                        <th className="p-3 text-start rounded-tr-lg">Size</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-dashed">
                    {transactions?.data?.length > 0 ? (
                        transactions.data.map(transaction => {
                            const property = transaction?.property_listing?.property;
                            const buyer = transaction?.buyer;
                            const date = new Date(transaction?.created_at).toLocaleDateString();

                            return (
                                <tr key={transaction.id} className="flex flex-col md:table-row hover:bg-gray-50">
                                    {/* Property Info */}
                                    <td className="p-3 md:table-cell">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`/storage/${property.image_url}`}
                                                alt={property.title}
                                                className="w-14 h-14 object-cover rounded-md"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-700">{property.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {property.property_type} | {property.sub_type}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Buyer */}
                                    <td className="p-3 md:table-cell">
                                        {buyer ? (
                                            <div className="flex items-center gap-3">
                                                {buyer.photo_url ? (
                                                    <img
                                                        src={`/storage/${buyer.photo_url}`}
                                                        alt={buyer.name}
                                                        title={buyer.name}
                                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white"
                                                        title={buyer.name}
                                                    >
                                                        {buyer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-700">{buyer.name}</p>
                                                    <p className="text-xs text-gray-500">{buyer.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">No buyer</span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="p-3 md:table-cell text-gray-700">
                                        {date}
                                    </td>

                                    {/* Type */}
                                    <td className="p-3 md:table-cell text-gray-700">
                                        {property.isPresell !== 1 ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    For Sale
                                                </span>
                                        ) : (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    Pre-Sale
                                                </span>
                                        )}
                                    </td>

                                    {/* Address */}
                                    <td className="p-3 md:table-cell text-gray-700">
                                        {property.address}
                                    </td>

                                    {/* Price */}
                                    <td className="p-3 md:table-cell text-gray-700">
                                        ₱ {property.price.toLocaleString()}
                                    </td>

                                    {/* Size */}
                                    <td className="p-3 md:table-cell text-gray-700">
                                        {property.lot_area} / {property.floor_area} m²
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td className="p-6 text-center text-gray-500" colSpan="7">
                                No transactions found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
                {/* Info */}
                <div className="text-sm text-gray-600">
                    Showing <strong>{transactions?.to}</strong> of <strong>{transactions?.total}</strong>
                </div>

                {/* Pagination & Per Page */}
                <div className="flex items-center gap-4">
                    {/* Pagination Links */}
                    <div className="flex gap-2">
                        {transactions?.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`px-3 py-2 rounded-md text-sm border transition ${
                                        link.active
                                            ? "bg-primary text-white font-semibold"
                                            : "bg-white text-gray-600 hover:bg-gray-100"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="px-3 py-2 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        )}
                    </div>

                    {/* Per Page Selector */}
                    <div className="flex items-center gap-1 text-sm  text-gray-600">
                        Per Page:
                        <select
                            id='page_item'
                            value={itemsPerPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-4 py-2">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>

                </div>
            </div>
        </BrokerLayout>
    );
}
