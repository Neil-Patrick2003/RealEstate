import AgentLayout from "@/Layouts/AgentLayout.jsx";

export default function SellerPostProperty({properties}){
    return (
        <AgentLayout>
            <div className='grid grid-cols-1 md:grid-cols-2, lg:grid-cols-4 xl:grid-cols-6'>
                {properties.map((property) => (
                    <div key={property.id}
                    className='border rounded-lg'
                    className='border rounded-lg'
                    >
                        <div className='h-40 w-full flex-center justify-center  border-b'>
                            image preview
                        </div>
                        <div className='flex flex-col gap-y-4 p-2'>
                            <h1>{property.title}</h1>
                            <button className='border w-full py-1.5 rounded bg-secondary text-white'>Send Inquiry</button>
                        </div>


                    </div>
                ))}
            </div>
        </AgentLayout>
    )
}
