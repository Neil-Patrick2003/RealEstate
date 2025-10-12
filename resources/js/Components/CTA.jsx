import { Link } from '@inertiajs/react';

export default function CTA() {
    return (
        <div className="bg-primary py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center border rounded-2xl p-8 bg-primary">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-lg text-white mb-6">
                            Sign up for our newsletter and stay updated on our latest features and announcements.
                        </p>
                        <Link
                                    href="/register"
                            className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
