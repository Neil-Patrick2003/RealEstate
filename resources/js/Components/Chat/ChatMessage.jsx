import {usePage} from '@inertiajs/react';
import {useMemo} from 'react';
import { format } from 'date-fns';
const ChatMessage = ({ message }) => {
    const {user} = usePage().props.auth

    const isSentByMe = useMemo(
        () => message.sender_id === user?.id,
            [message, user]
    );

    return <div
        className={`flex ${
            isSentByMe ? 'justify-end' : 'justify-start'
        } mb-4 items-end`}
    >
        <div
            className={`max-w-[70%] p-3 ${
                isSentByMe
                    ? 'bg-blue-500 text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl'
                    : 'bg-blue-500 text-white rounded-tl-3xl rounded-tr-3xl rounded-br-3xl'
            }`}
        >
            <p className="break-words">{message.content}</p>
            {message.created_at && (
                <div
                    className={`text-xs mt-1`}
                >
                    {format(message.created_at, 'h:mm a')}
                </div>
            )}
        </div>
    </div>
}

export default ChatMessage
