import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";

const ChatInput = ({ channel }) => {
    const [content, setContent] = useState('')

    const onSend = () => {
        axios
            .post(`/chat/channels/${channel?.id}/messages`, {
                content
            })
            .then(() => setContent(''))
    }

    return (
        <div className="flex items-end gap-3 p-4 border-t bg-white">
            <textarea
                id='message'
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 resize-none transition-shadow"
            />

            <button
                onClick={onSend}
                disabled={!content.trim()}
                className={`px-3 py-2  rounded-full transition-colors ${
                    content.trim()
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
            </button>
        </div>
    );

}

export default ChatInput;
