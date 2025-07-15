import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatView from '@/Components/Chat/ChatView.jsx'
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";

const Chat = ({ channel = null, channels = [] }) => {
    return <BuyerLayout>
        <ChatView channels={channels} channel={channel}/>
    </BuyerLayout>
}

export default Chat;
