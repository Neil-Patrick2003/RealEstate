import React, { useState, useEffect } from 'react';
import ImageModal from "@/Components/modal/ImageModal.jsx";

export default function ImageGallery({ images, image_url }) {
    const [visible, setVisible] = useState([]);
    const [openImage, setOpenImage] = useState(false);



    useEffect(() => {
        const resize = () => {
            const desktop = window.innerWidth >= 768;
            setVisible(desktop ? images.slice(0, 2) : images);
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [images]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in delay-100">
            <div className="md:col-span-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg image-container relative">
                <img src={`/storage/${image_url}`} alt={image_url} className="w-full h-full object-cover"/>
                <div className="image-overlay">
                    <h3 className="text-xl font-semibold">Premium Sustainable Living</h3>
                </div>

            </div>


            {/*thumbnaiks*/}

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {visible.map((image, index) => {
                    const isLast = index === visible.length - 1;
                    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
                    const moreCount = images.length - visible.length;

                    return (
                        <div key={image.id} className="h-[190px] md:h-[242px] rounded-2xl overflow-hidden shadow-md image-container relative"
                             onClick={() => isLast && isDesktop && images.length > 2 && setOpenImage(true)}
                        >
                            <img src={`/storage/${image.image_url}`} alt="Spacious living room with modern furniture, large windows, and wooden floors in the featured property" className="w-full h-full object-cover"/>
                            <div className="image-overlay">
                                <h3 className="text-lg font-medium">Elegant Living Space</h3>
                            </div>
                            {isLast && isDesktop && images.length > 2 && (
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm md:text-base backdrop-blur-sm group-hover:bg-opacity-50">
                                    <button onClick={() => setOpenImage(true)}>+{moreCount} more</button>
                                </div>
                            )}
                        </div>
                    );
                })}


                <ImageModal show={openImage} onClose={() => setOpenImage(false)}>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img) => (
                            <img
                                key={img.id}
                                src={`/storage/${img.image_url}`}
                                alt={`Image ${img.id}`}
                                className="w-full h-48 object-cover rounded-lg shadow"
                            />
                        ))}
                    </div>
                </ImageModal>

            </div>
        </div>
    );
}
