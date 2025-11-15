import { Star, Home } from 'lucide-react';
import { calculateRating, getTopCharacteristics } from './AgentCompactCard';

export default function AgentDetailedCard({ agent, onClick }) {
    const displayRating = calculateRating(agent);
    const characteristics = getTopCharacteristics(agent, 3);

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
            {agent.photo_url ? (
                <img
                    src={`/storage/${agent.photo_url}`}
                    alt={agent.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white group-hover:border-emerald-100"
                />
            ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-lg font-semibold">
                    {agent.name?.charAt(0)}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold text-gray-700">{displayRating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Home className="w-3 h-3" />
                            <span>{agent.property_listings_count || 0} listings</span>
                        </div>
                    </div>
                </div>

                {agent.bio && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agent.bio}</p>
                )}

                {characteristics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {characteristics.map((char, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium"
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
