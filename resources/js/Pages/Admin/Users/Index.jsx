import AdminLayout from "@/Layouts/AdminLayout.jsx";
import { Link, router } from "@inertiajs/react";
import React, { useCallback, useEffect, useState } from "react";
import { Download, Pencil, Trash } from "lucide-react";
import { debounce } from "lodash";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

export default function Index({ users }) {
    const [selectedSort, setSelectedSort] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounced Search
    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(
                "/broker/transactions",
                {
                    page: 1,
                    search: value,
                    perPage: itemsPerPage,
                    sort: selectedSort,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 500),
        [selectedSort, itemsPerPage]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
        router.get(
            "/broker/transactions",
            {
                page: 1,
                search: searchTerm,
                perPage: itemsPerPage,
                sort: value,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handlePerPageChange = (value) => {
        setItemsPerPage(value);
        router.get(
            "/broker/transactions",
            {
                page: 1,
                search: searchTerm,
                perPage: value,
                sort: selectedSort,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = () => {
        if (!selectedUserId) return;

        setLoading(true);

        router.delete(`/admin/users/${selectedUserId}`, {
            onSuccess: () => {
                console.log(`User ${selectedUserId} deleted successfully.`);
                setOpenDeleteModal(false);
                setSelectedUserId(null);
            },
            onError: (errors) => {
                console.error("Failed to delete user:", errors);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };






    return (


        <AdminLayout>
            <ConfirmDialog
                open={openDeleteModal}
                onConfirm={handleDelete}
                setOpen={setOpenDeleteModal}
                description={'Are you sure you want to delete this user? This action cannot be undone.'}
                title={'Delete User'}
                loading={loading}
                cancelText={'Cancel'}
                confirmText={'Confirm'}
            />

            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
                <Link href='/admin/users/create' className='bg-primary text-white px-4 py-2 rounded hover:bg-accent'>
                    Add Users
                </Link>
            </div>

            <p className="text-gray-500 mb-6">
                A complete history of all transactions made by your partners.
            </p>

            {/* Filter & Search */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <select
                    onChange={(e) => handleSortChange(e.target.value)}
                    value={selectedSort}
                    className="border border-gray-300 rounded-md text-sm px-4 py-2"
                >
                    <option value="asc">Sort Ascending</option>
                    <option value="desc">Sort Descending</option>
                </select>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchTermChange(e.target.value)}
                        placeholder="Search by name, email..."
                        className="border border-gray-300 rounded-md text-sm px-4 py-2"
                    />
                    <button className="border border-gray-300 py-2 px-2.5 rounded-md text-gray-500 hover:bg-gray-200 transition cursor-not-allowed">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] bg-white rounded-t-lg">
                <table className="min-w-full divide-y divide-gray-200 text-gray-700">
                    <thead className="bg-gray-100 text-sm text-gray-500 uppercase tracking-wide hidden md:table-header-group sticky top-0 z-20">
                    <tr>
                        <th className="p-3 text-start">Name</th>
                        <th className="p-3 text-start">Status</th>
                        <th className="p-3 text-start">Role</th>
                        <th className="p-3 text-start">Joined At</th>
                        <th className="p-3 text-start">Last Active</th>
                        <th className="p-3 text-start rounded-tr-lg">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed">
                    {users?.data?.length > 0 ? (
                        users.data.map((user) => {
                            const joined = new Date(user.created_at).toLocaleDateString();
                            const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : "N/A";

                            return (
                                <tr key={user.id} className="flex flex-col md:table-row hover:bg-gray-50">
                                    <td className="p-3 flex items-center gap-3">
                                        <input type="checkbox" className="border border-gray-400 rounded-md" />
                                        {user.photo_url ? (
                                            <img
                                                src={`/storage/${user.photo_url}`}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-700">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.status === "active" ? "bg-green-100 text-green-700" :
                                                    user.status === "inactive" ? "bg-red-100 text-red-700" :
                                                        user.status === "suspended" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || "N/A"}
                                            </span>
                                    </td>

                                    <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === "Buyer" ? "bg-yellow-100 text-yellow-700" :
                                                    user.role === "Seller" ? "bg-red-100 text-red-700" :
                                                        user.role === "Agent" ? "bg-blue-100 text-blue-700" :
                                                            user.role === "Broker" ? "bg-indigo-100 text-indigo-700" :
                                                                user.role === "Admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {user.role || "N/A"}
                                            </span>
                                    </td>

                                    <td className="p-3">{joined}</td>
                                    <td className="p-3">{lastLogin}</td>
                                    <td className="p-3">
                                        <div className="flex gap-3">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Pencil className="text-primary h-4 w-4 cursor-pointer" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setOpenDeleteModal(true);
                                                }}
                                            >
                                                <Trash className="text-red-500 h-4 w-4 cursor-pointer" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td className="p-6 text-center text-gray-500" colSpan="6">
                                No users found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
                <div className="text-sm text-gray-600">
                    Showing <strong>{users?.from}</strong> to <strong>{users?.to}</strong> of <strong>{users?.total}</strong>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {users?.links.map((link, idx) =>
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

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        Per Page:
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-4 py-2"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
