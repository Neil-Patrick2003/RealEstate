import InputError from '@/Components/InputError';
import {useForm, Link, router} from '@inertiajs/react';
import React from 'react'
import { motion } from 'framer-motion';
import Modal from "@/Components/Modal.jsx";
import LoadingText from "@/Components/Loding/LoadingText.jsx";

const SigninForm = ({ buttonClasses, buttonForGFT, toggleSignUpMode }) => {
    const [openSignUpModal, setOpenSignUpModal] = React.useState(false);
    const [redirecting, setRedirecting] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});
    const [touched, setTouched] = React.useState({
        email: false,
        password: false
    });
    const [showPassword, setShowPassword] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Validation rules
    const validateField = (name, value) => {
        const newErrors = { ...validationErrors };

        switch (name) {
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 1) {
                    newErrors.password = 'Password is required';
                } else {
                    delete newErrors.password;
                }
                break;

            default:
                break;
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate all fields
    const validateForm = () => {
        const fieldsToValidate = ['email', 'password'];
        let isValid = true;

        fieldsToValidate.forEach(field => {
            if (!validateField(field, data[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    // Handle field blur
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, data[field]);
    };

    // Handle field change with validation
    const handleChange = (field, value) => {
        setData(field, value);

        // Validate field if it has been touched before
        if (touched[field]) {
            validateField(field, value);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            email: true,
            password: true
        });

        // Validate all fields
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }

        post(route('login'));
    };

    const handleRoleClick = () => {
        window.location.href = '/google/auth';
    };

    // Check if form is valid for submit button
    const isFormValid = () => {
        return Object.keys(validationErrors).length === 0 &&
            data.email &&
            data.password;
    };

    // Get input border color based on validation state
    const getInputBorderColor = (field) => {
        if (!touched[field]) return 'border-gray-300';
        if (validationErrors[field]) return 'border-red-500';
        return 'border-green-500';
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 1
            }}
            className="w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100"
        >

            {processing && (
                <div className="fixed inset-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
                    <LoadingText text="Signing in..." />
                </div>
            )}

            <div className="p-6 space-y-6 md:space-y-7 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-backgroundColor md:text-2xl text-center">
                    Welcome Back
                    <p className="text-sm font-normal text-gray-500 mt-1">
                        Sign in to your account
                    </p>
                </h1>

                <form onSubmit={submit} className="space-y-5 md:space-y-6" noValidate>
                    {/* Email Field */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                            </div>
                            <input
                                type="email"
                                name="email"
                                autoComplete='email'
                                id="email"
                                className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('email')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm`}
                                placeholder="Email address"
                                required
                                onChange={(e) => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                value={data.email}
                            />
                        </div>
                        <InputError message={validationErrors.email || errors.email} className="mt-2" />
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                autoComplete='current-password'
                                className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('password')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 pr-10 p-3 transition-all duration-200 shadow-sm`}
                                placeholder="Password"
                                required
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                value={data.password}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <InputError message={validationErrors.password || errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded bg-gray-50 border-gray-300 focus:ring-brightColor"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label
                                    htmlFor="remember"
                                    className="text-gray-500 cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                        </div>
                        <a
                            href={route('password.request')}
                            className="text-sm font-medium text-brightColor hover:underline transition-colors"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className={`${buttonClasses} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isFormValid() || processing}
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <button
                    onClick={toggleSignUpMode}
                    className="text-sm text-center text-gray-600 mt-4 border-t border-gray-100 pt-4 w-full hover:text-brightColor transition-colors"
                >
                    If you don&apos;t have an account, Do Sign Up
                </button>
            </div>
        </motion.div>
    );
};

export default SigninForm;
