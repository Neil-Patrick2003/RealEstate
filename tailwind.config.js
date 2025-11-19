import preset from './vendor/filament/support/tailwind.config.preset'
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
    // presets: [preset, require('@tailwindcss/forms')],
    plugins: [
        forms,
        require("tailwind-scrollbar")({ nocompatible: true }),
        require("@tailwindcss/typography"),
    ],

    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './vendor/filament/**/*.blade.php',
    ],

    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 4s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 7s ease-in-out 1s infinite',
                'float-slow': 'float 8s ease-in-out 2s infinite',
                'float-delayed-slow': 'float 9s ease-in-out 3s infinite',
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale': 'scale 0.2s ease-in-out',
                'gradient': 'gradient 3s ease infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scale: {
                    '0%': { transform: 'scale(0.95)' },
                    '100%': { transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            colors: {
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    DEFAULT: '#10b981',
                },
                secondary: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                    DEFAULT: '#14b8a6',
                },
                accent: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    DEFAULT: '#64748b',
                },
                emerald: {
                    light: '#d1fae5',
                    DEFAULT: '#10b981',
                    dark: '#047857',
                    gradient: {
                        from: '#10b981',
                        via: '#34d399',
                        to: '#6ee7b7',
                    },
                },
            },
            fontFamily: {
                heading: ['Manrope', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
            },
            spacing: {
                18: '4.5rem',
                88: '22rem',
                128: '32rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                hover: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                xl: '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)',
                emerald: '0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)',
                glow: '0 0 20px rgba(16, 185, 129, 0.15)',
                'glow-lg': '0 0 40px rgba(16, 185, 129, 0.2)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)',
                'gradient-emerald': 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 45deg, #10b981, #34d399, #6ee7b7, #10b981)',
                'gradient-shiny': 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
            },
            zIndex: {
                60: '60',
                70: '70',
                80: '80',
                90: '90',
                100: '100',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },

    safelist: [
        {
            pattern:
                /bg-(primary|secondary|accent|emerald|gray)-(50|100|200|300|400|500|600|700|800|900|light|dark|DEFAULT)/,
        },
        {
            pattern:
                /text-(primary|secondary|accent|emerald|gray)-(50|100|200|300|400|500|600|700|800|900|light|dark|DEFAULT)/,
        },
        {
            pattern:
                /border-(primary|secondary|accent|emerald|gray)-(50|100|200|300|400|500|600|700|800|900|light|dark|DEFAULT)/,
        },
        {
            pattern:
                /ring-(primary|secondary|accent|emerald|gray)-(50|100|200|300|400|500|600|700|800|900|light|dark|DEFAULT)/,
        },
        'bg-gradient-primary',
        'bg-gradient-secondary',
        'bg-gradient-emerald',
        'bg-gradient-conic',
        'shadow-emerald',
        'shadow-glow',
        'shadow-glow-lg',
        'dark:bg-gradient-emerald',
        'dark:shadow-emerald',
        'dark:shadow-glow',
        'btn',
        'btn-primary',
        'btn-secondary',
        'btn-accent',
        'btn-outline',
        'btn-ghost',
        'card',
        'card-header',
        'card-body',
        'card-footer',
        'badge',
        'badge-primary',
        'badge-secondary',
        'badge-accent',
        'badge-emerald',
        'badge-gray',
        'form-input',
        'form-select',
        'form-textarea',
        'form-label',
        'form-error',
        'page-container',
        'page-header',
        'page-content',
        'section',
        'section-header',
        'section-title',
        'section-description',
        'glass',
        'gradient-primary',
        'gradient-accent',
        'animate-gradient',
        'animate-shimmer',
    ],
};
