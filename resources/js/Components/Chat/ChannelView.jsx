import {useMemo} from "react";
import {usePage} from "@inertiajs/react";
import ChatMessage from './ChatMessage.jsx'
import ChannelSubject from './ChannelSubject.jsx'
import ChatInput from './ChatInput.jsx'

const ChannelView = ({ channel }) => {
    const {user} = usePage().props.auth

    const title = useMemo(() => {
        return channel.members.filter(member => member.id !== user.id)
            .map(member => member.name)
            .join(',');
    }, [user, channel.members]);

    return <div className="flex flex-col h-full">
        <div className="border-b px-2 py-4">
            {title}
        </div>

        <div className="grow overflow-y-scroll py-5 px-2">
            <div>
                <ChannelSubject property={channel.subject}/>
            </div>

            <div>
                {channel.messages.map(message => <ChatMessage key={`channel-${channel.id}-${message.id}`} message={message}/>)}
            </div>
        </div>

        <div className="h-28 border-t flex-none">
            <ChatInput channel={channel}/>
        </div>
    </div>
}


export default ChannelView;
