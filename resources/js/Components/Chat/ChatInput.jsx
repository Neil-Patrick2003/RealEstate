import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";

const ChatInput = ({ channel }) => {
    const [content, setContent] = useState('')
    const onSend = () => {
        axios.post(`/seller/chat/channels/${channel?.id}/messages`, {
            content
        });
    }

    return <div className="flex px-4 py-4 gap-x-2">
        <textarea
            rows={3}
            onChange={e => setContent(e.target.value)}
            className={`w-full p-2 rounded-lg resize-none focus:outline-none bg-gray-100 text-gray-900 placeholder-gray-500`}
        />

        <button disabled={! content} onClick={onSend}>
            <FontAwesomeIcon icon={faPaperPlane} className="text-gray-500" />
        </button>
    </div>
}

export default ChatInput;
