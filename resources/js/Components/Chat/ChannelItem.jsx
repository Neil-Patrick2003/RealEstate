import { usePage, Link } from '@inertiajs/react';
import { useMemo } from 'react';

const getBasePath = (url) => {
    if (url.includes('agents')) return '/agents/';
    if (url.includes('broker')) return '/brokers/';
    if (url.includes('seller')) return '/seller/';
    if (url.includes('buyer')) return '/';
    return '/';
};

const ChannelItem = ({ channel, isActive = false }) => {
    const { user } = usePage().props.auth;
    const { url } = usePage();

    const title = useMemo(() => {
        return (channel.members || [])
            .filter(member => member.id !== user.id)
            .map(member => member.name)
            .join(', ');
    }, [user, channel.members]);

    const unreadCount = channel.unread_count ?? 0;
    const hasUnread = unreadCount > 0;

    const href = `${getBasePath(url)}chat/channels/${channel.id}`;

    return (
        <Link
            href={href}
            className={[
                'group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200',
                'border border-transparent',
                'hover:border-gray-200 hover:bg-gray-50',
                isActive
                    ? 'bg-green-50 border-green-200 text-primary'
                    : 'text-gray-700',
                hasUnread && !isActive ? 'bg-gray-50' : '',
            ].join(' ')}
        >
            {/* Avatar */}
            <div className="relative">
                <span
                    className="w-10 h-10 rounded-full bg-secondary text-white font-semibold flex items-center justify-center shadow-sm text-sm uppercase"
                >
                    {title?.charAt(0) || '?'}
                </span>

                {/* Tiny ring when unread */}
                {hasUnread && (
                    <span className="absolute -right-0.5 -bottom-0.5 inline-flex h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
            </div>

            {/* Text area */}
            <div className="flex-1 min-w-0 text-sm">
                <div className="flex items-center justify-between gap-2">
                    {/* Name */}
                    <div
                        className={[
                            'truncate',
                            hasUnread
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-700 group-hover:text-primary',
                        ].join(' ')}
                    >
                        {title || 'Conversation'}
                    </div>

                    {/* Dot or badge when unread */}
                    {hasUnread && (
                        <span className="inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full bg-green-500 text-[10px] text-white font-semibold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>

                {/* Property title / subject */}
                {channel?.subject?.title && (
                    <div
                        className={[
                            'truncate text-xs mt-0.5',
                            hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500',
                        ].join(' ')}
                    >
                        {channel.subject.title}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ChannelItem;
