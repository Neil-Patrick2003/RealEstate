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
        // adjust URL pattern to your property route
        window.location.href = `/properties/${property.slug}`;
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Closed state: round launcher button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                <div className="w-80 sm:w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">MJVI Realty Assistant</h3>
                            <p className="text-xs text-indigo-100">
                                Ask me about properties or how the platform works.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="ml-2 rounded-full p-1 hover:bg-indigo-500 focus:outline-none"
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
                    <div className="px-3 py-3 h-80 overflow-y-auto space-y-3 text-sm bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-gray-500 text-xs text-center mt-4">
                                👋 Hi! I can help you search properties or explain how MJVI
                                works. Try:
                                <br />
                                <span className="font-medium">
                  &quot;May 3BR house ka ba sa Cavite under 5M?&quot;
                </span>
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
                                        className={`rounded-2xl px-3 py-2 max-w-[80%] whitespace-pre-line ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
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
                                            <p className="text-xs text-gray-500">
                                                Here are some properties you might like:
                                            </p>
                                            {msg.recommendedProperties.map((prop) => (
                                                <button
                                                    key={prop.id}
                                                    type="button"
                                                    onClick={() => handleClickProperty(prop)}
                                                    className="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 text-left hover:border-indigo-400 hover:shadow-sm transition"
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
                                                        <div className="text-xs font-semibold text-indigo-600">
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
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white">
                        <div className="flex items-center px-3 py-2 gap-2">
                            <input
                                type="text"
                                className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ask about properties or how MJVI works..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-3 py-2 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
