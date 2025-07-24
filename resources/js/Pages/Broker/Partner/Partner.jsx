import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import { router } from "@inertiajs/react";
import AddPartner from "@/Pages/Broker/Partner/Modal/AddPartner.jsx";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DeveloperCard from "@/Pages/Broker/Partner/Card/DeveloperCard.jsx";

export default function Partner({ developers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);

    const handleAdd = () => {
        setSelectedDeveloper(null);
        setModalOpen(true);
    };

    const handleEdit = (developer) => {
        setSelectedDeveloper(developer);
        setModalOpen(true);
    };

    const handleDelete = (developerId) => {
        if (confirm("Are you sure you want to delete this partner?")) {
            router.delete(`/broker/partners/delete/${developerId}`, {
                onSuccess: () => toast.success("Partner deleted successfully"),
                onError: () => toast.error("Failed to delete partner."),
            });
        }
    };

    const handleClose = () => {
        setSelectedDeveloper(null);
        setModalOpen(false);
    };

    return (
        <BrokerLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Developer Partners</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-accent transition"
                >
                    + Add Partner
                </motion.button>
            </div>

            {developers?.length === 0 ? (
                <div className="flex justify-center items-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <img src="/images/empty-state.svg" alt="Empty State" className="w-48" />
                        <h2 className="text-xl font-bold text-gray-800">No Partner Developers</h2>
                        <p className="text-gray-700">You don't have any partner developers yet. Add one to get started.</p>
                        <button
                            onClick={handleAdd}
                            className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition"
                        >
                            + Add Partner
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
                    <div className="grid p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {developers.map((developer) => (
                            <DeveloperCard
                                key={developer.id}
                                developer={developer}
                                onEdit={() => handleEdit(developer)}
                                onDelete={() => handleDelete(developer.id)}
                                onView={() => router.visit(`/broker/partners/${developer.id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <AddPartner
                show={modalOpen}
                onClose={handleClose}
                initialValue={selectedDeveloper}
            />
        </BrokerLayout>
    );
}
