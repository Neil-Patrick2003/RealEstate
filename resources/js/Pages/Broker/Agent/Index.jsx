import React, { useEffect, useState, useCallback } from "react";
import { Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";

import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import AddAgentModal from "@/Components/modal/Broker/AddAgentModal.jsx";
import EditAgentModal from "@/Components/modal/Broker/EditAgentModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import { debounce } from "lodash";

export default function Index({ agents, search = '', page = 1, sort = 'asc', perPage = 10 }) {
    const [openAddAgent, setOpenAddAgent] = useState(false);
    const [openEditAgent, setOpenEditAgent] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedSort, setSelectedSort] = useState(sort);
    const [searchTerm, setSearchTerm] = useState(search);
    const [itemsPerPage, setItemsPerPage] = useState(perPage);

    const handleEditClick = (agent) => {
        setSelectedAgent(agent);
        setOpenEditAgent(true);
    };

    const closeDelete = () => {
        setSelectedId(null);
        setOpenDeleteModal(false);
    };

    const handleDelete = () => {
        router.delete(`/broker/agents/${selectedId}/delete`, {
            onSuccess: closeDelete,
        });
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get('/broker/agents', {
                page: 1,
                search: value,
                sort: selectedSort,
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
            sort: value,
            perPage: itemsPerPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (value) => {
        setItemsPerPage(value);
        router.get('/broker/agents', {
            page: 1,
            search: searchTerm,
            sort: selectedSort,
            perPage: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <BrokerLayout>
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

            <div className="px-2 py-2">
                <h1 className="text-2xl font-bold mb-2 flex justify-between">
                    My Handle Agents
                    <button onClick={() => setOpenAddAgent(true)} className="bg-primary text-white px-4 py-2 text-sm rounded-md">
                        Add Agent
                    </button>
                </h1>
                <p className="text-gray-700 mb-4 text-sm md:text-base font-sans">
                    View and manage the agents who handle property listings for sellers.
                </p>

                <div className="border border-gray-100 rounded-xl">
                    <div className="p-6 flex flex-wrap md:flex-row gap-4">
                        <div className="relative w-full md:w-1/4">
                            <input
                                id='search'
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchTermChange(e.target.value)}
                                placeholder="Search..."
                                className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>

                        <select
                            id='sort'
                            value={selectedSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>

                        <select
                            id='page_item'

                            value={itemsPerPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>

                    <div className="overflow-auto h-[56vh] bg-white relative">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide table-header-group">
                            <tr className="sticky top-0 z-10 bg-gray-100 shadow-sm">
                                <th className="p-3 text-center">
                                    <input type="checkbox" id={'all'} />
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
                            {agents?.data.length > 0 ? (
                                agents.data.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50 md:table-row flex flex-col w-full md:w-auto">
                                        <td className="p-3 text-center hidden md:table-cell"><input id={agent.id} type="checkbox" /></td>
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`/storage/${agent.photo_url}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                    alt={agent.name}
                                                />
                                                <span>{agent.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 md:table-cell">{agent.address}</td>
                                        <td className="p-3 md:table-cell">{agent.contact_number}</td>
                                        <td className="p-3 md:table-cell">{agent.email}</td>
                                        <td className="p-3 md:table-cell">{agent.assigned_listings_count}</td>
                                        <td className="p-3 md:table-cell">{agent.published_listings_count}</td>
                                        <td className="p-3 md:table-cell">{agent.sold_listings_count}</td>
                                        <td className="p-3 md:table-cell flex gap-2">
                                            <button onClick={() => handleEditClick(agent)} className="text-gray-600">
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button onClick={() => {
                                                setOpenDeleteModal(true);
                                                setSelectedId(agent.id);
                                            }} className="text-gray-600 ml-6">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-6 text-gray-400">No Agents yet.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center items-center p-4 border-t">
                        <div className="flex gap-2">
                            {agents?.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm rounded-md border transition ${
                                            link.active
                                                ? "bg-gray-500 text-white font-semibold"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
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
                </div>
            </div>
        </BrokerLayout>
    );
}
