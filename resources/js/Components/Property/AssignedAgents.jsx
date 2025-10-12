// components/Property/AssignedAgents.jsx
import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
    Phone,
    Mail,
    Building2,
    MessageSquare,
    Copy,
    Check,
    UserRound,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function AssignedAgents({
                                           agents = [],
                                           auth = null,
                                           setIsOpenModal = () => {},
                                           setSelectedPerson = () => {},
                                           title = "Property Agents",
                                           emptyFallback = null,
                                       }) {
    const isBuyer = Boolean(auth?.role === "Buyer");
    const list = Array.isArray(agents) ? agents : [];

    const [copiedKey, setCopiedKey] = useState(null);
    const markCopied = (key) => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 1200);
    };

    const copyText = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            markCopied(key);
        } catch {
            window.prompt("Copy this:", text);
        }
    };

    if (!list.length) return emptyFallback ?? null;

    return (
        <section className="sticky top-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

                <div className="flex flex-col gap-4">
                    {list.map((agent, idx) => {
                        const key = agent.id ?? agent.email ?? `${agent.name}-${idx}`;
                        const rawAvatar =
                            agent.image || agent.photo_url || agent.avatar_url || "";

                        // Normalize to `/storage/...` or fallback placeholder
                        const avatar = rawAvatar
                            ? `/storage/${rawAvatar.replace(/^\/?storage\//, "")}`
                            : null;

                        const initials = (agent.name?.trim()?.charAt(0) || "A").toUpperCase();
                        const phone = agent.contact_number || agent.phone || "";
                        const email = agent.email || "";

                        const onContactClick = () => {
                            if (!isBuyer) return;
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
                                                alt={agent.name ? `Agent ${agent.name}` : "Agent avatar"}
                                                className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200 bg-white"
                                                onError={(e) => (e.currentTarget.src = "/images/placeholder-avatar.png")}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-semibold ring-1 ring-gray-200">
                                                {initials}
                                            </div>
                                        )}

                                        <div className="ml-4 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 leading-tight truncate">
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
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition",
                                            isBuyer
                                                ? "bg-primary text-white hover:bg-accent"
                                                : "bg-gray-300 text-white cursor-not-allowed"
                                        )}
                                        title={
                                            !auth?.user
                                                ? "You must be logged in to contact an agent"
                                                : !isBuyer
                                                    ? "Only buyers can contact agents"
                                                    : "Contact the agent"
                                        }
                                        aria-label="Contact agent"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                         Message
                                    </button>
                                </div>

                                {/* Contacts */}
                                <div className="mt-4 space-y-2 text-sm">
                                    {!!phone && (
                                        <div className="flex items-center justify-between gap-3">
                                            <a
                                                href={`tel:${phone}`}
                                                className="inline-flex items-center text-gray-700 hover:text-gray-900"
                                                title="Call"
                                            >
                                                <Phone className="w-4 h-4 text-primary mr-2" />
                                                <span className="break-all">{phone}</span>
                                            </a>
                                            <button
                                                onClick={() => copyText(phone, `phone-${key}`)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-gray-50"
                                                title="Copy phone"
                                                aria-label="Copy phone"
                                            >
                                                {copiedKey === `phone-${key}` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" /> Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" /> Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {!!email && (
                                        <div className="flex items-center justify-between gap-3">
                                            <a
                                                href={`mailto:${email}?subject=${encodeURIComponent("Property Inquiry")}`}
                                                className="inline-flex items-center text-gray-700 hover:text-gray-900"
                                                title="Email"
                                            >
                                                <Mail className="w-4 h-4 text-primary mr-2" />
                                                <span className="break-all">{email}</span>
                                            </a>
                                            <button
                                                onClick={() => copyText(email, `email-${key}`)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-gray-50"
                                                title="Copy email"
                                                aria-label="Copy email"
                                            >
                                                {copiedKey === `email-${key}` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" /> Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" /> Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {!!agent.address && (
                                        <div className="flex items-center text-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-500 mr-2" />
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
        user: PropTypes.object,
    }),
    setIsOpenModal: PropTypes.func,
    setSelectedPerson: PropTypes.func,
    title: PropTypes.string,
    emptyFallback: PropTypes.node,
};
