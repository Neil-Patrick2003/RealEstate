import { Star, Home } from 'lucide-react';

export default function AgentCompactCard({ agent, onClick }) {
    const displayRating = calculateRating(agent);
    const characteristics = getTopCharacteristics(agent, 2);

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer group"
        >
            {agent.photo_url ? (
                <img
                    src={`/storage/${agent.photo_url}`}
                    alt={agent.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 group-hover:border-emerald-300"
                />
            ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
                    {agent.name?.charAt(0)}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{agent.name}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-semibold text-gray-700">{displayRating.toFixed(1)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Home className="w-3 h-3" />
                    <span>{agent.property_listings_count || 0} listings</span>
                    {characteristics.length > 0 && (
                        <>
                            <span>•</span>
                            <span>{characteristics.join(' • ')}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper functions
export function calculateRating(agent) {
    let averageRating = 0;
    if (agent.feedback_received?.length > 0) {
        const validFeedbacks = agent.feedback_received.filter(feedback =>
            feedback.communication && feedback.negotiation &&
            feedback.professionalism && feedback.knowledge
        );
        if (validFeedbacks.length > 0) {
            const totalRating = validFeedbacks.reduce((sum, feedback) => {
                const ratings = [
                    Number(feedback.communication) || 0,
                    Number(feedback.negotiation) || 0,
                    Number(feedback.professionalism) || 0,
                    Number(feedback.knowledge) || 0
                ];
                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                return sum + avg;
            }, 0);
            averageRating = totalRating / validFeedbacks.length;
        }
    } else if (agent.rating) {
        averageRating = Number(agent.rating) || 0;
    }
    return isNaN(averageRating) ? 0 : averageRating;
}

export function getTopCharacteristics(agent, limit = 3) {
    const characteristics = agent.feedback_received?.flatMap(feedback =>
        feedback.characteristics?.map(char => char.characteristic) || []
    ) || [];
    return [...new Set(characteristics)].slice(0, limit);
}
