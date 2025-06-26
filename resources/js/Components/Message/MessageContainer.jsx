export default function MessageContainer({ messages, currentUserId }) {

    console.log(messages)
    return (
        <ul className=" h-[57vh] overflow-x-auto space-y-2">
            {messages.map((msg, index) => (

                <li
                    key={index}
                    className={`p-2 rounded max-w-sm ${
                        msg.sender_id === currentUserId
                            ? "ml-auto text-right"
                            : "text-left mr-auto"
                    }`}
                >
                    { msg.inquiry?.property.title && (
                        <div className='px-2 py-6'>{msg.inquiry?.property.title}</div>
                    )}
                    <div
                        className={`p-2 rounded max-w-sm ${
                            msg.sender_id === currentUserId
                                ? "bg-blue-100 ml-auto text-right"
                                : "bg-gray-200"
                        }`}
                    >
                        {msg.message}
                    </div>


                </li>
            ))}
        </ul>
    );
}
