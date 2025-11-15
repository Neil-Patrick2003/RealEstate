// components/Property/AssignedAgents.jsx
import React from "react"; // Removed useState, useMemo as they are now in AgentCard
import PropTypes from "prop-types";
import AgentCard from "./AgentCard"; // <-- Import the new component
import {
    // Only keep necessary icons if AgentCard is in a separate file
    // Otherwise, you could remove all Lucide imports here
    UserRound,
} from "lucide-react";

// const cn = (...c) => c.filter(Boolean).join(" "); // No longer needed here

export default function AssignedAgents({
                                           setData,
                                           agents = [],
                                           auth = null,
                                           setIsOpenModal = () => {},
                                           setSelectedPerson = () => {},
                                           title = "Property Agents",
                                           emptyFallback = null,
                                       }) {
    const isBuyer = Boolean(auth?.role === "Buyer");
    const list = Array.isArray(agents) ? agents : [];

    // Consolidated Contact Handler
    const handleContactClick = (agent) => {
        if (!isBuyer) return;
        setSelectedPerson(agent);
        setIsOpenModal(true);
        // Ensure setData handles nested props if needed, though this looks fine.
        setData("person", agent.id);
    };

    if (!list.length) return emptyFallback ?? null;

    return (
        <section className="sticky top-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3">
                    <UserRound className="w-6 h-6 inline-block mr-2 text-primary align-text-bottom" />
                    {title}
                </h2>

                <div className="flex flex-col gap-5">
                    {list.map((agent) => (
                        <AgentCard
                            key={agent.id ?? agent.email} // Use a robust key
                            agent={agent}
                            isBuyer={isBuyer}
                            auth={auth}
                            onContactClick={handleContactClick} // Pass the handler
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

AssignedAgents.propTypes = {
    // ... keep PropTypes for validation
    agents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string,
            title: PropTypes.string,
            image: PropTypes.string,
            photo_url: PropTypes.string,
            avatar_url: PropTypes.string,
            contact_number: PropTypes.string,
            phone: PropTypes.string,
            email: PropTypes.string,
            address: PropTypes.string,
        })
    ),
    auth: PropTypes.shape({
        role: PropTypes.string,
        user: PropTypes.object,
    }),
    setData: PropTypes.func.isRequired, // Added isRequired as it's critical
    setIsOpenModal: PropTypes.func,
    setSelectedPerson: PropTypes.func,
    title: PropTypes.string,
    emptyFallback: PropTypes.node,
};

