import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { format } from 'date-fns';

const ChatMessage = ({ message }) => {
    const { user } = usePage().props.auth;

    const isSentByMe = useMemo(
        () => message.sender_id === user?.id,
        [message, user]
    );

    const hasAttachment = !!message.attachment_path;
    const attachmentUrl = hasAttachment
        ? `/storage/${message.attachment_path}`
        : null;

    // Make sure created_at is a Date or convert if it's a string
    const createdAt = message.created_at
        ? new Date(message.created_at)
        : null;

    return (
        <div
            className={`flex items-end mb-6 px-4 ${
                isSentByMe ? 'justify-end' : 'justify-start'
            }`}
        >
            {/* Avatar for other users */}
            {!isSentByMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium flex items-center justify-center mr-3 shadow-sm text-sm uppercase">
                    {message.sender?.name?.charAt(0) || '?'}
                </div>
            )}

            <div className="relative max-w-[75%]">
                <div
                    className={`px-5 py-3 text-sm leading-relaxed break-words
                        ${
                        isSentByMe
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-gray-100/80 text-gray-800 rounded-2xl rounded-bl-md'
                    }`}
                >
                    {/* Text content */}
                    {message.content && (
                        <p className={`${hasAttachment ? 'mb-3' : ''} ${isSentByMe ? 'text-white' : 'text-gray-700'}`}>
                            {message.content}
                        </p>
                    )}

                    {/* Attachment (image or file link) */}
                    {hasAttachment && (
                        <div
                            className={`${
                                message.content ? 'pt-3' : ''
                            }`}
                        >
                            {message.attachment_mime?.startsWith('image/') ? (
                                // Image preview
                                <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={attachmentUrl}
                                        alt={message.attachment_name || 'Attachment'}
                                        className="max-h-64 rounded-xl object-cover shadow-sm hover:shadow-md transition-shadow duration-200"
                                    />
                                    {message.attachment_name && (
                                        <div className={`mt-2 text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                            📎 {message.attachment_name}
                                        </div>
                                    )}
                                </a>
                            ) : (
                                // Other file types – show as download link
                                <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                                        isSentByMe
                                            ? 'bg-blue-400/20 text-blue-100 hover:bg-blue-400/30'
                                            : 'bg-gray-200/60 text-gray-600 hover:bg-gray-200/80'
                                    }`}
                                >
                                    <span className="mr-2">📎</span>
                                    <span className="truncate max-w-[180px]">
                                        {message.attachment_name || 'Download file'}
                                    </span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Timestamp */}
                    {createdAt && (
                        <div
                            className={`text-xs mt-2 ${
                                isSentByMe
                                    ? 'text-blue-100/80 text-right'
                                    : 'text-gray-400 text-right'
                            }`}
                        >
                            {format(createdAt, 'h:mm a')}
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar for current user */}
            {isSentByMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white font-medium flex items-center justify-center ml-3 shadow-sm text-sm uppercase">
                    {user?.name?.charAt(0) || 'Y'}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
