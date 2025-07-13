import AgentLayout from "@/Layouts/AgentLayout.jsx";
import {Head} from "@inertiajs/react";

export default function  AgentDashboard({properties}){

    const totalListings = properties.length;

    const publishedListings = properties.filter(p => p.status === 'Published').length;

    const assignedListings = properties.filter(p => p.status === 'Assigned').length;

    return (

        <AgentLayout>
            <Head title="Dashboard" />


            {/*card header*/}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl'>
                    <p className='text-gray-400 font-semibold text-sm'>Total Listing</p>
                    <p className='text-3xl font-bold text-primary'>
                        {totalListings}
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                         aria-hidden="true" role="img"
                         className="iconify iconify--solar minimal__iconify__root css-vwvpzv" id="«ra8»"
                         width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor"  d="M5 17.75a.75.75 0 0 1-.488-1.32l7-6a.75.75 0 0 1 .976 0l7 6A.75.75 0 0 1 19 17.75z" opacity="0.4"></path><path
                        fill="currentColor" fillRule="evenodd"
                        d="M4.43 13.488a.75.75 0 0 0 1.058.081L12 7.988l6.512 5.581a.75.75 0 1 0 .976-1.138l-7-6a.75.75 0 0 0-.976 0l-7 6a.75.75 0 0 0-.081 1.057"
                        clipRule="evenodd"></path>
                    </svg>
                </div>
                <div className='flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl'>
                    <p className='text-gray-400 font-semibold text-sm'>Published</p>
                    <p className='text-3xl font-bold text-primary'>
                        {publishedListings}
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                         aria-hidden="true" role="img"
                         className="iconify iconify--solar minimal__iconify__root css-vwvpzv" id="«ra8»"
                         width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor"  d="M5 17.75a.75.75 0 0 1-.488-1.32l7-6a.75.75 0 0 1 .976 0l7 6A.75.75 0 0 1 19 17.75z" opacity="0.4"></path><path
                        fill="currentColor" fillRule="evenodd"
                        d="M4.43 13.488a.75.75 0 0 0 1.058.081L12 7.988l6.512 5.581a.75.75 0 1 0 .976-1.138l-7-6a.75.75 0 0 0-.976 0l-7 6a.75.75 0 0 0-.081 1.057"
                        clipRule="evenodd"></path>
                    </svg>
                </div>
                <div className='flex flex-col gap-4 px-6 py-4 shadow-sm border border-gray-100 rounded-3xl'>
                    <p className='text-gray-400 font-semibold text-sm'>Unpublished</p>
                    <p className='text-3xl font-bold text-primary'>
                        {assignedListings}
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                         aria-hidden="true" role="img"
                         className="iconify iconify--solar minimal__iconify__root css-vwvpzv" id="«ra8»"
                         width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor"  d="M5 17.75a.75.75 0 0 1-.488-1.32l7-6a.75.75 0 0 1 .976 0l7 6A.75.75 0 0 1 19 17.75z" opacity="0.4"></path><path
                        fill="currentColor" fillRule="evenodd"
                        d="M4.43 13.488a.75.75 0 0 0 1.058.081L12 7.988l6.512 5.581a.75.75 0 1 0 .976-1.138l-7-6a.75.75 0 0 0-.976 0l-7 6a.75.75 0 0 0-.081 1.057"
                        clipRule="evenodd"></path>
                    </svg>
                </div>

            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 mt-5'>
                <div className='col-span-1 md:col-span-2 bg-gray-100 rounded-3xl p-2'>
                    <div className='bg-white flex rounded-2xl p-2'>
                        <div>1</div>
                        <div>1</div>
                    </div>
                </div>
                <div>1</div>
            </div>
        </AgentLayout>
    )
}
