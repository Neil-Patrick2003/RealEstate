import AgentLayout from "@/Layouts/AgentLayout.jsx";
import {Head} from "@inertiajs/react";

export default function  AgentDashboard(){
    return (

        <AgentLayout>
            <Head title="Dashboard" />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='p-6 shadow-md rounded-2xl'>
                    <p className='text-primary font-bold uppercase'>Total Listing</p>
                </div>
                <div className='p-6 shadow rounded-xl'>
                    <p className='text-primary font-bold uppercase'>Total Listing</p>
                </div>
                <div className='p-6 shadow rounded-xl'>
                    <p className='text-primary font-bold uppercase'>Total Listing</p>
                </div>
            </div>
        </AgentLayout>
    )
}
