import AgentLayout from "@/Layouts/AgentLayout.jsx";
import ChatHeader from "@/Components/Message/ChatHeader.jsx";
import MessageContainer from "@/Components/Message/MessageContainer.jsx";
import { useEffect, useState } from "react";
import {router, useForm, usePage} from "@inertiajs/react";

export default function Inquiries({ users, messages = [], selectedChatId = null }) {
    const [selectedChat, setSelectedChat] = useState(selectedChatId);
    const auth = usePage().props.auth;
    const {data, setData, post, errors, processing, reset} = useForm({
        message: ''
    })

    // 🧠 Sync local state with selectedChatId from server when page updates
    useEffect(() => {
        setSelectedChat(selectedChatId);
    }, [selectedChatId]);

    const handleChatSelect = (id) => {
        setSelectedChat(id); // local state for UI responsiveness
        router.get(`/agents/messages/${id}`, {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['messages', 'selectedChatId', 'users'], // ensure users stay
        });
    };

    //handle submit form to send message
    function handleMessageSubmit(e) {
        e.preventDefault();

        if (!selectedChat) {
            alert("Please select a user to send a message to.");
            return;
        }

        post(`/agents/messages/${selectedChat}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    }

    const getInitials = (name) => {
        if (!name) return "";
        return name.trim().split(" ").map(word => word[0]).join("").toUpperCase();
    };

    const imageUrl = '/storage/'; // Base path for property images




    return (
        <AgentLayout>
            <div className="text-xl font-semibold ">Messages</div>

            <div className="h-[75vh] border rounded-xl mt-6 flex">
                {/* Left panel: chat user list */}
                <div className="w-1/5 border-r p-4 bg-gray-100 rounded-l-xl">
                    <input
                        name='searchName'
                        className="border w-full border-gray-200 rounded-2xl px-3 py-2"
                        placeholder="Search..."
                    />
                    <ul className="mt-4 space-y-2">
                        {users?.length === 0 ? (
                            <p className="text-gray-500">No inquiries yet</p>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className={` py-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                        selectedChat === user.id ? "bg-gray-200" : ""
                                    }`}
                                    onClick={() => handleChatSelect(user.id)}
                                >
                                    <div className="flex-center font-medium gap-1" >
                                        <span className='border rounded-full text-xs font-medium p-1 text-white bg-primary'>{getInitials(user.name)}</span>
                                        {user.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </ul>
                </div>

                {/* Right panel: messages */}
                <div className="w-4/5 overflow-y-auto">
                    {selectedChat ? (
                        <>


                            <ChatHeader
                                user={users.find(user => String(user.id) === String(selectedChat)) ?? null}
                                getInitials={getInitials}
                            />
                            <div className="">
                                <MessageContainer
                                    getInitials={getInitials}
                                    messages={messages}
                                    selectedChatId={selectedChat}
                                    currentUserId={auth.user.id} // ✅ pass current user ID
                                />
                            </div>


                            {/*message text feild and button*/}
                            <div className='mt-2 p-4 border-t'>
                                <form onSubmit={handleMessageSubmit} className='flex-center-between  gap-x-2 '>
                                    <input
                                        name='message'
                                        className='w-full py-1.5 rounded-md border-gray-400'
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                    />
                                    <button type='submit' className='border bg-secondary text-white py-1.5 px-4  rounded-lg cursor-pointer'>Send</button>
                                </form>

                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 text-lg italic">
                            Please select a chat to begin
                        </div>
                    )}
                </div>
            </div>
        </AgentLayout>
    );
}
