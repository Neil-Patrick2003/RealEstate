import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPhone,
    faEnvelope,
    faBuilding,
    faMessage,
    faCopy,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function AssignedAgents({
                                           agents = [],
                                           auth = null,
                                           setIsOpenModal = () => {},
                                           setSelectedPerson = () => {},
                                           title = "Property Agents",
                                           emptyFallback = null, // optional custom empty state
                                       }) {
    const isBuyer = !!auth && auth.role === "Buyer";
    const list = Array.isArray(agents) ? agents : [];

    const [copiedKey, setCopiedKey] = useState(null);
    const markCopied = (key) => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1200);
    };

    const copyText = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            markCopied(key);
        } catch {/* noop */}
    };

    if (!list.length) {
        return emptyFallback ?? null;
    }

    return (
        <section className="sticky top-6">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

                <div className="flex flex-col gap-4">
                    {list.map((agent, idx) => {
                        const key = agent.id ?? agent.email ?? `${agent.name}-${idx}`;
                        const avatar =
                            agent.image || agent.photo_url || agent.avatar_url
                                ? `/storage/${(agent.image || agent.photo_url || agent.avatar_url).replace(/^\/?storage\//, "")}`
                                : null;

                        const initials = (agent.name?.trim()?.charAt(0) || "A").toUpperCase();
                        const phone = agent.contact_number || agent.phone || "";
                        const email = agent.email || "";

                        const onContactClick = () => {
                            if (!isBuyer) return; // hard block if not buyer
                            setSelectedPerson(agent);
                            setIsOpenModal(true);
                        };

                        return (
                            <article
                                key={key}
                                className="bg-white border rounded-xl ring-1 ring-gray-100 p-5 hover:shadow-md transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt={agent.name ? `Agent ${agent.name}` : "Agent"}
                                                className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200"
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder-avatar.png")}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-secondary text-white flex items-center justify-center text-lg font-semibold">
                                                {initials}
                                            </div>
                                        )}

                                        <div className="ml-4">
                                            <h3 className="text-base font-semibold text-gray-900 leading-tight">
                                                {agent.name || "Agent"}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {agent.title || "Real Estate Agent"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onContactClick}
                                        disabled={!isBuyer}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                                            isBuyer
                                                ? "bg-primary text-white hover:bg-primary/90"
                                                : "bg-primary/70 text-white cursor-not-allowed"
                                        }`}
                                        title={
                                            !auth
                                                ? "You must be logged in to contact an agent"
                                                : !isBuyer
                                                    ? "Only buyers can contact agents"
                                                    : "Contact the agent"
                                        }
                                    >
                                        <FontAwesomeIcon icon={faMessage} />
                                        Contact Agent
                                    </button>
                                </div>

                                {/* Contact rows */}
                                <div className="mt-4 space-y-2 text-sm">
                                    {phone && (
                                        <div className="flex items-center justify-between gap-3">
                                            <a
                                                href={`tel:${phone}`}
                                                className="inline-flex items-center text-gray-700 hover:text-gray-900"
                                                title="Call"
                                            >
                                                <FontAwesomeIcon icon={faPhone} className="text-emerald-600 mr-2" />
                                                <span className="break-all">{phone}</span>
                                            </a>
                                            <button
                                                onClick={() => copyText(phone, `phone-${key}`)}
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Copy phone"
                                                aria-label="Copy phone"
                                            >
                                                <FontAwesomeIcon icon={copiedKey === `phone-${key}` ? faCheck : faCopy} />
                                            </button>
                                        </div>
                                    )}

                                    {email && (
                                        <div className="flex items-center justify-between gap-3">
                                            <a
                                                href={`mailto:${email}?subject=${encodeURIComponent("Property Inquiry")}`}
                                                className="inline-flex items-center text-gray-700 hover:text-gray-900"
                                                title="Email"
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 mr-2" />
                                                <span className="break-all">{email}</span>
                                            </a>
                                            <button
                                                onClick={() => copyText(email, `email-${key}`)}
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Copy email"
                                                aria-label="Copy email"
                                            >
                                                <FontAwesomeIcon icon={copiedKey === `email-${key}` ? faCheck : faCopy} />
                                            </button>
                                        </div>
                                    )}

                                    {agent.address && (
                                        <div className="flex items-center text-gray-700">
                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-500 mr-2" />
                                            <span className="break-words">{agent.address}</span>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

AssignedAgents.propTypes = {
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
    }),
    setIsOpenModal: PropTypes.func,
    setSelectedPerson: PropTypes.func,
    title: PropTypes.string,
    emptyFallback: PropTypes.node,
};
