import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/Components/Modal.jsx";
import { MessageSquare, Sparkles, Edit3, X, ChevronDown } from "lucide-react";

// Simple utility for combining CSS classes
const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * InquiryForm (Green Primary, Golden Orange Secondary)
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
    // Refs and State
    const inputRef = useRef(null);
    const [activeTab, setActiveTab] = useState("custom");
    const [selectedTemplate, setSelectedTemplate] = useState("");

    // Default template set
    const defaultTemplates = useMemo(() => [
        "Hi {{name}}, I’m interested in {{property}}. Can we schedule a viewing?",
        "Hello {{name}}, could you share more details about {{property}} (price, terms, and availability)?",
        "Good day {{name}}, is {{property}} still available? I’d like to discuss next steps.",
        "Hi {{name}}, I have a few questions about {{property}}. When are you available for a quick call?"
    ], []);

    const presetTemplates = useMemo(
        () => (Array.isArray(templates) && templates.length ? templates : defaultTemplates),
        [templates, defaultTemplates]
    );

    // Computed Person Details
    const personName = person?.name || "Agent";
    const getRoleTitle = (role) => {
        switch (role) {
            case "Agent": return "Real Estate Agent";
            case "Broker": return "Licensed Broker";
            case "Seller": return "Seller";
            default: return "Contact";
        }
    };
    const personRole = getRoleTitle(person?.role);

    // Template Variable Replacement Utility
    const fill = (tpl) =>
        tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
            if (key === "name") return personName;
            return placeholderVars?.[key] ?? "";
        }).replace(/\s+/g, " ").trim();

    // Effects
    useEffect(() => {
        if (show) {
            const t = setTimeout(() => {
                if (message?.trim() && activeTab !== "custom") {
                    setActiveTab("custom");
                }
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(t);
        }
    }, [show, message, activeTab]);

    // Handlers
    const handleTemplateChange = (e) => {
        const tplIndex = parseInt(e.target.value, 10);
        setSelectedTemplate(e.target.value);

        if (tplIndex >= 0 && tplIndex < presetTemplates.length) {
            const tpl = presetTemplates[tplIndex];
            const text = fill(tpl);
            onChangeMessage(text.slice(0, maxLength));
            setActiveTab("custom");
            inputRef.current?.focus();
        }
    };

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

    // Derived State
    const left = Math.max(0, maxLength - (message?.length || 0));
    const canSend = !processing && Boolean(message?.trim());

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div
                className="bg-white max-h-[90vh] flex flex-col rounded-lg shadow-2xl relative"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-labelledby="inquiry-form-title"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b">
                    <h2 id="inquiry-form-title" className="text-xl font-bold text-gray-900">
                        Send Your Inquiry
                    </h2>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                        aria-label="Close form"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">

                    {/* Person / Recipient Info */}
                    <div className="flex items-center gap-4 mb-6 p-3   rounded-lg border border-gray-200">
                        {person?.photo_url ? (
                            <img
                                src={`/storage/${String(person.photo_url).replace(/^\/?storage\//, "")}`}
                                alt={`${personName}'s avatar`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md bg-white"
                                onError={(e) => { e.currentTarget.src = "/images/placeholder-avatar.png"; }}
                            />
                        ) : (
                            // Avatar initial background using Primary color light shade
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-lg font-semibold border-2 border-white shadow-md">
                                {(personName?.charAt(0) || "A").toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm text-gray-500 font-medium">Recipient:</p>
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{personName}</h3>
                            {/* Role text using Primary color for emphasis */}
                            <p className="text-sm text-green-600">{personRole}</p>
                        </div>
                    </div>

                    {/* Template Dropdown */}
                    <div className="mb-6">
                        <label htmlFor="template-select" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Quick Start: Choose a Template
                        </label>
                        <div className="relative">
                            <select
                                id="template-select"
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer transition-shadow"
                            >
                                <option value="" disabled>— Select a pre-written message —</option>
                                {presetTemplates.map((tpl, i) => (
                                    <option key={i} value={i}>
                                        {fill(tpl)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Message box */}
                    <div>
                        <label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-1 block">
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            ref={inputRef}
                            rows={5}
                            maxLength={maxLength}
                            placeholder="Type your custom message here, or use the template dropdown above to start..."
                            value={message}
                            onChange={(e) => onChangeMessage(e.target.value)}
                            // Focus ring uses Primary color
                            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 text-sm text-gray-800 resize-y min-h-[96px] transition-shadow"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs">
                            <span className={cn("text-gray-500 transition-opacity", message.trim() ? "opacity-100" : "opacity-0")}>
                                Preview: **{message.trim().substring(0, 50)}**...
                            </span>
                            <span className={cn("tabular-nums font-mono", left < 15 ? "text-red-500 font-semibold" : "text-gray-500")}>
                                {left}/{maxLength} characters left
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {/* Footer background uses Secondary color light shade */}
                <div className="p-4 border-t   flex items-center justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!canSend}
                        onClick={onSubmit}
                        className={cn(
                            // Main CTA uses Primary color
                            "bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-md transition-all",
                            canSend ? "hover:bg-green-700" : "opacity-60 cursor-not-allowed"
                        )}
                        type="submit"
                    >
                        {processing ? "Sending Inquiry…" : "Send Message"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
