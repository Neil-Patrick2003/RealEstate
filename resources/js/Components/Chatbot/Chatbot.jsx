import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import chatbotData from '@/Components/Chatbot/data/chatbot_dataset.json';

/**
 * MJVI Realty Chatbot Component
 * A professional, responsive chatbot for the landing page
 * Uses JSON dataset for responses and supports natural language matching
 */

// Icon components mapping
const iconMap = {
    'rocket': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    'rocket-launch': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    'document-text': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    'magnifying-glass': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    'briefcase': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    'sparkles': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    'home': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    'chat-bubble-left-right': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
};

const getIcon = (iconName, size = '6') => {
    return iconMap[iconName] || iconMap['sparkles'];
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [showCategories, setShowCategories] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Helper function to determine if response should be in modal
    const isLongResponse = (text) => {
        // Consider it long if more than 500 characters or has many steps
        return text.length > 500 || text.includes('STEP 1:') || text.includes('METHOD 1:');
    };

    // Get short summary from long response
    const getShortSummary = (text) => {
        // Extract first paragraph or create a summary
        const lines = text.split('\n').filter(line => line.trim());
        const firstParagraph = lines.slice(0, 3).join('\n');
        return firstParagraph + '\n\nThis is a detailed guide with step-by-step instructions.';
    };

    // Initialize with greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = chatbotData.greetings[Math.floor(Math.random() * chatbotData.greetings.length)];
            setMessages([{
                id: Date.now(),
                text: greeting,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [isOpen]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Find best matching response
    const findResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase().trim();
        
        // Search through all responses
        for (const [key, value] of Object.entries(chatbotData.responses)) {
            // Check if keywords match
            if (value.keywords) {
                for (const keyword of value.keywords) {
                    if (lowerMessage.includes(keyword.toLowerCase())) {
                        return value.answer;
                    }
                }
            }
            
            // Check if question matches
            if (value.question && lowerMessage.includes(value.question.toLowerCase())) {
                return value.answer;
            }
        }
        
        // Return fallback if no match
        return chatbotData.fallback_responses[
            Math.floor(Math.random() * chatbotData.fallback_responses.length)
        ];
    };

    // Handle sending message
    const handleSendMessage = (text = inputValue) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setShowQuickReplies(false);
        setShowCategories(false);
        
        // Simulate bot typing
        setIsTyping(true);
        
        setTimeout(() => {
            const botResponse = findResponse(text);
            const isLong = isLongResponse(botResponse);
            
            const botMessage = {
                id: Date.now() + 1,
                text: isLong ? getShortSummary(botResponse) : botResponse,
                fullText: isLong ? botResponse : null,
                isLongResponse: isLong,
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            // Add closing message
            setTimeout(() => {
                const closingMsg = chatbotData.closing_messages[
                    Math.floor(Math.random() * chatbotData.closing_messages.length)
                ];
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    text: closingMsg,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
                setShowQuickReplies(true);
            }, 1000);
        }, 1000 + Math.random() * 500); // Random delay for natural feel
    };

    // Handle quick reply
    const handleQuickReply = (responseKey) => {
        const response = chatbotData.responses[responseKey];
        if (response) {
            handleSendMessage(response.question);
        }
    };

    // Handle category selection
    const handleCategoryClick = (category) => {
        const question = category.questions[0]; // Use first question as trigger
        handleSendMessage(question);
    };

    // Toggle categories view
    const toggleCategories = () => {
        setShowCategories(!showCategories);
        setShowQuickReplies(false);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all duration-300 ${
                    isOpen 
                        ? 'bg-gray-100 hover:bg-gray-200' 
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                } ${isOpen ? 'w-14 h-14' : 'w-16 h-16'} flex items-center justify-center group`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="chat"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </motion.svg>
                    )}
                </AnimatePresence>
                
                {/* Notification Badge */}
                {!isOpen && (
                    <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                )}
            </motion.button>

            {/* Guide Modal */}
            <AnimatePresence>
                {showModal && modalContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">{modalContent.title}</h3>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                <div className="prose prose-sm max-w-none">
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                            {modalContent.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    Follow these steps to complete the process
                                </p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                                >
                                    Got it!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-md h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">MJVI Assistant</h3>
                                    <p className="text-emerald-100 text-xs">Online • Always ready to help</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleCategories}
                                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                                aria-label="Show categories"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {message.sender === 'bot' && (
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 max-w-full">
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${
                                                    message.sender === 'user'
                                                        ? 'bg-emerald-600 text-white rounded-br-sm'
                                                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                                            </div>
                                            {message.isLongResponse && message.fullText && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setModalContent({
                                                            title: 'Complete Step-by-Step Guide',
                                                            content: message.fullText
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    View Complete Guide
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-end gap-2"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200">
                                        <div className="flex gap-1">
                                            <motion.div
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Replies */}
                            {showQuickReplies && !isTyping && messages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-wrap gap-2 pt-2"
                                >
                                    {chatbotData.quick_replies.map((reply) => (
                                        <motion.button
                                            key={reply.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleQuickReply(reply.response)}
                                            className="px-3 py-2 bg-white border-2 border-emerald-600 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shadow-sm"
                                        >
                                            <span className="text-emerald-600">{getIcon(reply.icon, '4')}</span>
                                            <span>{reply.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}

                            {/* Categories */}
                            {showCategories && !isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 gap-2 pt-2"
                                >
                                    <p className="text-xs text-gray-500 font-medium mb-1">Browse by category:</p>
                                    {chatbotData.categories.map((category) => (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleCategoryClick(category)}
                                            className="px-4 py-3 bg-white border border-gray-200 text-left rounded-xl hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-3"
                                        >
                                            <span className="text-emerald-600">{getIcon(category.icon)}</span>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{category.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{category.questions[0]}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowCategories(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to chat
                                    </motion.button>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                    disabled={isTyping}
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </motion.button>
                            </form>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Powered by MJVI Realty AI Assistant
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
