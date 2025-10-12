import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";

export default function ChatHeader({ user, getInitials }) {


    return (

        <div className="px-4 py-3 border-b bg-white shadow-sm">
            <header className='flex-center-between'>

                <h2 className="flex-center gap-2 rounded-xl text-lg font-medium">
                    <p className='font-bold text-white text-xs bg-primary rounded-full px-1 py-1.5 cursor-pointer'>{getInitials(user.name)}</p>

                    {user ? (
                        <>
                            <span className="text-gray-400 cursor-pointer">{user.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Select a user</span>
                    )}
                </h2>
                <div>
                    <FontAwesomeIcon icon={faCircleInfo} className='text-gray-400 h-5 w-5'/>
                </div>
            </header>
        </div>
    );
}
