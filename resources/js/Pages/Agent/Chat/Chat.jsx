import AgentLayout from '@/Layouts/AgentLayout.jsx';
import ChatView from '@/Components/Chat/ChatView.jsx'

const Chat = ({ channel = null, channels = [] }) => {
    return <AgentLayout>
        <ChatView channels={channels} channel={channel}/>
    </AgentLayout>
}

export default Chat;
