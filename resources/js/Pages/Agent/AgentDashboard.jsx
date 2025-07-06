import AgentLayout from "@/Layouts/AgentLayout.jsx";
import {Head} from "@inertiajs/react";

export default function  AgentDashboard(){
    return (

        <AgentLayout>
            <Head title="Dashboard" />

            <div className='grid grid-cols-2 md:grid-cols-4'>
                <div className='p-6 border rounded-xl'>
                    <p className='text-primary font-bold uppercase'>Total Listing</p>
                </div>
            </div>
        </AgentLayout>
    )
}
