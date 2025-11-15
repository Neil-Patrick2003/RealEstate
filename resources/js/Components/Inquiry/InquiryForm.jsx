import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/Components/Modal.jsx";
import {
    MessageSquare,
    Sparkles,
    Edit3,
    X,
    ChevronDown,
    Send,
    User,
    Zap,
    Lightbulb,
    Clock,
    CheckCircle2
} from "lucide-react";

// Simple utility for combining CSS classes
const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * Elegant InquiryForm with Enhanced UX
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
                                        maxLength = 500,
                                        placeholderVars = {},
                                    }) {
    // Refs and State
    const inputRef = useRef(null);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true);

    // Enhanced default templates
    const defaultTemplates = useMemo(() => [
        {
            id: "viewing",
            title: "Schedule Viewing",
            content: "Hi {{name}}, I'm very interested in {{property}} and would love to schedule a viewing. What dates work best for you?",
            icon: Clock
        },
        {
            id: "details",
            title: "Get More Details",
            content: "Hello {{name}}, could you please share more details about {{property}}? I'm particularly interested in the price breakdown, payment terms, and availability timeline.",
            icon: Lightbulb
        },
        {
            id: "availability",
            title: "Check Availability",
            content: "Good day {{name}}, is {{property}} still available? I'd like to discuss next steps and understand the purchasing process.",
            icon: Zap
        },
        {
            id: "questions",
            title: "Quick Questions",
            content: "Hi {{name}}, I have a few specific questions about {{property}}. When would be a good time for a brief call to discuss these?",
            icon: MessageSquare
        }
    ], []);

    const presetTemplates = useMemo(
        () => (Array.isArray(templates) && templates.length ? templates : defaultTemplates),
        [templates, defaultTemplates]
    );

    // Computed Person Details
    const personName = person?.name || "Agent";
    const getRoleTitle = (role) => {
        const roles = {
            "Agent": "Real Estate Agent",
            "Broker": "Licensed Broker",
            "Seller": "Property Seller",
            "Owner": "Property Owner"
        };
        return roles[role] || "Contact";
    };
    const personRole = getRoleTitle(person?.role);

    // Template Variable Replacement Utility
    const fillTemplate = (content) =>
        content.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
            if (key === "name") return personName;
            return placeholderVars?.[key] ?? "";
        }).replace(/\s+/g, " ").trim();

    // Effects
    useEffect(() => {
        if (show) {
            const t = setTimeout(() => {
                inputRef.current?.focus();
                // Auto-select first template if no message
                if (!message?.trim() && presetTemplates.length > 0) {
                    handleTemplateSelect(presetTemplates[0]);
                }
            }, 100);
            return () => clearTimeout(t);
        }
    }, [show]);

    useEffect(() => {
        // Typing indicator for better UX
        if (message && !isTyping) {
            setIsTyping(true);
        }
    }, [message]);

    // Handlers
    const handleTemplateSelect = (template) => {
        setActiveTemplate(template.id);
        const filledContent = fillTemplate(template.content);
        onChangeMessage(filledContent.slice(0, maxLength));
        inputRef.current?.focus();
    };

    const handleCustomMessage = () => {
        setActiveTemplate(null);
        inputRef.current?.focus();
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
    const charWarning = left < 50;

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div
                className="bg-gradient-to-br from-white to-gray-50/80 max-h-[90vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden border border-gray-100"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-labelledby="inquiry-form-title"
            >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 pt-6 pb-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 id="inquiry-form-title" className="text-xl font-bold">
                                    Send Inquiry
                                </h2>
                                <p className="text-emerald-100 text-sm mt-1">
                                    Connect with {personName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                            aria-label="Close form"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Recipient Card */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200/60 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {person?.photo_url ? (
                                    <img
                                        src={`/storage/${String(person.photo_url).replace(/^\/?storage\//, "")}`}
                                        alt={`${personName}'s avatar`}
                                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder-avatar.png";
                                            e.currentTarget.className = "w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center border-2 border-white";
                                        }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center border-2 border-white shadow-md">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{personName}</h3>
                                <p className="text-emerald-600 font-medium text-sm">{personRole}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Typically replies within a few hours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Templates Section */}
                    {showTemplates && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    Quick Templates
                                </label>
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Hide
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {presetTemplates.map((template) => {
                                    const Icon = template.icon || MessageSquare;
                                    const isActive = activeTemplate === template.id;
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template)}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all duration-200 group hover:shadow-md",
                                                isActive
                                                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                                                    : "border-gray-200 bg-white hover:border-emerald-300"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    isActive ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={cn(
                                                        "font-semibold text-sm mb-1",
                                                        isActive ? "text-emerald-700" : "text-gray-700"
                                                    )}>
                                                        {template.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {fillTemplate(template.content)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Custom Message Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="message" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Edit3 className="w-4 h-4 text-emerald-600" />
                                Your Message
                                {!showTemplates && (
                                    <button
                                        onClick={() => setShowTemplates(true)}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 ml-2"
                                    >
                                        Show templates
                                    </button>
                                )}
                            </label>
                            {activeTemplate && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                    Using template
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <textarea
                                id="message"
                                ref={inputRef}
                                rows={5}
                                maxLength={maxLength}
                                placeholder="Type your custom message here, or select a template above..."
                                value={message}
                                onChange={(e) => onChangeMessage(e.target.value)}
                                onClick={handleCustomMessage}
                                className={cn(
                                    "w-full rounded-xl border bg-white p-4 text-gray-800 resize-y min-h-[120px] transition-all duration-200 placeholder-gray-400",
                                    "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border-gray-200",
                                    "shadow-sm hover:shadow-md focus:shadow-lg"
                                )}
                            />

                            {/* Character Counter */}
                            <div className={cn(
                                "absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
                                charWarning
                                    ? "bg-red-100 text-red-700"
                                    : left < 100
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-500"
                            )}>
                                {left}
                            </div>
                        </div>

                        {/* Message Preview */}
                        {message.trim() && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                    <span>Preview</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span>{message.length} characters</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {message.trim()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/50">
                        <div className="flex items-start gap-2 text-xs text-blue-700">
                            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <p>
                                <strong>Pro tip:</strong> Use templates to get started, then personalize your message.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Actions Footer */}
                <div className="px-6 py-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {processing ? (
                                <>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Sending your inquiry...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Ready to send
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                type="button"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!canSend}
                                onClick={onSubmit}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 flex items-center gap-2",
                                    canSend
                                        ? "bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                )}
                                type="submit"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
