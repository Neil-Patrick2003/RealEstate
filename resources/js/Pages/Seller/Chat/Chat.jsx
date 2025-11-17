import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatView from '@/Components/Chat/ChatView.jsx'

const Chat = ({ channel = null, channels = [] }) => {

    return <AuthenticatedLayout>
        haha
        <ChatView channels={channels} channel={channel}/>
    </AuthenticatedLayout>
}

export default Chat;
