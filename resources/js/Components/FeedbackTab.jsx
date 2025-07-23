import { StarIcon } from '@heroicons/react/24/solid'

function FeedbackTab({ feedbacks }) {
    if (!feedbacks?.length) return <p className="text-gray-500">No feedback yet.</p>

    const categories = ['communication', 'negotiation', 'professionalism', 'knowledge']

    // Calculate average
    const totalRatings = feedbacks.length * categories.length
    const sum = feedbacks.reduce((acc, f) => {
        return acc + categories.reduce((catAcc, cat) => catAcc + f[cat], 0)
    }, 0)
    const average = (sum / totalRatings).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Average Rating */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Average Rating: {average} / 5</h2>
                <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(average) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Individual Feedbacks */}
            {feedbacks.map((f, idx) => (
                <div key={f.id || idx} className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm">
                        {categories.map((cat) => (
                            <div key={cat}>
                                <span className="capitalize text-gray-500">{cat}:</span>{' '}
                                <span className="font-medium text-gray-800">{f[cat]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Characteristics */}
                    {f.characteristics?.length >     0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {f.characteristics.map((char) => (
                                <span
                                    key={char.id}
                                    className="bg-green-100 text-primary text-xs font-medium px-3 py-1 rounded-full"
                                >
                                  {char.characteristic}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Comment */}
                    {f.comments && (
                        <p className="text-gray-700 italic text-sm border-t pt-2 mt-2">“{f.comments}”</p>
                    )}
                </div>
            ))}
        </div>
    )
}

export default FeedbackTab;
