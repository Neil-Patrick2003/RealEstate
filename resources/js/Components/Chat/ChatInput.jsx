import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useRef } from "react";
import axios from "axios";

const ChatInput = ({ channel }) => {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
    };

    const onSend = async () => {
        if (!content.trim() && !file) return;
        if (!channel?.id) return;

        setSending(true);

        const formData = new FormData();
        formData.append("content", content);
        if (file) {
            formData.append("file", file);
        }

        try {
            await axios.post(`/chat/channels/${channel.id}/messages`, formData);

            // Clear inputs after success
            setContent("");
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.log("API ERROR", error.response?.data || error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const canSend = !!content.trim() || !!file;

    return (
        <div className="flex items-end gap-3 p-6 bg-gradient-to-t from-white to-gray-50/30 backdrop-blur-sm">
            {/* Attach button */}
            <div className="flex flex-col items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 mb-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/60 text-gray-600 transition-all duration-200 hover:scale-105"
                >
                    <span className="text-lg">📎</span>
                </button>
                {file && (
                    <span className="max-w-[120px] text-xs text-gray-500 truncate px-2 py-1 bg-gray-100/50 rounded-lg">
                        {file.name}
                    </span>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex-1 relative">
                <textarea
                    id="message"
                    rows={2}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-4 pr-12 rounded-2xl bg-white/80 backdrop-blur-sm focus:bg-white text-gray-900 placeholder-gray-400 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-sm"
                    style={{ minHeight: '56px', maxHeight: '120px' }}
                />
            </div>

            <button
                onClick={onSend}
                disabled={!canSend || sending}
                className={`p-4 mb-2 rounded-xl transition-all duration-200 ${
                    canSend && !sending
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
                {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

export default ChatInput;
