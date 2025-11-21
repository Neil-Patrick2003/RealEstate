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
    faUsers,
    faHome,
    faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import StatsCard from "@/Components/ui/StatsCard.jsx";

// Avatar helper
const Avatar = ({ name = "", photo }) => {
    const [err, setErr] = useState(false);
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    const showImg = photo && !err;

    return showImg ? (
        <img
            src={`/storage/${photo}`}
            alt={name}
            className="avatar-md rounded-full object-cover border-2 border-white shadow-sm"
            onError={() => setErr(true)}
        />
    ) : (
        <div
            className="avatar-md rounded-full bg-gradient-to-br from-primary-600 to-emerald-500 text-white font-semibold border-2 border-white shadow-sm"
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
            Rating: a.rating ?? "",
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
        <AuthenticatedLayout>
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
            <EditAgentModal
                openEditAgent={openEditAgent}
                agent={selectedAgent}
                setOpenEditAgent={setOpenEditAgent}
            />

            <div className="page-container">
                <div className="page-content space-y-6">
                    {/* Header */}
                    <div className="section">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 gradient-text">Agent Management</h1>
                                <p className="section-description">
                                    View and manage the agents who handle property listings for sellers.
                                </p>
                            </div>
                            <button
                                onClick={() => setOpenAddAgent(true)}
                                className="btn btn-primary btn-sm"
                            >
                                <FontAwesomeIcon icon={faUserPlus} />
                                Add Agent
                            </button>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatsCard title="Total Agents" value={agents?.total ?? 0} />
                        <StatsCard title="Total Assigned Listings" value={totals.assigned} />
                        <StatsCard title="Total Published Listings" value={totals.published} />
                        <StatsCard title="Total Sold Listings" value={totals.sold} />

                    </div>

                    {/* Toolbar Card */}
                    <div className="card">
                        <div className="card-body">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchTermChange(e.target.value)}
                                        placeholder="Search agents by name, email, or phone..."
                                        className="form-input pl-10"
                                    />
                                </div>

                                <div className="flex items-center gap-3">

                                    <select
                                        value={selectedSort}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="form-select text-sm"
                                        aria-label="Sort order"
                                    >
                                        <option value="asc">A → Z</option>
                                        <option value="desc">Z → A</option>
                                    </select>

                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => handlePerPageChange(e.target.value)}
                                        className="form-select text-sm"
                                        aria-label="Items per page"
                                    >
                                        <option value="5">5 / page</option>
                                        <option value="10">10 / page</option>
                                        <option value="20">20 / page</option>
                                        <option value="50">50 / page</option>
                                    </select>
                                </div>
                            </div>

                            {/* Multi-select action bar */}
                            {selectedIds.size > 0 && (
                                <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                                    <p className="text-sm text-primary-800 font-medium">
                                        {selectedIds.size} agent{selectedIds.size !== 1 ? 's' : ''} selected
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={mailtoSelected}
                                            className="btn btn-primary btn-sm"
                                            title="Email selected agents"
                                        >
                                            <FontAwesomeIcon icon={faEnvelope} />
                                            Email Selected
                                        </button>
                                        <button
                                            onClick={clearSelection}
                                            className="btn btn-outline btn-sm"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 text-center w-12">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={toggleAll}
                                            className="form-checkbox"
                                            aria-label="Select all"
                                        />
                                    </th>
                                    <th className="p-4 font-semibold">Agent</th>
                                    <th className="p-4 font-semibold">Contact</th>
                                    <th className="p-4 font-semibold">Address</th>
                                    <th className="p-4 font-semibold text-center">Rating</th>
                                    <th className="p-4 font-semibold text-center">Assigned</th>
                                    <th className="p-4 font-semibold text-center">Published</th>
                                    <th className="p-4 font-semibold text-center">Sold</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {currentData.length ? (
                                    currentData.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(agent.id)}
                                                    onChange={() => toggleRow(agent.id)}
                                                    className="form-checkbox"
                                                    aria-label={`Select ${agent.name}`}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={agent.name} photo={agent.photo_url} />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{agent.name}</p>
                                                        <p className="text-xs text-gray-500">{agent.email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <p className="text-gray-900">{agent.email || "—"}</p>
                                                    <p className="text-xs text-gray-500">{agent.contact_number || "—"}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-gray-700 max-w-xs truncate">{agent.address || "—"}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="badge badge-primary">
                                                    {agent.rating || "—"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-semibold text-gray-900">
                                                    {agent.assigned_listings_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-semibold text-green-600">
                                                    {agent.published_listings_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-semibold text-blue-600">
                                                    {agent.sold_listings_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => onEdit(agent)}
                                                        className="btn btn-ghost btn-sm p-2 text-primary-600 hover:bg-primary-50"
                                                        title="Edit agent"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button
                                                        onClick={() => onAskDelete(agent.id)}
                                                        className="btn btn-ghost btn-sm p-2 text-red-600 hover:bg-red-50"
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
                                        <td colSpan={9} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300" />
                                                <p className="text-lg font-medium text-gray-400">No agents found</p>
                                                <p className="text-sm text-gray-500">
                                                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first agent"}
                                                </p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => setOpenAddAgent(true)}
                                                        className="btn btn-primary btn-sm mt-2"
                                                    >
                                                        <FontAwesomeIcon icon={faUserPlus} />
                                                        Add First Agent
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {currentData.length ? (
                                currentData.map((agent) => (
                                    <div key={agent.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(agent.id)}
                                                onChange={() => toggleRow(agent.id)}
                                                className="form-checkbox mt-4"
                                                aria-label={`Select ${agent.name}`}
                                            />
                                            <Avatar name={agent.name} photo={agent.photo_url} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{agent.name}</p>
                                                        <p className="text-sm text-gray-500">{agent.email || "—"}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => onEdit(agent)}
                                                            className="btn btn-ghost btn-sm p-1 text-primary-600"
                                                            title="Edit"
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </button>
                                                        <button
                                                            onClick={() => onAskDelete(agent.id)}
                                                            className="btn btn-ghost btn-sm p-1 text-red-600"
                                                            title="Delete"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-3 gap-2">
                                                    <div className="gray-card text-center p-2">
                                                        <p className="text-xs text-gray-500">Assigned</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {agent.assigned_listings_count ?? 0}
                                                        </p>
                                                    </div>
                                                    <div className="gray-card text-center p-2">
                                                        <p className="text-xs text-gray-500">Published</p>
                                                        <p className="font-semibold text-green-600">
                                                            {agent.published_listings_count ?? 0}
                                                        </p>
                                                    </div>
                                                    <div className="gray-card text-center p-2">
                                                        <p className="text-xs text-gray-500">Sold</p>
                                                        <p className="font-semibold text-blue-600">
                                                            {agent.sold_listings_count ?? 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                    {agent.contact_number && (
                                                        <p>📞 {agent.contact_number}</p>
                                                    )}
                                                    {agent.address && (
                                                        <p className="truncate">📍 {agent.address}</p>
                                                    )}
                                                    {agent.rating && (
                                                        <p>⭐ Rating: {agent.rating}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <FontAwesomeIcon icon={faUsers} className="text-3xl text-gray-300 mb-2" />
                                    <p>No agents found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {agents?.links && agents.links.length > 1 && (
                            <div className="card-footer">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <p className="text-sm text-gray-600">
                                        Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, agents.total)} of {agents.total} agents
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {agents?.prev_page_url ? (
                                            <Link
                                                href={agents.prev_page_url}
                                                className="btn btn-outline btn-sm p-2"
                                                aria-label="Previous page"
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </Link>
                                        ) : (
                                            <span className="btn btn-outline btn-sm p-2 opacity-50 cursor-not-allowed">
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </span>
                                        )}

                                        <div className="flex gap-1">
                                            {agents?.links?.map((link, index) =>
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`btn btn-sm ${
                                                            link.active ? 'btn-primary' : 'btn-outline'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="btn btn-outline btn-sm opacity-50 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            )}
                                        </div>

                                        {agents?.next_page_url ? (
                                            <Link
                                                href={agents.next_page_url}
                                                className="btn btn-outline btn-sm p-2"
                                                aria-label="Next page"
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </Link>
                                        ) : (
                                            <span className="btn btn-outline btn-sm p-2 opacity-50 cursor-not-allowed">
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
