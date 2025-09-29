import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import AddPartner from "@/Pages/Broker/Partner/Modal/AddPartner.jsx";
import DeveloperCard from "@/Pages/Broker/Partner/Card/DeveloperCard.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faMagnifyingGlass,
    faArrowUpAZ,
    faArrowDownAZ,
    faClockRotateLeft,
    faList,
    faBorderAll,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Partner({ developers = [] }) {
    // Local working copy so UI can react immediately
    const [list, setList] = useState(() => developers);
    useEffect(() => setList(developers), [developers]);

    // UI state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("name-asc"); // name-asc | name-desc | created-desc | created-asc
    const [view, setView] = useState("grid"); // grid | list
    const [perPage, setPerPage] = useState(12);
    const [page, setPage] = useState(1);

    // Bulk select
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Delete confirm
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

    // Derived
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let arr = [...list];

        if (q) {
            arr = arr.filter((d) => {
                const hay = `${d?.name || ""} ${d?.email || ""} ${d?.address || ""}`.toLowerCase();
                return hay.includes(q);
            });
        }

        arr.sort((a, b) => {
            const an = (a?.name || "").toLowerCase();
            const bn = (b?.name || "").toLowerCase();
            const ac = new Date(a?.created_at || 0).getTime();
            const bc = new Date(b?.created_at || 0).getTime();

            switch (sort) {
                case "name-desc":
                    return bn.localeCompare(an);
                case "created-desc":
                    return bc - ac;
                case "created-asc":
                    return ac - bc;
                case "name-asc":
                default:
                    return an.localeCompare(bn);
            }
        });

        return arr;
    }, [list, query, sort]);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(page, totalPages);
    const paged = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    useEffect(() => {
        // reset to first page whenever filters change
        setPage(1);
    }, [query, sort, perPage]);

    // Handlers
    const handleAdd = () => {
        setSelectedDeveloper(null);
        setModalOpen(true);
    };

    const handleEdit = (developer) => {
        setSelectedDeveloper(developer);
        setModalOpen(true);
    };

    const handleDeleteOne = (developerId) => {
        setPendingDeleteIds([developerId]);
        setConfirmOpen(true);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setPendingDeleteIds(Array.from(selectedIds));
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        const ids = [...pendingDeleteIds];
        setConfirmOpen(false);

        let success = 0;
        for (const id of ids) {
            try {
                // Optimistic remove
                setList((prev) => prev.filter((d) => d.id !== id));
                await new Promise((res, rej) =>
                    router.delete(`/broker/partners/delete/${id}`, {
                        onSuccess: res,
                        onError: rej,
                        preserveScroll: true,
                    })
                );
                success++;
            } catch {
                router.reload({ only: ["developers"] });
            }
        }

        if (success === ids.length) {
            toast.success(ids.length === 1 ? "Partner deleted successfully" : `${ids.length} partners deleted`);
        } else {
            toast.error("Some deletions failed. List has been refreshed.");
        }

        setSelectedIds(new Set());
        setSelectMode(false);
        setPendingDeleteIds([]);
    };

    const handleClose = () => {
        setSelectedDeveloper(null);
        setModalOpen(false);
        router.reload({ only: ["developers"] });
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllOnPage = () => {
        const idsOnPage = paged.map((d) => d.id);
        const allSelected = idsOnPage.every((id) => selectedIds.has(id));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) idsOnPage.forEach((id) => next.delete(id));
            else idsOnPage.forEach((id) => next.add(id));
            return next;
        });
    };

    const Stat = ({ label, value }) => (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );

    return (
        <BrokerLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Developer Partners</h1>
                    <p className="text-sm text-gray-600">
                        Manage your partner developers & quick access to their profiles.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {!selectMode ? (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-accent transition shadow-sm"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add Partner
                        </motion.button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedIds.size === 0}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition ${
                                    selectedIds.size === 0
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
                                        : "bg-rose-600 text-white hover:bg-rose-700"
                                }`}
                                title={selectedIds.size ? `Delete ${selectedIds.size} selected` : "Select items to delete"}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => {
                                    setSelectMode(false);
                                    setSelectedIds(new Set());
                                }}
                                className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Stat label="Total partners" value={list.length} />
                <Stat label="With logo" value={list.filter((d) => !!d?.company_logo).length} />
                <Stat
                    label="Recently added (30d)"
                    value={list.filter((d) => Date.now() - new Date(d?.created_at || 0).getTime() < 30 * 24 * 3600 * 1000).length}
                />
                <Stat label="Showing" value={`${paged.length}/${total}`} />
            </div>

            {/* Toolbar */}
            <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search partners by name, email, address..."
                            className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Sort</label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="h-10 rounded-md border border-gray-300 text-sm px-2 bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="name-asc">Name (A–Z)</option>
                            <option value="name-desc">Name (Z–A)</option>
                            <option value="created-desc">Recently Added</option>
                            <option value="created-asc">Oldest First</option>
                        </select>
                    </div>

                    {/* Per page */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Per page</label>
                        <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            className="h-10 rounded-md border border-gray-300 text-sm px-2 bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>

                    {/* View toggle */}
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setView("grid")}
                            className={`inline-flex items-center gap-2 px-3 h-10 rounded-md border transition ${
                                view === "grid" ? "bg-primary text-white" : "bg-white hover:bg-gray-50"
                            }`}
                            title="Grid view"
                        >
                            <FontAwesomeIcon icon={faBorderAll} />
                            Grid
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`inline-flex items-center gap-2 px-3 h-10 rounded-md border transition ${
                                view === "list" ? "bg-primary text-white" : "bg-white hover:bg-gray-50"
                            }`}
                            title="List view"
                        >
                            <FontAwesomeIcon icon={faList} />
                            List
                        </button>
                        <div className="w-px h-6 bg-gray-200" />
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 focus:ring-primary"
                                checked={selectMode}
                                onChange={(e) => {
                                    setSelectMode(e.target.checked);
                                    if (!e.target.checked) setSelectedIds(new Set());
                                }}
                            />
                            Select
                        </label>
                    </div>
                </div>
            </div>

            {/* Content */}
            {total === 0 ? (
                <div className="flex justify-center items-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <img src="/images/empty-state.svg" alt="Empty State" className="w-40" />
                        <h2 className="text-lg font-semibold text-gray-900">No Partner Developers</h2>
                        <p className="text-gray-600 text-sm text-center max-w-sm">
                            You don't have any partner developers yet. Add one to get started.
                        </p>
                        <button
                            onClick={handleAdd}
                            className="mt-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition"
                        >
                            + Add Partner
                        </button>
                    </div>
                </div>
            ) : view === "grid" ? (
                <>
                    {selectMode && (
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <button
                                onClick={toggleAllOnPage}
                                className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                            >
                                {paged.every((d) => selectedIds.has(d.id)) ? "Unselect page" : "Select page"}
                            </button>
                            <div className="text-gray-700">
                                Selected: <span className="font-semibold">{selectedIds.size}</span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
                        <div className="grid p-1 md:p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            <AnimatePresence>
                                {paged.map((developer) => (
                                    <motion.div
                                        key={developer.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="relative"
                                    >
                                        {selectMode && (
                                            <label className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded shadow text-xs flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 focus:ring-primary"
                                                    checked={selectedIds.has(developer.id)}
                                                    onChange={() => toggleSelect(developer.id)}
                                                />
                                                Select
                                            </label>
                                        )}

                                        <DeveloperCard
                                            developer={developer}
                                            onEdit={() => handleEdit(developer)}
                                            onDelete={() => handleDeleteOne(developer.id)}
                                            onView={() => router.visit(`/broker/partners/${developer.id}`)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </>
            ) : (
                // LIST VIEW (compact rows)
                <div className="overflow-y-auto max-h-[calc(100vh-260px)] bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 text-gray-700">
                        <tr>
                            {selectMode && <th className="p-3 w-12">Sel</th>}
                            <th className="p-3 text-left">Developer</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Address</th>
                            <th className="p-3 text-left">Created</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed">
                        {paged.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                                {selectMode && (
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 focus:ring-primary"
                                            checked={selectedIds.has(d.id)}
                                            onChange={() => toggleSelect(d.id)}
                                        />
                                    </td>
                                )}
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={d?.company_logo ? `/storage/${d.company_logo}` : "/images/placeholder.jpg"}
                                            alt={d?.name || "Developer"}
                                            className="w-10 h-10 rounded object-cover ring-1 ring-gray-200"
                                            onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                                        />
                                        <button
                                            onClick={() => router.visit(`/broker/partners/${d.id}`)}
                                            className="text-primary font-medium hover:underline"
                                            title="View profile"
                                        >
                                            {d?.name || "Untitled"}
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-700">{d?.email || "—"}</td>
                                <td className="p-3 text-gray-700">{d?.address || "—"}</td>
                                <td className="p-3 text-gray-600">
                                    {d?.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(d)}
                                            className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOne(d.id)}
                                            className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => router.visit(`/broker/partners/${d.id}`)}
                                            className="px-3 py-1 rounded-md bg-primary text-white hover:bg-accent"
                                        >
                                            View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paged.length === 0 && (
                            <tr>
                                <td className="p-6 text-center text-gray-500" colSpan={selectMode ? 6 : 5}>
                                    No results for your filters.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md border ${
                            currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
                        }`}
                        aria-label="Previous"
                    >
                        Prev
                    </button>
                    <div className="text-sm text-gray-700">
                        Page <span className="font-semibold">{currentPage}</span> of{" "}
                        <span className="font-semibold">{totalPages}</span>
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md border ${
                            currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
                        }`}
                        aria-label="Next"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <AddPartner show={modalOpen} onClose={handleClose} initialValue={selectedDeveloper} />

            <ConfirmDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                title={pendingDeleteIds.length > 1 ? "Delete Partners" : "Delete Partner"}
                description={
                    pendingDeleteIds.length > 1
                        ? `Are you sure you want to delete ${pendingDeleteIds.length} partners? This action cannot be undone.`
                        : "Are you sure you want to delete this partner? This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
            />
        </BrokerLayout>
    );
}
