import {usePage} from '@inertiajs/react';
import {useMemo} from 'react';
import { format } from 'date-fns';
const ChatMessage = ({ message }) => {

    console.log(message);
    const {user} = usePage().props.auth

    const isSentByMe = useMemo(
        () => message.sender_id === user?.id,
            [message, user]
    );

    return (
        <div className={`flex items-end mb-4 px-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>

            {!isSentByMe && (
                message.sender?.photo_url ? (
                    <img
                        src={`/storage/${message.sender.photo_url}`}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full mr-2 self-end shadow-sm object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary text-white font-semibold flex items-center justify-center mr-2 shadow-sm text-sm uppercase">
                        {message.sender?.name?.charAt(0) || '?'}
                    </div>
                )
            )}


            <div className="relative max-w-[75%]">
                <div
                    className={`px-4 py-3 text-sm leading-relaxed break-words shadow-md
          ${isSentByMe
                        ? 'bg-accent text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                        : 'bg-gray-100 text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                    }`}
                >
                    <p>{message.content}</p>

                    {message.created_at && (
                        <div
                            className={`text-[10px] mt-1 ${
                                isSentByMe ? 'text-white/70 text-right' : 'text-gray-500 text-right'
                            }`}
                        >
                            {format(message.created_at, 'h:mm a')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default ChatMessage
