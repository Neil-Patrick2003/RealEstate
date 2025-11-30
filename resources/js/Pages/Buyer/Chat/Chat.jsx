import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatView from '@/Components/Chat/ChatView.jsx'
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import PageHeader from "@/Components/ui/PageHeader.jsx";

const Chat = ({ channel = null, channels = [] }) => {
    return (
        <AuthenticatedLayout>
            <div className='h-[75vh]'>
                <ChatView channels={channels} channel={channel}/>
            </div>

        </AuthenticatedLayout>
    );}

export default Chat;
