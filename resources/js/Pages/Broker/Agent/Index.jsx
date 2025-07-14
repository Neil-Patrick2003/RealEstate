import React, { useState } from "react";
import {Link, router} from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";

import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import AddAgentModal from "@/Components/modal/Broker/AddAgentModal.jsx";
import EditAgentModal from "@/Components/modal/Broker/EditAgentModal.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

export default function Index({ agents }) {
    const [openAddAgent, setOpenAddAgent] = useState(false);
    const [openEditAgent, setOpenEditAgent] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleEditClick = (agent) => {
        setSelectedAgent(agent);
        setOpenEditAgent(true);
    };

    const closeDelete = () => {
        setSelectedId(null);
        setOpenDeleteModal(false);


    }

    const handleDelete = () => {
        router.delete(`/broker/agents/${selectedId}/delete`, {
            onSuccess: closeDelete
        });
    }


    return (
        <BrokerLayout>
            {/* Modals */}
            <ConfirmDialog open={openDeleteModal} onConfirm={handleDelete} setOpen={setOpenDeleteModal} title={'Delete Agent Account'} description={" Are you sure you want to delete it? this action can't be undone"}  confirmText={'Delete'} cancelText={'Cancel'} />
            <AddAgentModal openAddAgent={openAddAgent} setOpenAddAgent={setOpenAddAgent} />
            <EditAgentModal openEditAgent={openEditAgent} agent={selectedAgent} setOpenEditAgent={setOpenEditAgent} />

            {/* Header */}
            <div className="px-2 py-2">
                <h1 className="text-2xl font-bold mb-4 flex justify-between">
                    My Handle Agents
                    <button onClick={() => setOpenAddAgent(true)} className="bg-primary text-white px-4 py-2 rounded-md">
                        Add Agent
                    </button>
                </h1>
                <p className="text-gray-700 mb-6 text-sm md:text-base font-sans">
                    View and manage the agents who handle property listings for sellers.
                </p>

                {/* Filter Section */}
                <div className="border border-gray-100 rounded-xl">
                    <div className="rounded-t-xl shadow-sm">
                        <div className="p-6 flex flex-wrap md:flex-row gap-4 relative z-30">
                            <div className="relative w-full md:w-1/4">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search..."
                                    className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            </div>

                            <select
                                id="type"
                                className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto"
                            >
                                <option value="">Property Type</option>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="condo">Condo</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto h-[45vh] bg-white scrollbar-thumb-gray-300 scrollbar-track-transparent overflow-scroll">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                            <tr>
                                <th className="p-3 text-center">
                                    <input type="checkbox" id={'all'} className="rounded border-gray-400" />
                                </th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Address</th>
                                <th className="p-3">Phone Number</th>
                                <th className="p-3">Email Address</th>
                                <th className="p-3">Publish Property</th>
                                <th className="p-3">Assigned Property</th>
                                <th className="p-3">Sold Property</th>
                                <th className="p-3">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {agents?.data.length > 0 ? (
                                agents.data.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                        <td className="p-3 text-center hidden md:table-cell">
                                            <input type="checkbox" id={agent.id} className="rounded border-gray-400" />
                                        </td>
                                        <td className="p-3 md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    alt={agent.name}
                                                    src={`/storage/${agent.photo_url}`}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                                {agent.name}
                                            </div>
                                        </td>
                                        <td className="p-3 md:table-cell whitespace-nowrap">
                                            <p className="font-bold text-primary cursor-pointer hover:underline">
                                                {agent.address}
                                            </p>
                                        </td>
                                        <td className="p-3 md:table-cell whitespace-nowrap">
                                            {agent.contact_number}
                                        </td>
                                        <td className="p-3 md:table-cell whitespace-nowrap">
                                            {agent.email}
                                        </td><td className="p-3 md:table-cell whitespace-nowrap">
                                            {agent.assigned_listings_count}
                                        </td><td className="p-3 md:table-cell whitespace-nowrap">
                                            {agent.published_listings_count}
                                        </td><td className="p-3 md:table-cell whitespace-nowrap">
                                            {agent.sold_listings_count}
                                        </td>
                                        <td className="p-3 md:table-cell whitespace-nowrap flex gap-2">
                                            <button className=" px-4 py-2 text-gray rounded-r-md  text-md"
                                                onClick={() => handleEditClick(agent)}
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button className=" px-4 py-2 text-gray rounded-r-md  text-md"
                                                onClick={() => {setOpenDeleteModal(true); setSelectedId(agent.id); }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            {/*<Link href={`/broker/agents/${agent.id}`}>*/}
                                            {/*    <button className=" px-4 py-2 text-gray rounded-r-md  text-md   ">*/}
                                            {/*        <FontAwesomeIcon icon={faEye} />*/}
                                            {/*    </button>*/}
                                            {/*</Link>*/}

                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                        No Agents yet.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap gap-2 justify-between p-4 border-t">
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

                        <select
                            id="item_per_page"
                            className="border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                </div>
            </div>
        </BrokerLayout>
    );
}
