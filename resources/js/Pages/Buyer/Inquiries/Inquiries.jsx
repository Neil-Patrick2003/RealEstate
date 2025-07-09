import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDollarSign, faLocationDot, faMoneyBill} from "@fortawesome/free-solid-svg-icons";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";

export default function  Inquiries({inquiries}){
    return (
        <BuyerLayout>
            <div className='py-6 px-4'>
                <h1 className='text-primary text-2xl font-bold mb-2'>My Inquiries</h1>
                <p className='text-gray-500 font-semibold mb-6'>Track all your property inquiries and messages with agents</p>

                <div className='flex-center-between'>
                    <BuyerInquiriesFilterTab />
                    <p>Filter</p>
                </div>



                {inquiries.data.length === 0 ? (
                    <p>No inquiries yet.</p>
                ) : (
                    inquiries?.data.map((inquiry) => (
                        <div key={inquiry.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-6">
                                <div className="col-span-1 lg:col-span-3">
                                    <div className="relative rounded-lg overflow-hidden h-48">
                                        <img src={`/storage/${inquiry.property.image_url}`}
                                             alt="Cozy suburban house with backyard and porch swing"
                                             className="w-full h-full object-cover"/>
                                        <div
                                            className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                            ₱ {inquiry.property.price}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 lg:col-span-7">
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-1">{inquiry.property.title}</h3>
                                            <p className="text-gray-500 text-sm mb-3"><FontAwesomeIcon icon={faLocationDot}/> {inquiry.property.address}</p>

                                            <div className="flex items-center mb-4">
                                                <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                                    <img src="https://placehold.co/80x80"
                                                         alt="Portrait of real estate agent Michael Rodriguez"
                                                         className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{inquiry.agent.name}</p>
                                                    <p className="text-xs text-gray-500">4.8⭐ (76 reviews)</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-sm text-gray-600 truncate">{inquiry.messages.message}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 mt-4"><i
                                            className="far fa-clock mr-1"></i> Sent 1 day ago</p>
                                    </div>
                                </div>

                                <div className="col-span-1 lg:col-span-2 flex flex-col justify-between">
                                    <div className="flex justify-end">
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <i className="fas fa-clock mr-1"></i> {inquiry.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-col space-y-3 mt-4 lg:mt-0 lg:items-end">
                                        <button
                                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition">
                                            <i className="fas fa-reply mr-2"></i> Reply
                                        </button>
                                        <button
                                            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                                            <i className="fas fa-trash-alt mr-2"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}


            </div>
        </BuyerLayout>
    );
}
