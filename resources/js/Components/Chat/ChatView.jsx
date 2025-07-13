import ChannelItem from './ChannelItem.jsx'
import ChannelView from './ChannelView.jsx'

const ChatView = ({channels = [], channel = null}) => {
    return <div className="flex h-[calc(100vh-120px)] border">
        <div className="w-1/4 border-r">
            {channels.map(item => <ChannelItem key={item.id} channel={item} isActive={channel?.id === item.id}/>)}
        </div>

        <div className="w-3/4 h-full">
            {channel ?
                <ChannelView channel={channel}/> :
                <div className="flex justify-center items-center h-full">
                    No Messages to display.
                </div>
            }
        </div>
    </div>
}

export default ChatView
