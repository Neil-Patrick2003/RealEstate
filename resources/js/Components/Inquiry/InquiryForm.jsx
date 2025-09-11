import React from "react";
import Modal from "@/Components/Modal.jsx";

export default function InquiryForm({
                                         show, onClose, person, message, onChangeMessage, onSubmit, processing
                                     }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 bg-white rounded-xl shadow-lg transition-transform transform-gpu relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                    aria-label="Close modal"
                >
                    &times;
                </button>

                {/* Person Info */}
                <div className="flex items-center gap-4 mb-6">
                    {person?.photo_url ? (
                        <img
                            src={`/storage/${person.photo_url}`}
                            alt={`${person.name}'s Avatar`}
                            className="w-14 h-14 rounded-full object-cover border border-gray-300"
                        />
                    ) : (
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-lg font-semibold border border-gray-300">
                            {person?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{person?.name}</h3>
                        <p className="text-sm text-gray-500">
                            {person?.role === 'Agent' ? 'Real Estate Agent' :
                                person?.role === 'Broker' ? 'Licensed Broker' : 'Seller'}
                        </p>
                    </div>
                </div>

                {/* Message Box */}
                <div className="mb-4">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Send a quick message
                    </label>
                    <textarea
                        id="message"
                        rows={4}
                        maxLength={250}
                        placeholder="Hi, I'm interested in this property. Please contact me..."
                        value={message}
                        onChange={(e) => onChangeMessage(e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-700 resize-none transition-shadow duration-200"
                    />
                    <p className="text-sm text-gray-500 mt-1">{`${message.length}/250`}</p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        disabled={processing}
                        onClick={onSubmit}
                        className="bg-primary text-white font-medium px-5 py-2 rounded-md hover:bg-primary/90 transition duration-200 shadow-sm"
                    >
                        {processing ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
