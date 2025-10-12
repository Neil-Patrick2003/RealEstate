export default function TrippingStats({ count = 0, title, icon, bgColor = "bg-green-100" }) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
                <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
