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
        <div className="flex h-[80vh] border border-gray-200 shadow-lg rounded-2xl bg-white">
            {/* Sidebar */}
            <div className="mt-2 w-1/4 min-h-[85vh] overflow-y-auto border-r border-gray-200 px-4">
                {/* Search Input */}
                <div className="mb-4 flex items-center border border-gray-300 rounded-md">
                    <FontAwesomeIcon icon={faSearch} className="ml-2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or property..."
                        className="w-full px-3 py-2 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filtered Channel List */}
                {filteredChannels.length > 0 ? (
                    filteredChannels.map(item => (
                        <ChannelItem
                            key={item.id}
                            channel={item}
                            isActive={channel?.id === item.id}
                            className="hover:bg-gray-100 transition duration-200"
                        />
                    ))
                ) : (
                    <div className="text-sm text-gray-500 text-center">No matching channels.</div>
                )}
            </div>

            {/* Main View */}
            <div className="w-3/4 h-full bg-gray-50 p-4">
                {channel ? (
                    <ChannelView channel={channel} />
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        No Messages to display.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
