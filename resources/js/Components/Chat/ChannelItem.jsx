import {usePage, Link} from '@inertiajs/react';
import {useMemo} from 'react';

const ChannelItem = ({ channel, isActive = false}) => {
    const {user} = usePage().props.auth
    const { url } = usePage();

    const title = useMemo(() => {
        return channel.members.filter(member => member.id !== user.id)
            .map(member => member.name)
            .join(',');
    }, [user, channel.members]);

    return <Link
            href={`${url.includes('agents') ? '/agents' : '/seller'}/chat/channels/${channel.id}`}
            className={`group flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-green-100 text-primary' : 'hover:bg-gray-100 text-gray-700'}
        `}
        >
        <span
                className="w-10 h-10 rounded-full bg-secondary text-white font-semibold flex items-center justify-center mr-3 shadow-sm text-sm uppercase"
            >
            {title?.charAt(0) || '?'}
        </span>

        <div className="flex-1 truncate font-medium text-sm group-hover:text-primary">
            {title}
        </div>
    </Link>
}

export default ChannelItem
