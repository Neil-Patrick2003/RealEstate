import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/Components/Modal.jsx";
import { MessageSquare, Sparkles, Edit3 } from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * InquiryForm with templates + custom message
 *
 * Props:
 * - show, onClose
 * - person: { name, role, photo_url }
 * - message: string
 * - onChangeMessage: (val:string)=>void
 * - onSubmit: ()=>void
 * - processing: boolean
 * - templates?: string[]          // optional preset templates
 * - maxLength?: number            // default 250
 * - placeholderVars?: { [key: string]: string } // e.g. { name:"Juan", property:"Modern 2BR Condo" }
 */
export default function InquiryForm({
                                        show,
                                        onClose,
                                        person,
                                        message,
                                        onChangeMessage,
                                        onSubmit,
                                        processing,
                                        templates,
                                        maxLength = 250,
                                        placeholderVars = {},
                                    }) {
    const inputRef = useRef(null);

    // Default template set (can be overridden via props)
    const defaultTemplates = [
        "Hi {{name}}, I’m interested in {{property}}. Can we schedule a viewing?",
        "Hello {{name}}, could you share more details about {{property}} (price, terms, and availability)?",
        "Good day {{name}}, is {{property}} still available? I’d like to discuss next steps.",
        "Hi {{name}}, I have a few questions about {{property}}. When are you available for a quick call?"
    ];

    const presetTemplates = useMemo(
        () => (Array.isArray(templates) && templates.length ? templates : defaultTemplates),
        [templates]
    );

    // Safe person data
    const personName = person?.name || "Agent";
    const personRole =
        person?.role === "Agent" ? "Real Estate Agent" :
            person?.role === "Broker" ? "Licensed Broker" :
                person?.role === "Seller" ? "Seller" : "Contact";

    // Very tiny handlebars-ish replacement: {{var}}
    const fill = (tpl) =>
        tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
            if (key === "name") return personName;
            return placeholderVars?.[key] ?? "";
        }).replace(/\s+/g, " ").trim();

    const [activeTab, setActiveTab] = useState("templates"); // "templates" | "custom"

    useEffect(() => {
        if (show) {
            // Focus textarea shortly after mount
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [show]);

    const handlePick = (tpl) => {
        const text = fill(tpl);
        onChangeMessage(text.slice(0, maxLength));
        setActiveTab("custom");
        inputRef.current?.focus();
    };

    const left = Math.max(0, maxLength - (message?.length || 0));
    const canSend = !processing && Boolean(message?.trim());

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (canSend) onSubmit();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onClose?.();
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div
                className="p-6 bg-white max-h-[80vh] overflow-auto rounded-xl shadow-lg relative"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label="Send inquiry"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                    aria-label="Close modal"
                >
                    &times;
                </button>

                {/* Person */}
                <div className="flex items-center gap-4 mb-6">
                    {person?.photo_url ? (
                        <img
                            src={`/storage/${String(person.photo_url).replace(/^\/?storage\//, "")}`}
                            alt={`${personName}'s avatar`}
                            className="w-14 h-14 rounded-full object-cover border border-gray-300 bg-white"
                            onError={(e)=>{ e.currentTarget.src="/images/placeholder-avatar.png"; }}
                        />
                    ) : (
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-lg font-semibold">
                            {(personName?.charAt(0) || "A").toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{personName}</h3>
                        <p className="text-sm text-gray-500">{personRole}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-4 flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("templates")}
                        className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border",
                            activeTab === "templates"
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        )}
                        aria-pressed={activeTab === "templates"}
                    >
                        <Sparkles className="w-4 h-4" /> Templates
                    </button>
                    <button
                        onClick={() => setActiveTab("custom")}
                        className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border",
                            activeTab === "custom"
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        )}
                        aria-pressed={activeTab === "custom"}
                    >
                        <Edit3 className="w-4 h-4" /> Custom
                    </button>

                </div>

                {/* Template chips */}
                {activeTab === "templates" && (
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {presetTemplates.map((tpl, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handlePick(tpl)}
                                className="text-left w-full p-3 rounded-md border hover:bg-gray-50 text-sm"
                                title="Use this template"
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 mt-0.5 text-primary" />
                                    <span className="text-gray-700">
                    {fill(tpl)}
                  </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Message box */}
                <div className="mb-4">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Your message
                    </label>
                    <textarea
                        id="message"
                        ref={inputRef}
                        rows={activeTab === "templates" ? 3 : 5}
                        maxLength={maxLength}
                        placeholder="Type your message…"
                        value={message}
                        onChange={(e) => onChangeMessage(e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-800 resize-y min-h-[96px]"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs">
            <span className={cn("transition-opacity", message.trim() ? "opacity-70" : "opacity-0")}>
              Preview: {message.trim() ? `"${message.trim()}"` : ""}
            </span>
                        <span className={cn("tabular-nums", left < 15 ? "text-amber-600" : "text-gray-500")}>
              {left}/{maxLength}
            </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!canSend}
                        onClick={onSubmit}
                        className={cn(
                            "bg-primary text-white font-medium px-5 py-2 rounded-md text-sm transition",
                            canSend ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {processing ? "Sending…" : "Send Message"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
