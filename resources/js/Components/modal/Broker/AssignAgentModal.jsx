import { useForm } from "@inertiajs/react";
import { useEffect } from 'react';
import Modal from "@/Components/Modal.jsx";
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function AssignAgentModal({
                                             openAssignAgentModal,
                                             setOpenAssignAgentModal,
                                             agents = [],
                                             selectedPropertyId
                                         }) {
    const { data, setData, post, processing, reset } = useForm({
        agent_ids: []
    });

    const handleCheckboxChange = (agentId) => {
        const newAgentIds = data.agent_ids.includes(agentId)
            ? data.agent_ids.filter(id => id !== agentId)
            : [...data.agent_ids, agentId];

        setData('agent_ids', newAgentIds);
    };

    const handleSubmit = () => {
        post(`/broker/properties/${selectedPropertyId}/assign-agents`, {
            onStart: () => {
                console.log("Submitting agent_ids:", data.agent_ids);
            },
            onSuccess: () => {
                setOpenAssignAgentModal(false);
                reset();
            }
        });
    };

    const handleClose = () => {
        setOpenAssignAgentModal(false);
        reset();
    };

    const getInitial = (name) => {
        return name?.charAt(0).toUpperCase();
    };

    // Optional: Reset agent_ids when modal opens/closes
    useEffect(() => {
        if (!openAssignAgentModal) {
            reset();
        }
    }, [openAssignAgentModal]);

    return (
        <Modal
            show={openAssignAgentModal}
            onClose={handleClose}
            maxWidth="2xl"
            className="bg-white p-4 rounded-md shadow-md"
        >
            <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Assign Agent</h2>

                <div className="mb-4">
                    <p className="block text-sm font-medium text-gray-700 mb-2">Select Agents</p>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {agents.map(agent => (
                            <label
                                key={agent.id}
                                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                            >
                                <div className="flex items-center space-x-3">
                                    {agent.image_url ? (
                                        <img
                                            src={agent.image_url}
                                            alt={agent.name}
                                            className="w-10 h-10 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                            {getInitial(agent.name)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{agent.name}</p>
                                        <p className="text-xs text-gray-500">{agent.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={agent.id}
                                        checked={data.agent_ids.includes(agent.id)}
                                        onChange={() => handleCheckboxChange(agent.id)}
                                        className="hidden"
                                    />
                                    <span className="text-xs text-gray-600 flex items-center space-x-1">
                                        <FontAwesomeIcon
                                            icon={data.agent_ids.includes(agent.id) ? faMinus : faPlus}
                                            className="w-3.5 h-3.5"
                                        />
                                        <span className="hidden sm:inline">
                                            {data.agent_ids.includes(agent.id) ? 'Unassign' : 'Assign'}
                                        </span>
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className={`px-4 py-2 text-sm text-white rounded-md ${processing ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                        {processing ? 'Saving...' : 'Save Assignments'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
