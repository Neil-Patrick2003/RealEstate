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
            className={`flex items-end mb-4 px-4 ${
                isSentByMe ? 'justify-end' : 'justify-start'
            }`}
        >
            {/* Avatar for other users */}
            {!isSentByMe && (
                <div className="w-8 h-8 rounded-full bg-secondary text-white font-semibold flex items-center justify-center mr-2 shadow-sm text-sm uppercase">
                    {message.sender?.name?.charAt(0) || '?'}
                </div>
            )}

            <div className="relative max-w-[75%]">
                <div
                    className={`px-4 py-3 text-sm leading-relaxed break-words shadow-md
                        ${
                        isSentByMe
                            ? 'bg-accent text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                            : 'bg-gray-100 text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                    }`}
                >
                    {/* Text content */}
                    {message.content && (
                        <p className={hasAttachment ? 'mb-2' : ''}>
                            {message.content}
                        </p>
                    )}

                    {/* Attachment (image or file link) */}
                    {hasAttachment && (
                        <div
                            className={`${
                                message.content ? 'pt-2 border-t border-white/10 dark:border-gray-200/20' : ''
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
                                        className="max-h-64 rounded-lg object-contain"
                                    />
                                    {message.attachment_name && (
                                        <div className="mt-1 text-[11px] opacity-80 truncate">
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
                                    className={`inline-flex items-center text-xs underline ${
                                        isSentByMe ? 'text-white' : 'text-primary'
                                    }`}
                                >
                                    <span className="mr-1">📎</span>
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
                            className={`text-[10px] mt-1 ${
                                isSentByMe
                                    ? 'text-white/70 text-right'
                                    : 'text-gray-500 text-right'
                            }`}
                        >
                            {format(createdAt, 'h:mm a')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
