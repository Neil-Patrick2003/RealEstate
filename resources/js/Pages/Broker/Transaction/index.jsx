import BrokerLayout from "@/Layouts/BrokerLayout.jsx";

export default function Transaction() {
    return (
        <BrokerLayout>
            <h1 className='text-2xl font-bold mb-4  '>Transaction History</h1>
            <p className='text-gray-500'>
                A complete history of all transactions made by your partners.
            </p>
            {/* Add transaction table or filters here */}
        </BrokerLayout>
    );
}
