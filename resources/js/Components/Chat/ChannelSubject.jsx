
    const ChannelSubject = ({ property }) => {
        return (
            <div className="flex justify-center border-b mb-2 border-dashed items-center py-4 px-2">
                <div className="w-full max-w-sm bg-white/90 border border-gray-100 rounded-xl shadow-sm">
                    {/* Image */}
                    <div className="rounded-t-xl overflow-hidden">
                        <img
                            src={`/storage/${property.image_url}`}
                            alt={property.title}
                            className="w-full h-40 object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                            {property.title}
                        </h3>
                        {property.address && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {property.address}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };



export default ChannelSubject
