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

    const canSend = !!content.trim() || !!file;

    return (
        <div className="flex items-end gap-3 p-4 border-t bg-white">
            {/* Attach button */}
            <div className="flex flex-col items-center gap-1">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
                >
                    📎
                </button>
                {file && (
                    <span className="max-w-[100px] text-[10px] text-gray-500 truncate">
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

            <textarea
                id="message"
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 resize-none transition-shadow"
            />

            <button
                onClick={onSend}
                disabled={!canSend || sending}
                className={`px-3 py-2 rounded-full transition-colors ${
                    canSend && !sending
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
                {sending ? (
                    <span className="text-xs px-1">...</span>
                ) : (
                    <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

export default ChatInput;
