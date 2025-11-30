import { useState, useMemo } from 'react';
import ChannelItem from './ChannelItem.jsx';
import ChannelView from './ChannelView.jsx';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

const ChatView = ({ channels = [], channel = null }) => {
    const [search, setSearch] = useState('');

    // Filter channels by member name or property title
    const filteredChannels = useMemo(() => {
        const searchTerm = search.toLowerCase();
        return channels.filter(channel => {
            const memberNames = (channel.members || [])
                .map(m => m.name.toLowerCase())
                .join(' ');

            const propertyTitle = channel?.subject?.title?.toLowerCase() || '';

            return (
                memberNames.includes(searchTerm) ||
                propertyTitle.includes(searchTerm)
            );
        });
    }, [channels, search]);

    return (
        <div className="flex mt-10 h-[80vh] rounded-2xl border bg-white">
            {/* Sidebar */}
            <div className="mt-2 w-1/4 min-h-[85vh] overflow-y-auto bg-gray-50/60 px-4">
                {/* Search Input */}
                <div className="mb-6 flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-sm">
                    <FontAwesomeIcon icon={faSearch} className="ml-1 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or property..."
                        className="w-full px-3 py-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder-gray-400"
                    />
                </div>

                {/* Filtered Channel List */}
                {filteredChannels.length > 0 ? (
                    <div className=" relative overflow-auto h-[70vh] space-y-1">
                        {filteredChannels.map(item => (
                            <ChannelItem
                                key={item.id}
                                channel={item}
                                isActive={channel?.id === item.id}
                                className="hover:bg-white/70 transition-all duration-200 rounded-xl"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 text-center py-8">No matching channels</div>
                )}
            </div>

            {/* Main View */}
            <div className="w-3/4 h-full bg-gradient-to-br from-gray-50/80 to-white/50 p-6">
                {channel ? (
                    <ChannelView channel={channel} />
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
