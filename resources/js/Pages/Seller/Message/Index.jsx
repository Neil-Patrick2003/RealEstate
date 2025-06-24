import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);
dayjs.locale('en');

export default function Index({ users, messages = [], auth }) {
  const { data, setData, post, reset } = useForm({ message: '' });

  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [search, setSearch] = useState('');
  const chatRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!selectedId || !data.message.trim()) return;

    post(`/messages/${selectedId}/sent_message`, {
      onSuccess: () => {
        reset();
        router.reload({ only: ['messages'] });
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

  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === auth.id && msg.receiver_id === selectedId) ||
      (msg.receiver_id === auth.id && msg.sender_id === selectedId)
  );

  return (
    <AuthenticatedLayout>
      <div className="h-[85vh] flex border rounded-xl shadow overflow-hidden bg-white">
        {/* Sidebar */}
        <aside className="w-1/4 border-r bg-gray-50 flex flex-col">
          <div className="p-3">
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <ul className="overflow-y-auto flex-1 px-2 space-y-1 pb-2">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  setSelectedId(user.id);
                  setSelectedName(user.name);
                }}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                  selectedId === user.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white text-lg font-bold uppercase">
                  {user.name.charAt(0)}
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 text-sm">
                  <p>{user.name}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <section className="w-3/4 flex flex-col">
          {/* Header */}
          <header className="p-4 border-b bg-white shadow-sm">
            <h2 className="text-lg font-medium">
              {selectedName ? (
                <>
                  Chat with: <span className="text-primary">{selectedName}</span>
                </>
              ) : (
                <span className="text-gray-400">Select a user</span>
              )}
            </h2>
          </header>

          {/* Messages */}
          <main
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100"
          >
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, i) => {
                const isOwn = msg.sender_id === auth.id;
                const senderInitial = users.find(u => u.id === msg.sender_id)?.name?.[0]?.toUpperCase() || '?';

                return (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Anovatar */}
                    {!isOwn && (
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {senderInitial}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm relative ${
                        isOwn
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white text-gray-800 border rounded-bl-none'
                      }`}
                    >
                      <p className="break-words whitespace-pre-line">{msg.message}</p>
                      <div className="text-[10px] mt-1 text-gray-400 text-right">
                        {dayjs(msg.created_at).fromNow()}
                        {isOwn && <span className="ml-2 text-green-200">✔</span>}
                      </div>
                    </div>
                  </div>
                );
              })
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
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-2 rounded-full hover:bg-orange-600"
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
}
