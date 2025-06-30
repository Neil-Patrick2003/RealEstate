import AgentLayout from "@/Layouts/AgentLayout.jsx";

export default function Properties() {
    return (
        <AgentLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">My Property Listings</h1>
                <p className="text-gray-700 mb-6">
                    This is the agent dashboard page where you can view and manage the property listings you handle for sellers. Keep track of active, pending, or sold properties easily from here.
                </p>

                {/* Property listings will go here */}
            </div>
        </AgentLayout>
    );
}
