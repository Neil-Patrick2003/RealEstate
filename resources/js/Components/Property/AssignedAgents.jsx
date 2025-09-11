import React from "react";

export default function AssignedAgents({agents, auth, setIsOpenModal, setSelectedPerson}) {

    return (
        <div>
            {agents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Agents</h2>
                    <div className="flex flex-col space-y-4">
                        {agents.map((agent, index) => (
                            <div key={agent.id} className="bg-white border rounded-xl shadow-sm p-6 mb-6 sticky top-6">
                                <div className="flex items-center mb-4">
                                    {agent.image ? (
                                        <img
                                            src={agent.image}
                                            alt={`Professional headshot of listing agent ${agent.name}`}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-400 text-white flex items-center justify-center text-xl font-bold">
                                            {agent.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                    )}

                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                                        <p className="text-sm text-gray-500">{agent.title || 'Real Estate Agent'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {agent.contact_number && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-phone-alt text-green-600 mr-2"></i>
                                            <span>{agent.contact_number}</span>
                                        </div>
                                    )}
                                    {agent.email && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-envelope text-green-600 mr-2"></i>
                                            <span>{agent.email}</span>
                                        </div>
                                    )}
                                    {agent.address && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-building text-green-600 mr-2"></i>
                                            <span>{agent.address}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setIsOpenModal(true)
                                        setSelectedPerson(agent)
                                    }}
                                    className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center
                                        ${!auth || auth.role !== 'Buyer'
                                        ? 'bg-primary opacity-75  cursor-not-allowed text-white'
                                        : 'bg-primary hover:bg-green-700 text-white'}`}
                                    title={
                                        !auth
                                            ? 'You must be logged in to contact an agent'
                                            : auth.role !== 'Buyer'
                                                ? 'Only buyers can contact agents'
                                                : 'Contact the agent'
                                    }
                                >
                                    <i className="fas fa-comment-alt mr-2"></i> Contact Agent
                                </button>

                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
