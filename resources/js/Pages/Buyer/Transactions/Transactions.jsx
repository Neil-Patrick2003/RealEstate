import React, { useEffect } from "react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import Dropdown from "@/Components/Dropdown.jsx";
import { EllipsisVertical } from "lucide-react";
import { Link, Head } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default function Transactions({
                                         properties = { data: [], links: [] },
                                         imageUrl = "",
                                         searchTerm = "",
                                         selectedStatus = "",
                                         selectedItemsPerPage = 10,
                                     }) {
    useEffect(() => {
        document.title = "Transactions | Buyer Dashboard";
    }, []);

    const handleOpenDeleteDialog = (id) => {
        console.log(`Attempt to delete property with id: ${id}`);
    };

    const handleItemsPerPageChange = (e) => {
        console.log("Items per page changed to:", e.target.value);
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "inactive":
                return "bg-yellow-100 text-yellow-700";
            case "sold":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <BuyerLayout>
            <Head title="Transactions" />

            <div className="mt-12">
                {/* Main Header */}
                <h1 className="text-2xl font-semibold text-primary">Transactions</h1>

                {/* Subheader Section */}
                <div className="mt-2 mb-6 text-sm text-gray-500 flex items-center justify-between flex-wrap gap-2">
                    <p>Below is a list of all your property transactions including their current status.</p>
                    {/* Optional space for filters, export, buttons etc */}
                    {/* <button className="text-sm text-blue-600 hover:underline">Export CSV</button> */}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-center">
                                <input type="checkbox" className="rounded border-gray-400" aria-label="Select all properties" />
                            </th>
                            <th className="p-3">Property</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Agent(s)</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed">
                        {Array.isArray(properties?.data) && properties.data.length > 0 ? (
                            properties.data.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                        <input id={property.id} type="checkbox" className="rounded border-gray-400" />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center py-2 gap-3">
                                            <img
                                                src={property.image_url ? `${imageUrl}${property.image_url}` : "/fallback-image.png"}
                                                alt={property.title}
                                                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md"
                                                onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800">{property.title}</p>
                                                <p className="text-xs md:text-sm text-gray-500">{property.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">{property.property_type}, {property.sub_type}</td>
                                    <td className="p-3">
                                        <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[250px]">
                                            {property.description}
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">₱ {Number(property.price).toLocaleString()}</td>
                                    <td className="p-3">
                                            <span className={`inline-block font-semibold px-3 py-1 rounded-md text-xs ${getStatusClasses(property.status)}`}>
                                                {property.status}
                                            </span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {property.property_type === "land" ? property.lot : property.floor_area} m²
                                    </td>
                                    <td className="p-3 text-right">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <div className="p-2 w-9 rounded-full hover:bg-gray-200 cursor-pointer">
                                                    <EllipsisVertical size={20} className="text-gray-600" />
                                                </div>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content className="absolute right-0 top-10 w-36 bg-white shadow-md rounded-md z-50 text-sm">
                                                <ul className="divide-y divide-gray-100">
                                                    <Link href={`/seller/properties/${property.id}`}>
                                                        <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                                                            <FontAwesomeIcon icon={faExpand} /> View
                                                        </li>
                                                    </Link>
                                                    <Link href={`/seller/properties/${property.id}/edit`}>
                                                        <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                                                            <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                                        </li>
                                                    </Link>
                                                    <li
                                                        onClick={() => handleOpenDeleteDialog(property.id)}
                                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashCan} /> Delete
                                                    </li>
                                                </ul>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-400">
                                    No properties found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination + Items per page */}
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 rounded-b-xl p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="selectedItemsPerPage" className="text-sm text-gray-600">
                            Items per page:
                        </label>
                        <select
                            id="selectedItemsPerPage"
                            value={selectedItemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border border-gray-300 rounded-md text-sm"
                        >
                            {[5, 10, 15, 20].map((val) => (
                                <option key={val} value={val}>
                                    {val}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end" aria-label="Pagination navigation">
                        {Array.isArray(properties?.links) && properties.links.length > 0 ? (
                            properties.links.map((link, i) => {
                                const query = new URLSearchParams({
                                    search: searchTerm,
                                    status: selectedStatus,
                                    items_per_page: selectedItemsPerPage,
                                });
                                const urlWithParams = link.url ? `${link.url}&${query.toString()}` : null;

                                return link.url ? (
                                    <Link
                                        key={i}
                                        href={urlWithParams}
                                        className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition ${
                                            link.active ? "bg-primary text-white font-semibold" : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-current={link.active ? "page" : undefined}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-disabled="true"
                                    />
                                );
                            })
                        ) : (
                            <span className="text-sm text-gray-400">No pagination available</span>
                        )}
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
