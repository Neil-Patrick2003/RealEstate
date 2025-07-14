import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import AgentPropertyListingFilterTab from "@/Components/tabs/AgentPropertyListingFIlterTab.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faPen, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {Link, useForm} from "@inertiajs/react";
import React, {useState} from "react";

import AddAgentModal from "@/Components/modal/Broker/AddAgentModal.jsx";
import EditAgentModal from "@/Components/modal/Broker/EditAgentModal.jsx";




export  default function Index({agents}) {

    const[openAddAgent, setOpenAddAgent]  = useState(false);
    const[openEditAgent, setOpenEditAgent]  = useState(false);

    const imageUrl = '/storage/';
    const[ selectedAgent, setSelectedAgent] = useState(null);





    return (
        <BrokerLayout>
            <AddAgentModal openAddAgent={openAddAgent} setOpenAddAgent={setOpenAddAgent}  />
            <EditAgentModal openEditAgent={openEditAgent} agent={selectedAgent} setOpenEditAgent={setOpenEditAgent} />
            <div className="px-2 py-2   ">
                <h1 className="text-2xl flex font-bold mb-4 justify-between">
                    My Handle Agents
                    <span>
                        <button onClick={() => setOpenAddAgent(true)}>Add Agent</button>
                    </span>
                </h1>
                <p className="text-gray-700 mb-6 text-sm  md:text-medium font-sans">
                    This is the agent dashboard page where you can view and manage the property listings you handle for sellers. Keep track of active, pending, or sold properties easily from here.
                </p>
                <div className='border border-gray-100 rounded-xl'>
                    <div className="rounded-t-xl shadow-sm">


                        {/* Filter Row */}
                        <div className='p-6 flex flex-wrap md:flex-row gap-4 relative z-30'>
                            {/* Search Input */}
                            <div className="relative w-full md:w-1/4">
                                <input
                                    // value={searchTerm}
                                    // onChange={(e) => handleSearchTermChange(e.target.value)}
                                    type="text"
                                    name="search"
                                    placeholder="Search..."
                                    className="border border-gray-300 rounded-md h-10 px-4 pl-10 text-sm text-gray-800 w-full"
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            </div>

                            {/* Property Type Select */}
                            <select
                                id={'type'}
                                className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto'
                                // value={}
                                // onChange={}
                            >
                                <option value=''>Property Type</option>
                                <option value='house'>House</option>
                                <option value='apartment'>Apartment</option>
                                <option value='condo'>Condo</option>
                                {/* Add more options as needed */}
                            </select>

                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto h-[45vh] bg-white scrollbar-thumb-gray-300 scrollbar-track-transparent   [overflow:scroll]">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                            <tr>
                                <th className="p-3 text-center">
                                    <input id='deleteAll' type="checkbox" className="rounded border-gray-400" />
                                </th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Address</th>
                                <th className="p-3">Phone Number</th>
                                <th className="p-3">Email Address</th>
                                <th className="p-3">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {agents?.data.length > 0 ? (
                                agents.data.map((agent) => {

                                    return (
                                        <tr key={agent.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                            <td className="p-3 text-center hidden md:table-cell">
                                                <input id={agent.id} type="checkbox" className="rounded border-gray-400" />
                                            </td>
                                            <td className="p-3 md:table-cell">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        alt={agent.name}
                                                        src={`/storage/${agent.photo_url}`}
                                                        className='w-16 h-16 rounded-full'
                                                    />
                                                    {agent.name}
                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                <p className="flex flex-col cursor-pointer font-bold hover:underline text-primary">
                                                    {agent.address}
                                                    </p>
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {agent.contact_number}
                                            </td>
                                            <td className="p-3 whitespace-nowrap md:table-cell">
                                                {agent.email}
                                            </td>
                                            <td className="p-3 whitespace-nowrap border md:table-cell">
                                                <button onClick={() => {
                                                    setSelectedAgent(agent);
                                                    setOpenEditAgent(true);
                                                }}
                                                        className='bg-primary px-4 py-2 text-sm text-white rounded-md'
                                                >
                                                    <FontAwesomeIcon icon={faPen} className='mr-2' />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className='bg-primary px-4 py-2 text-sm text-white rounded-md'
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    <span>Delete</span>
                                                </button>
                                                <button
                                                    className='bg-primary px-4 py-2 text-sm text-white rounded-md'
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-6 text-gray-400">
                                        No Agents yet.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap gap-2 justify-end p-4 border-dashed border-t ">

                        {agents?.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm rounded-md border transition ${
                                        link.active
                                            ? 'bg-gray-500 text-white font-semibold'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
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

                        <select
                            className='border border-gray-300 rounded-md h-10 text-sm text-gray-800 w-full md:w-auto ml-auto'
                            id={'item_per_page'}
                            // value={selectedItemsPerPage}
                            // onChange={handleItemsPerPageChange}
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
