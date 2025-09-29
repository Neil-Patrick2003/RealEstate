import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

import AddAgentModal from "@/Components/modal/Broker/AddAgentModal.jsx";
import EditAgentModal from "@/Components/modal/Broker/EditAgentModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPen,
    faSearch,
    faTrash,
    faDownload,
    faUserPlus,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// tiny avatar helper
const Avatar = ({ name = "", photo }) => {
    const [err, setErr] = useState(false);
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    const showImg = photo && !err;

    return showImg ? (
        <img
            src={`/storage/${photo}`}
            alt={name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            onError={() => setErr(true)}
        />
    ) : (
        <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white grid place-items-center text-sm font-semibold ring-2 ring-white shadow-sm"
            aria-hidden
        >
            {initial}
        </div>
    );
};

export default function Index({
                                  agents,
                                  search = "",
                                  page = 1,
                                  sort = "asc",
                                  perPage = 10,
                              }) {
    const [openAddAgent, setOpenAddAgent] = useState(false);
    const [openEditAgent, setOpenEditAgent] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [selectedSort, setSelectedSort] = useState(sort);
    const [searchTerm, setSearchTerm] = useState(search);
    const [itemsPerPage, setItemsPerPage] = useState(perPage);

    // selection state
    const [selectedIds, setSelectedIds] = useState(new Set());

    const currentData = agents?.data || [];

    // --- Debounced search ---
    // include sort & perPage in deps so URL stays in sync with UI
    const debouncedSearch = useCallback(
        debounce((value, sort, perPage) => {
            router.get(
                "/broker/agents",
                { page: 1, search: value, sort, perPage },
                { preserveState: true, replace: true }
            );
        }, 450),
        []
    );

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleSearchTermChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value, selectedSort, itemsPerPage);
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
        router.get(
            "/broker/agents",
            { page: 1, search: searchTerm, sort: value, perPage: itemsPerPage },
            { preserveState: true, replace: true }
        );
    };

    const handlePerPageChange = (value) => {
        const v = Number(value) || 10;
        setItemsPerPage(v);
        router.get(
            "/broker/agents",
            { page: 1, search: searchTerm, sort: selectedSort, perPage: v },
            { preserveState: true, replace: true }
        );
    };

    // --- Row actions ---
    const onEdit = (agent) => {
        setSelectedAgent(agent);
        setOpenEditAgent(true);
    };

    const onAskDelete = (id) => {
        setSelectedId(id);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedId(null);
        setOpenDeleteModal(false);
    };

    const handleDelete = () => {
        router.delete(`/broker/agents/${selectedId}/delete`, { onSuccess: closeDelete });
    };

    // --- Selection helpers ---
    const toggleRow = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allIdsOnPage = useMemo(() => currentData.map((a) => a.id), [currentData]);

    const isAllSelected = useMemo(
        () => allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.has(id)),
        [allIdsOnPage, selectedIds]
    );

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (isAllSelected) {
                allIdsOnPage.forEach((id) => next.delete(id));
            } else {
                allIdsOnPage.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    // --- Multi actions (email / export) ---
    const selectedAgents = useMemo(
        () => currentData.filter((a) => selectedIds.has(a.id)),
        [currentData, selectedIds]
    );

    const mailtoSelected = () => {
        const emails = selectedAgents.map((a) => a.email).filter(Boolean);
        if (!emails.length) return;
        window.location.href = `mailto:${emails.join(",")}`;
    };

    const exportSelectedCSV = () => {
        const rows = (selectedAgents.length ? selectedAgents : currentData).map((a) => ({
            Name: a.name ?? "",
            Email: a.email ?? "",
            Phone: a.contact_number ?? "",
            Address: a.address ?? "",
            Assigned: a.assigned_listings_count ?? 0,
            Published: a.published_listings_count ?? 0,
            Sold: a.sold_listings_count ?? 0,
        }));

        if (!rows.length) return;

        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(","),
            ...rows.map((r) =>
                headers
                    .map((h) => {
                        const cell = `${r[h] ?? ""}`.replace(/"/g, '""');
                        return /[",\n]/.test(cell) ? `"${cell}"` : cell;
                    })
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "agents.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- Totals (for mini KPI) ---
    const totals = useMemo(() => {
        return currentData.reduce(
            (acc, a) => {
                acc.assigned += a.assigned_listings_count ?? 0;
                acc.published += a.published_listings_count ?? 0;
                acc.sold += a.sold_listings_count ?? 0;
                return acc;
            },
            { assigned: 0, published: 0, sold: 0 }
        );
    }, [currentData]);

    return (
        <BrokerLayout>
            {/* Modals */}
            <ConfirmDialog
                open={openDeleteModal}
                onConfirm={handleDelete}
                setOpen={setOpenDeleteModal}
                title="Delete Agent Account"
                description="Are you sure you want to delete this agent? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
            <AddAgentModal openAddAgent={openAddAgent} setOpenAddAgent={setOpenAddAgent} />
            <EditAgentModal openEditAgent={openEditAgent} agent={selectedAgent} setOpenEditAgent={setOpenEditAgent} />

            {/* Header */}
            <div className="px-2 py-2">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl text-primary font-bold">My Handle Agents</h1>
                    <button
                        onClick={() => setOpenAddAgent(true)}
                        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-primary/90"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Add Agent
                    </button>
                </div>
                <p className="text-gray-700 mb-4 text-sm md:text-base">
                    View and manage the agents who handle property listings for sellers.
                </p>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Assigned Listings</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totals.assigned.toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12  rounded-full flex items-center justify-center`}>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Published</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totals.published.toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12  rounded-full flex items-center justify-center`}>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Sold</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totals.sold.toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12  rounded-full flex items-center justify-center`}>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="rounded-xl border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="relative w-full md:max-w-xs">
                            <input
                                id="search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchTermChange(e.target.value)}
                                placeholder="Search agents..."
                                className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={exportSelectedCSV}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
                                title="Export current / selected as CSV"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                Export CSV
                            </button>

                            <select
                                value={selectedSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 bg-white px-3"
                                aria-label="Sort order"
                            >
                                <option value="asc">A → Z</option>
                                <option value="desc">Z → A</option>
                            </select>

                            <select
                                value={itemsPerPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 bg-white px-3"
                                aria-label="Items per page"
                            >
                                <option value="5">5 / page</option>
                                <option value="10">10 / page</option>
                                <option value="20">20 / page</option>
                                <option value="50">50 / page</option>
                            </select>
                        </div>
                    </div>

                    {/* Multi-select action bar (appears when you select rows) */}
                    {selectedIds.size > 0 && (
                        <div className="px-4 md:px-6 py-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
                            <p className="text-sm text-emerald-800">
                                {selectedIds.size} selected
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={mailtoSelected}
                                    className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="Email selected agents"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                    Email selected
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-auto max-h-[56vh] bg-white">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Address</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Assigned</th>
                                <th className="p-3">Published</th>
                                <th className="p-3">Sold</th>
                                <th className="p-3">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {currentData.length ? (
                                currentData.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(agent.id)}
                                                onChange={() => toggleRow(agent.id)}
                                                aria-label={`Select ${agent.name}`}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={agent.name} photo={agent.photo_url} />
                                                <span className="font-medium">{agent.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">{agent.address || "—"}</td>
                                        <td className="p-3">{agent.contact_number || "—"}</td>
                                        <td className="p-3">{agent.email || "—"}</td>
                                        <td className="p-3">{agent.assigned_listings_count ?? 0}</td>
                                        <td className="p-3">{agent.published_listings_count ?? 0}</td>
                                        <td className="p-3">{agent.sold_listings_count ?? 0}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => onEdit(agent)}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="Edit agent"
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button
                                                    onClick={() => onAskDelete(agent.id)}
                                                    className="text-gray-600 hover:text-red-600"
                                                    title="Delete agent"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-10 text-gray-400">
                                        No agents found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card list */}
                    <div className="md:hidden divide-y">
                        {currentData.length ? (
                            currentData.map((agent) => (
                                <div key={agent.id} className="p-4 bg-white">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(agent.id)}
                                            onChange={() => toggleRow(agent.id)}
                                            aria-label={`Select ${agent.name}`}
                                        />
                                        <Avatar name={agent.name} photo={agent.photo_url} />
                                        <div className="flex-1">
                                            <p className="font-semibold">{agent.name}</p>
                                            <p className="text-xs text-gray-500">{agent.email || "—"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => onEdit(agent)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="Edit"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                onClick={() => onAskDelete(agent.id)}
                                                className="text-gray-600 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                        <div className="p-2 bg-gray-50 rounded">
                                            <p className="text-gray-500">Assigned</p>
                                            <p className="font-semibold">
                                                {agent.assigned_listings_count ?? 0}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <p className="text-gray-500">Published</p>
                                            <p className="font-semibold">
                                                {agent.published_listings_count ?? 0}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <p className="text-gray-500">Sold</p>
                                            <p className="font-semibold">
                                                {agent.sold_listings_count ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-xs text-gray-600">
                                        <p>{agent.address || "—"}</p>
                                        <p>{agent.contact_number || "—"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">No agents found.</div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t">
                        {/* Previous/Next shortcuts if your backend returns prev/next URLs in links */}
                        <div className="flex items-center gap-2">
                            {agents?.prev_page_url ? (
                                <Link
                                    href={agents.prev_page_url}
                                    className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
                                    aria-label="Previous page"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </Link>
                            ) : (
                                <span className="px-3 py-2 text-sm rounded-md border bg-white text-gray-300">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </span>
                            )}

                            <div className="flex gap-2">
                                {agents?.links?.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-2 text-sm rounded-md border transition ${
                                                link.active
                                                    ? "bg-primary text-white font-semibold"
                                                    : "bg-white text-gray-600 hover:bg-gray-100"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-3 py-2 text-sm text-slate-400 bg-white border rounded-md cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                )}
                            </div>

                            {agents?.next_page_url ? (
                                <Link
                                    href={agents.next_page_url}
                                    className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
                                    aria-label="Next page"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </Link>
                            ) : (
                                <span className="px-3 py-2 text-sm rounded-md border bg-white text-gray-300">
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BrokerLayout>
    );
}
