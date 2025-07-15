import React from 'react';
import { Link } from '@inertiajs/react'; // or react-router-dom if you're using that

const ProfileProgress = ({ user }) => {
    // Calculate progress based on filled fields
    const calculateProgress = () => {
        const fields = [
            user?.name,
            user?.email,
            user?.contact_number,
            user?.address,
            user?.photo_url,
            user?.phone,
            user?.bio,
        ];

        const filledCount = fields.filter(Boolean).length;
        return Math.min((filledCount / fields.length) * 100, 100);
    };

    const progress = calculateProgress();

    return (
        <div className=" mx-auto bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Completion</h2>

            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner mb-3">
                <div
                    className={`h-5 rounded-full transition-all duration-700 ease-in-out
            ${progress < 40 ? 'bg-red-400' : progress < 80 ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <p className="text-gray-600 mb-4 font-medium">{Math.round(progress)}% complete</p>

            {progress < 100 && (
                <p className="text-sm text-gray-500 mb-4">
                    Complete your profile to unlock all features and get the most out of your account.
                </p>
            )}

            <Link
                href="/profile"
                className="inline-block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg shadow-md transition-colors duration-300"
            >
                Go to Profile
            </Link>
        </div>
    );
};

export default ProfileProgress;
