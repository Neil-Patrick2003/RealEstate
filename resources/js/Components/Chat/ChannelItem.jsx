import {usePage} from '@inertiajs/react';
import {useMemo} from 'react';

const ChannelItem = ({ channel, isActive = false}) => {
    const {user} = usePage().props.auth

    const title = useMemo(() => {
        return channel.members.filter(member => member.id !== user.id)
            .map(member => member.name)
            .join(',');
    }, [user, channel.members]);

    return <div className={`px-2 py-4 cursor-pointer ${isActive ? 'bg-green-100': 'bg-transparent'}`}>
        {title}
    </div>
}

export default ChannelItem
