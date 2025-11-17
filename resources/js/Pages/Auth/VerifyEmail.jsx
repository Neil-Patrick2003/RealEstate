import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        console.log('submit');
        e.preventDefault();
        post(route('verification.send'));
    };

    // Auto-focus the first interactive element for better accessibility
    useEffect(() => {
        document.querySelector('button[type="submit"]')?.focus();
    }, []);

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Verify Your Email Address
                    </h1>
                    <div className="w-12 h-1 bg-indigo-600 mx-auto rounded"></div>
                </div>

                {/* Status Messages */}
                {status === 'verification-link-sent' && (
                    <div
                        className="p-4 rounded-md bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                A new verification link has been sent to your email address.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="font-semibold text-gray-900 dark:text-white">
                                        Welcome aboard!
                                    </strong>{' '}
                                    Before you can get started, we need to verify your email address.
                                    Click the link in the verification email we sent to you.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="font-semibold">Didn't receive the email?</strong>{' '}
                                    Check your spam folder or request a new verification link below.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <form onSubmit={submit} className="mt-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <button
                                className="bg-gradient-to-r rounded-lg from-primary to-accent text-white px-4 py-2 w-full cursor-pointer sm:w-auto min-w-[200px] flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Resend Verification Email
                                    </>
                                )}
                            </button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full sm:w-auto text-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-md border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Having trouble?{' '}
                        <Link
                            href='/help'
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline transition-colors duration-200"
                        >
                            Contact support
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
