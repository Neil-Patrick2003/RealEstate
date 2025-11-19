import React from 'react'
import { motion } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import Modal from "@/Components/Modal.jsx";
import LoadingText from "@/Components/Loding/LoadingText.jsx";

const SignupForm = ({buttonClasses, buttonForGFT, toggleSignUpMode}) => {
    const [openSignUpModal, setOpenSignUpModal] = React.useState(false);
    const [redirecting, setRedirecting] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});
    const [touched, setTouched] = React.useState({
        name: false,
        email: false,
        password: false,
        password_confirmation: false,
        role: false
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'Seller',
    });

    // Validation rules
    const validateField = (name, value) => {
        const newErrors = { ...validationErrors };

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Full name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters long';
                } else if (value.trim().length > 50) {
                    newErrors.name = 'Name must be less than 50 characters';
                } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                    newErrors.name = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors.name;
                }
                break;

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
                } else if (value.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters long';
                } else if (!/(?=.*[a-z])/.test(value)) {
                    newErrors.password = 'Password must contain at least one lowercase letter';
                } else if (!/(?=.*[A-Z])/.test(value)) {
                    newErrors.password = 'Password must contain at least one uppercase letter';
                } else if (!/(?=.*\d)/.test(value)) {
                    newErrors.password = 'Password must contain at least one number';
                } else if (!/(?=.*[@$!%*?&])/.test(value)) {
                    newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
                } else {
                    delete newErrors.password;
                }

                // Also validate password confirmation if it has been touched
                if (touched.password_confirmation && data.password_confirmation !== value) {
                    newErrors.password_confirmation = 'Passwords do not match';
                } else if (touched.password_confirmation) {
                    delete newErrors.password_confirmation;
                }
                break;

            case 'password_confirmation':
                if (!value) {
                    newErrors.password_confirmation = 'Please confirm your password';
                } else if (value !== data.password) {
                    newErrors.password_confirmation = 'Passwords do not match';
                } else {
                    delete newErrors.password_confirmation;
                }
                break;

            case 'role':
                if (!value) {
                    newErrors.role = 'Please select a role';
                } else {
                    delete newErrors.role;
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
        const fieldsToValidate = ['name', 'email', 'password', 'password_confirmation', 'role'];
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

    const submitSignup = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            password: true,
            password_confirmation: true,
            role: true
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

        console.log('Form data:', data);

        post(route('register'), {
            onFinish: () => reset(),
            onError: (error) => {
                console.log('Server errors:', error);
                // Handle server-side errors
            }
        });
    };

    const handleRoleClick = (role) => {
        setOpenSignUpModal(false);
        window.location.href = `/select-role?role=${role}`;
    };

    // Check if form is valid for submit button
    const isFormValid = () => {
        return Object.keys(validationErrors).length === 0 &&
            data.name &&
            data.email &&
            data.password &&
            data.password_confirmation &&
            data.role;
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

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100">
            <Modal
                show={openSignUpModal}
                open={openSignUpModal}
                setOpen={setOpenSignUpModal}
                closeable={true}
                onClose={() => setOpenSignUpModal(false)}
                maxWidth='md'
            >
                {processing && (
                    <div className="mt-4 flex justify-center">
                        <LoadingText text="Signing in..." />
                    </div>
                )}
                <div className="p-8 bg-white rounded-xl max-w-md mx-auto shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Choose Your Role
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Please select whether you want to continue as a Buyer or a Seller.
                    </p>
                    <div className="flex justify-center gap-8">
                        {/* Buyer Button */}
                        <button
                            onClick={() => handleRoleClick('buyer')}
                            className={`flex flex-col items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-5 px-8 rounded-lg shadow-lg transition-colors w-36 disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label="Continue as Buyer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7.5m7.5-7.5L14 21m-5 0h8"
                                />
                            </svg>
                            {redirecting ? 'Redirecting...' : 'Buyer'}
                        </button>

                        {/* Seller Button */}
                        <button
                            onClick={() => handleRoleClick('seller')}
                            disabled={redirecting}
                            className={`flex flex-col items-center justify-center bg-[#f97316] hover:bg-[#c2410c] text-white font-semibold py-5 px-8 rounded-lg shadow-lg transition-colors w-36 disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label="Continue as Seller"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 9l9-6 9 6v9a3 3 0 01-3 3H6a3 3 0 01-3-3V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 22V12h6v10"
                                />
                            </svg>
                            {redirecting ? 'Redirecting...' : 'Seller'}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="p-6 space-y-6 md:space-y-7 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-backgroundColor md:text-2xl text-center">
                    Create Account
                    <p className="text-sm font-normal text-gray-500 mt-1">
                        Sign up to get started
                    </p>
                </h1>

                <form className="space-y-5 md:space-y-6" onSubmit={submitSignup} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-5 md:gap-6">
                        {/* Name Field */}
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
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    autoComplete='name'
                                    className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('name')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm`}
                                    placeholder="Full name"
                                    required
                                    value={data.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                />
                            </div>
                            <InputError message={validationErrors.name || errors.name} className="mt-2" />
                        </div>

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
                                    id="signup_email"
                                    autoComplete='email'
                                    className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('email')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm`}
                                    placeholder="Email address"
                                    required
                                    value={data.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
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
                                    id="signup_password"
                                    autoComplete='new-password'
                                    className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('password')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 pr-10 p-3 transition-all duration-200 shadow-sm`}
                                    placeholder="Password"
                                    required
                                    value={data.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
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
                            {touched.password && !validationErrors.password && data.password && (
                                <p className="text-green-600 text-xs mt-1">✓ Password meets requirements</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
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
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    id="confirmPassword"
                                    autoComplete='new-password'
                                    className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('password_confirmation')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 pr-10 p-3 transition-all duration-200 shadow-sm`}
                                    placeholder="Confirm password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                    onBlur={() => handleBlur('password_confirmation')}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? (
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
                            <InputError message={validationErrors.password_confirmation || errors.password_confirmation} className="mt-2" />
                            {touched.password_confirmation && !validationErrors.password_confirmation && data.password_confirmation && (
                                <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                            )}
                        </div>

                        {/* Role Field */}
                        <div>
                            <div className="relative overflow-hidden">
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
                                <select
                                    className={`bg-[#d5f2ec] border-2 ${getInputBorderColor('role')} text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 shadow-sm min-w-0`}
                                    name="role"
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    onBlur={() => handleBlur('role')}
                                >
                                    <option value="Seller">Seller</option>
                                    <option value="Buyer">Buyer</option>
                                </select>
                            </div>
                            <InputError message={validationErrors.role || errors.role} className="mt-2" />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                aria-describedby="terms"
                                type="checkbox"
                                className="w-4 h-4 rounded bg-gray-50 border-gray-300 focus:ring-brightColor"
                                required
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label
                                htmlFor="terms"
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                I agree to the{" "}
                                <a
                                    href="#"
                                    className="text-brightColor hover:text-brightColor font-medium"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="#"
                                    className="text-brightColor hover:text-brightColor font-medium"
                                >
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`${buttonClasses} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isFormValid() || processing}
                    >
                        {processing ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Already have account section */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Already have an account? Login <button
                            onClick={toggleSignUpMode}
                            className="text-brightColor hover:text-brightColor font-medium"
                        >
                                here
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;
