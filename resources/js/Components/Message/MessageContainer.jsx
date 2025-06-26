import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function MessageContainer({ messages, currentUserId }) {
    return (
        <ul className="h-[57vh] overflow-y-auto space-y-4 px-4 py-3">
            {messages.map((msg, index) => {
                const isOwn = msg.sender_id === currentUserId;

                return (
                    <li key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                            {/* Optional: property title */}
                            {msg.inquiry?.property?.title && (
                                <div className="text-xs text-gray-400 mb-1 italic">
                                    {msg.inquiry.property.title}
                                </div>
                            )}

                            {/* Chat bubble with absolute timestamp */}
                            <div className="relative px-4 py-2 rounded-2xl shadow-md text-sm break-words max-w-full min-h-[48px]"
                                 style={{
                                     backgroundColor: isOwn ? '#719440' : '#f3f4f6',
                                     color: isOwn ? 'white' : '#111827',
                                     borderBottomRightRadius: isOwn ? '0.5rem' : '1rem',
                                     borderBottomLeftRadius: isOwn ? '1rem' : '0.5rem'
                                 }}
                            >
                                <div className="pr-12">{msg.message}</div>

                                <span className="absolute bottom-1 right-3 text-[10px] text-gray-300">
                                    {dayjs(msg.created_at).fromNow()}
                                </span>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
