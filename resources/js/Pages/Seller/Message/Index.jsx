import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

const Index = ({ users, messages = [], auth }) => {
  const { data, setData, post, reset } = useForm({ message: '' });

  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const chatRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!selectedId || !data.message.trim()) return;

    post(`/messages/${selectedId}/sent_message`, {
      onSuccess: () => {
        reset();
        router.reload({ only: ['messages'] }); // reload messages only
      },
    });
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedId]);

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === auth.id && msg.receiver_id === selectedId) ||
      (msg.receiver_id === auth.id && msg.sender_id === selectedId)
  );

  return (
    <AuthenticatedLayout>
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="flex h-[80vh] border rounded-xl shadow overflow-hidden">
        {/* User List */}
        <aside className="w-1/4 border-r bg-gray-50 overflow-y-auto p-3">
          <h2 className="text-md font-semibold mb-2">Contacts</h2>
          <ul className="space-y-1">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  setSelectedId(user.id);
                  setSelectedName(user.name);
                }}
                className={`cursor-pointer px-3 py-2 rounded ${
                  selectedId === user.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'hover:bg-gray-200'
                }`}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Message Thread */}
        <section className="w-3/4 flex flex-col justify-between">
          <header className="p-4 border-b bg-white shadow-sm">
            <h2 className="text-lg font-medium">
              Chat with: {selectedName || <span className="text-gray-400">Select a user</span>}
            </h2>
          </header>

          {/* Messages */}
          <main
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100"
          >
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
                    msg.sender_id === auth.id
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'mr-auto bg-white text-gray-800 border'
                  }`}
                >
                  {msg.message}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No messages yet.</p>
            )}
          </main>

          {/* Input */}
          {selectedId && (
            <footer className="border-t p-3 bg-white">
              <form onSubmit={submit} className="flex gap-2">
                <input
                  type="text"
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </footer>
          )}
        </section>
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
