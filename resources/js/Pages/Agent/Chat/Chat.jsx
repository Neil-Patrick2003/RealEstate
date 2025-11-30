import ChatView from '@/Components/Chat/ChatView.jsx'
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

const Chat = ({ channel = null, channels = [] }) => {
    return <AuthenticatedLayout>
        <ChatView channels={channels} channel={channel}/>
    </AuthenticatedLayout>
}

export default Chat;
