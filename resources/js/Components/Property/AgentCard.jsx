import React, { useState } from "react";
import PropTypes from "prop-types";
import { Phone, Mail, Building2, MessageSquare, Copy, Check } from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Helper to normalize avatar path
const getAvatarPath = (agent) => {
    const rawAvatar = agent.image || agent.photo_url || agent.avatar_url || "";
    if (!rawAvatar) return null;
    // Normalize to '/storage/...'
    return `/storage/${rawAvatar.replace(/^\/?storage\//, "")}`;
};

// --- AgentCard Component ---
const AgentCard = ({ agent, isBuyer, auth, onContactClick }) => {
    const key = agent.id ?? agent.email ?? agent.name; // Use a clearer key basis
    const avatar = getAvatarPath(agent);
    const initials = (agent.name?.trim()?.charAt(0) || "A").toUpperCase();
    const phone = agent.contact_number || agent.phone || "";
    const email = agent.email || "";

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

    const CopyButton = ({ text, type }) => {
        const copyKey = `${type}-${key}`;
        return (
            <button
                onClick={() => copyText(text, copyKey)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border text-gray-600 hover:bg-gray-50 transition-colors"
                title={`Copy ${type}`}
                aria-label={`Copy ${type}`}
            >
                {copiedKey === copyKey ? (
                    <>
                        <Check className="w-3.5 h-3.5 text-green-500" /> Copied
                    </>
                ) : (
                    <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                )}
            </button>
        );
    };

    return (
        <article className="bg-white border rounded-xl ring-1 ring-gray-100 p-5 hover:shadow-md transition-shadow">
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
                        <div className="h-14 w-14 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-semibold ring-1 ring-gray-200">
                            {initials}
                        </div>
                    )}

                    <div className="ml-4 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-tight truncate">
                            {agent.name || "Agent"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                            {agent.title || "Real Estate Agent"}
                        </p>
                    </div>
                </div>

                {/* Contact Button */}
                <button
                    onClick={() => onContactClick(agent)}
                    disabled={!isBuyer}
                    className={cn(
                        "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                        isBuyer
                            ? "bg-primary text-white hover:bg-primary focus:ring-primary" // Enhanced primary color
                            : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                    )}
                    title={
                        !auth?.user
                            ? "You must be logged in to contact an agent"
                            : !isBuyer
                                ? "Only buyers can contact agents"
                                : "Contact the agent"
                    }
                    aria-label="Contact agent via message"
                >
                    <MessageSquare className="w-4 h-4" />
                    Message
                </button>
            </div>

            {/* Contacts */}
            <div className="mt-4 space-y-3 border-t pt-3 border-gray-100 text-sm">
                {!!phone && (
                    <div className="flex items-center justify-between gap-3">
                        <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center text-gray-700 hover:text-primary font-medium transition-colors"
                            title="Call"
                        >
                            <Phone className="w-4 h-4 text-emerald-500 mr-2" />
                            <span className="break-all">{phone}</span>
                        </a>
                        <CopyButton text={phone} type="phone" />
                    </div>
                )}

                {!!email && (
                    <div className="flex items-center justify-between gap-3">
                        <a
                            href={`mailto:${email}?subject=${encodeURIComponent("Property Inquiry")}`}
                            className="inline-flex items-center text-gray-700 hover:text-primary font-medium transition-colors"
                            title="Email"
                        >
                            <Mail className="w-4 h-4 text-emerald-500 mr-2" />
                            <span className="break-all">{email}</span>
                        </a>
                        <CopyButton text={email} type="email" />
                    </div>
                )}

                {!!agent.address && (
                    <div className="flex items-center text-gray-500 pt-1">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="break-words text-xs">{agent.address}</span>
                    </div>
                )}
            </div>
        </article>
    );
};

export default AgentCard;
