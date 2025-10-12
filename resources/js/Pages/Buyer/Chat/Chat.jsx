import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatView from '@/Components/Chat/ChatView.jsx'
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";

const Chat = ({ channel = null, channels = [] }) => {
    return (
        <BuyerLayout>
            <div className='mt-20'>
                <ChatView channels={channels} channel={channel}/>
            </div>

        </BuyerLayout>
    );}

export default Chat;
