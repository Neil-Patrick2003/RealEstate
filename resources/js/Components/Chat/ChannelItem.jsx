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
            className={`px-2 py-4 cursor-pointer w-full flex ${isActive ? 'bg-green-100': 'bg-transparent'}`}
            href={`${url.includes('agents') ? '/agents': '/seller'}/chat/channels/${channel.id}`}
        >
            {title}
        </Link>
}

export default ChannelItem
