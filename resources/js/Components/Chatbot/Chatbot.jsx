import React, { useState } from 'react';

const SESSION_KEY = 'mjvi_guest_chat_session_token';

export default function Chatbot() {
    const [sessionToken, setSessionToken] = useState(
        () => localStorage.getItem(SESSION_KEY) || null
    );
    const [messages, setMessages] = useState([]); // {id, role, message, recommendedProperties?}
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input.trim();

        // show user message agad
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'user', message: userText },
        ]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chatbot/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    session_token: sessionToken,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to send message');
            }

            const data = await res.json();

            if (!sessionToken && data.session_token) {
                localStorage.setItem(SESSION_KEY, data.session_token);
                setSessionToken(data.session_token);
            }

            const assistantMessage = data.message || '';
            const recommendedProperties = data.recommended_properties || [];

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    message: assistantMessage,
                    recommendedProperties,
                },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    role: 'assistant',
                    message:
                        'Pasensya na, nagka-error sa server. Paki-try ulit mamaya or refresh the page.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClickProperty = (property) => {
        window.open(`/properties/${property.id}`, '_blank', 'noopener,noreferrer');
    };

    const handleQuickPrompt = (text) => {
        setInput(text);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Closed state: round launcher button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition transform hover:-translate-y-0.5"
                >
                    {/* Simple chat icon (speech bubble) */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M8 10h.01M12 10h.01M16 10h.01M5 20l2.5-2.5H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11z"
                        />
                    </svg>
                </button>
            )}

            {/* Open state: chat panel */}
            {isOpen && (
                <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-emerald-50 flex flex-col overflow-hidden ring-1 ring-emerald-100">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/30">
                                    <span className="text-sm font-semibold">MJ</span>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">MJVI Realty Assistant</h3>
                                <p className="text-[11px] text-emerald-100">
                                    Online · Ask me about properties or how MJVI works
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="ml-2 rounded-full p-1 hover:bg-emerald-500/70 focus:outline-none transition"
                        >
                            {/* X icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="px-3 pt-3 pb-2 h-80 overflow-y-auto space-y-3 text-sm bg-gradient-to-b from-emerald-50 to-gray-50">
                        {/* Empty state */}
                        {messages.length === 0 && (
                            <div className="mt-3 space-y-3">
                                <div className="text-gray-600 text-xs text-center">
                                    👋 Hi! I can help you search properties or explain how MJVI
                                    works.
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuickPrompt('May 3BR house ka ba sa Cavite under 5M?')
                                        }
                                        className="text-[11px] px-3 py-1 rounded-full bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition"
                                    >
                                        3BR house in Cavite under 5M
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuickPrompt(
                                                'Paano mag-send ng inquiry sa isang property?',
                                            )
                                        }
                                        className="text-[11px] px-3 py-1 rounded-full bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition"
                                    >
                                        Paano mag-send ng inquiry?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuickPrompt(
                                                'Paano gumagana ang tripping schedule sa MJVI?',
                                            )
                                        }
                                        className="text-[11px] px-3 py-1 rounded-full bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition"
                                    >
                                        Tripping schedule guide
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-2">
                                <div
                                    className={`flex ${
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`rounded-2xl px-3 py-2 max-w-[80%] whitespace-pre-line text-[13px] leading-snug shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                                : 'bg-white/90 text-gray-800 border border-emerald-50 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>

                                {/* Property previews (assistant only) */}
                                {msg.role === 'assistant' &&
                                    msg.recommendedProperties &&
                                    msg.recommendedProperties.length > 0 && (
                                        <div className="flex flex-col gap-2 ml-1">
                                            <p className="text-[11px] text-gray-500">
                                                Here are some properties you might like:
                                            </p>
                                            {msg.recommendedProperties.map((prop) => (
                                                <button
                                                    key={prop.id}
                                                    type="button"
                                                    onClick={() => handleClickProperty(prop)}
                                                    className="flex gap-2 rounded-xl border border-emerald-100 bg-white p-2 text-left hover:border-emerald-400 hover:shadow-md transition"
                                                >
                                                    {prop.main_image_url && (
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={
                                                                    prop.main_image_url.startsWith('http')
                                                                        ? prop.main_image_url
                                                                        : `/storage/${prop.main_image_url}`
                                                                }
                                                                alt={prop.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col justify-between">
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-900 line-clamp-1">
                                                                {prop.title}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 line-clamp-1">
                                                                {prop.city}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-semibold text-emerald-600">
                                                            ₱{Number(prop.price).toLocaleString()}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500">
                                                            {prop.bedrooms} BR · {prop.bathrooms} BA ·{' '}
                                                            {prop.lot_area} sqm
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start mt-2">
                                <div className="bg-white/90 border border-emerald-100 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-gray-500 flex items-center gap-2 shadow-sm">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:120ms]"></span>
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:240ms]"></span>
                                    <span className="ml-1 text-[11px] text-gray-500">
                                        Typing…
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="border-t border-emerald-100 bg-white/95">
                        <div className="flex items-center px-3 py-2 gap-2">
                            <input
                                type="text"
                                className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white placeholder:text-[11px]"
                                placeholder="Ask about properties or how MJVI works..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-3 py-2 text-xs font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
