import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { Link } from '@inertiajs/react';
import AddPartner from "@/Pages/Broker/Partner/Modal/AddPartner.jsx";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Partner() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <BrokerLayout>
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-2xl font-bold text-gray-800">Developer Partners</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-accent transition"
                >
                    + Add Partner
                </motion.button>
            </div>

            {/* Your table/listing goes here */}
            {/* Example: <PartnerList partners={partners} /> */}

            <AddPartner show={modalOpen} onClose={() => setModalOpen(false)} />
        </BrokerLayout>
    );
}
