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
            .join(',');
    }, [user, channel.members]);

    useEffect(() => {
            Echo.channel(`chat.channels.${channel.id}.new_message`).listen(
            'ChatChannelNewMessage',
            (data) => {
                setMessages([...messages, data.message])
            }
        );

        return () => {
            Echo.leaveChannel(`chat.channels.${channel.id}.new_message}`);
        };
    }, [channel.id, messages]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);



    return <div className="flex flex-col h-full">
        <div className="border-b  rounded-tr-xl  text-primary font-semibold  px-6 py-8">
            {title}
        </div>

        <div className="grow overflow-y-scroll py-5 px-2">
            <div>
                <ChannelSubject property={channel.subject}/>
            </div>

            <div>
                {messages.map(message => <ChatMessage   key={`channel-${channel.id}-${message.id}`} message={message}/>)}
                <div ref={messageEndRef} />
            </div>
        </div>

        <div className="h-28 border-t flex-none">
            <ChatInput channel={channel}/>
        </div>
    </div>
}


export default ChannelView;
