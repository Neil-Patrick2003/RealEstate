import React, {useState, useEffect, useCallback} from "react";
import dayjs from "dayjs";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function Transaction({ transactions, search = "" }) {
    const [searchTerm, setSearchTerm] = useState(search || "");

    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get("/agents/transaction", { search: value }, {
                preserveState: true,
                replace: true,
            });
        }, 500),
        [] // only created once
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Cancel debounce on unmount
    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    return (
        <AgentLayout>
            <div className="bg-white shadow-sm rounded-lg overflow-x-auto border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-800">My Transactions</h2>

                    <div className="relative w-full md:max-w-sm">
                        <input
                            value={searchTerm}
                            onChange={handleSearchChange}
                            type="text"
                            placeholder="Search property, buyer, seller..."
                            className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-700 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    </div>
                </div>

                {transactions.data.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">No transactions found.</div>
                ) : (
                    <>
                        <table className="min-w-full text-sm text-slate-700">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                            <tr>
                                <th className="p-3 text-left">Property</th>
                                <th className="p-3 text-left">Seller</th>
                                <th className="p-3 text-left">Buyer</th>
                                <th className="p-3 text-left">Amount</th>
                                <th className="p-3 text-left">Sold At</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-dashed divide-gray-100">
                            {transactions.data.map((txn) => {
                                const property = txn.property_listing?.property;
                                const seller = txn.property_listing?.seller;
                                const buyer = txn.buyer;

                                return (
                                    <tr
                                        key={txn.id}
                                        className="hover:bg-gray-50 transition-all flex flex-col md:table-row"
                                    >
                                        {/* Property */}
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                                    alt={property?.title || "Property"}
                                                    className="w-14 h-14 object-cover rounded-md border border-gray-200"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-700">{property?.title}</p>
                                                    <p className="text-xs text-gray-400">{property?.address}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Seller */}
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-semibold uppercase">
                                                    {seller?.name?.charAt(0) ?? "S"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{seller?.name}</p>
                                                    <p className="text-xs text-gray-400">{seller?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Buyer */}
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-300 text-white flex items-center justify-center rounded-full font-semibold uppercase">
                                                    {buyer?.name?.charAt(0) ?? "B"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{buyer?.name}</p>
                                                    <p className="text-xs text-gray-400">{buyer?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="p-3 md:table-cell">
                                            <p className="text-sm font-semibold text-green-600">
                                                ₱{parseFloat(txn.amount).toLocaleString()}
                                            </p>
                                        </td>

                                        {/* Sold At */}
                                        <td className="p-3 md:table-cell text-sm text-slate-600">
                                            {dayjs(txn.created_at).format("MMM D, YYYY")}
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 md:table-cell">
                                                <span
                                                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                                                        txn.status === "Sold"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {txn.status}
                                                </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="p-4 flex flex-wrap gap-2 justify-end border-t border-gray-100">
                            {transactions.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition ${
                                            link.active
                                                ? "bg-green-600 text-white font-semibold border-green-600"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    </>
                )}
            </div>
        </AgentLayout>
    );
}
