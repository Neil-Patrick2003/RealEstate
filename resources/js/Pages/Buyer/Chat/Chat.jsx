import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatView from '@/Components/Chat/ChatView.jsx'
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import PageHeader from "@/Components/ui/PageHeader.jsx";

const Chat = ({ channel = null, channels = [] }) => {
    return (
        <BuyerLayout>
            <PageHeader title="Chat"/>
            <div className='h-[75vh]'>
                <ChatView channels={channels} channel={channel}/>
            </div>

        </BuyerLayout>
    );}

export default Chat;
