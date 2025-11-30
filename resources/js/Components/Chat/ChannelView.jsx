import {useMemo, useEffect, useState, useRef} from "react";
import {usePage} from "@inertiajs/react";
import ChatMessage from './ChatMessage.jsx'
import ChannelSubject from './ChannelSubject.jsx'
import ChatInput from './ChatInput.jsx'

const ChannelView = ({ channel }) => {
    const {user} = usePage().props.auth
    const [messages, setMessages] = useState(channel.messages)
    const messageEndRef = useRef(null);

    const title = useMemo(() => {
        return channel.members.filter(member => member.id !== user.id)
            .map(member => member.name)
            .join(', ');
    }, [user, channel.members]);

    useEffect(() => {
        Echo.channel(`chat.channels.${channel.id}.new_message`).listen(
            'ChatChannelNewMessage',
            (data) => {
                setMessages([...messages, data.message])
            }
        );

        return () => {
            Echo.leaveChannel(`chat.channels.${channel.id}.new_message`);
        };
    }, [channel.id, messages]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50/30 to-white/50">
            {/* Header */}
            <div className="px-6 py-4 bg-white/60 backdrop-blur-sm">
                <div className="text-lg font-semibold text-gray-800">
                    {title}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    {channel.members.length} members
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="">
                    {/* Property Subject */}
                    <div className="mb-8">
                        <ChannelSubject property={channel.subject}/>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-1">
                        {messages.map(message => (
                            <ChatMessage
                                key={`channel-${channel.id}-${message.id}`}
                                message={message}
                            />
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none">
                <ChatInput channel={channel}/>
            </div>
        </div>
    );
}

export default ChannelView;
