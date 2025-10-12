import preset from './vendor/filament/support/tailwind.config.preset'

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    // presets: [preset],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './vendor/filament/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                // inter: ["Inter", ...defaultTheme.fontFamily.sans],
                poppins: ['Poppins', 'sans-serif'],
            },
            extend: {
                animation: {
                    'spin-slow': 'spin 4s linear infinite',
                },
            },
            animation: {
                'spin-slow': 'spin 4s linear infinite',
            },
            colors: {
                // Semantic
                text: {
                    DEFAULT: '#1C252E',          // primary body text
                    muted:   '#4B5563',          // secondary text
                    onBrand: '#FFFFFF',          // text on brand solids
                },
                bg: {
                    DEFAULT: '#FBFBFE',          // app background
                    subtle:  '#F6FAF3',          // pale green wash
                    surface: '#FFFFFF',          // cards/surfaces
                },
                border: {
                    DEFAULT: '#E6EAE2',          // light borders
                    strong:  '#CAD7C2',
                },

                // Brand Greens (Primary) – balanced around your #5C7934
                primary: {
                    50:  '#F4F8EE',
                    100: '#E7F1DB',
                    200: '#CEE4B5',
                    300: '#B2D48D',
                    400: '#8EBE63',
                    500: '#719440',   // your accent
                    600: '#5C7934',   // your primary base
                    700: '#46602A',
                    800: '#334722',
                    900: '#233217',
                    DEFAULT: '#5C7934',
                },

                // Amber / Golden Orange (Secondary) – around your #E0B52B
                secondary: {
                    50:  '#FFF8E6',
                    100: '#FEF0C4',
                    200: '#FCE38A',
                    300: '#F8D14E',
                    400: '#F0BE2E',
                    500: '#E6B022',
                    600: '#E0B52B',   // your original sunshine gold
                    700: '#C99519',
                    800: '#A37212',
                    900: '#7A530C',
                    DEFAULT: '#E0B52B',
                },

                // Supportive Sage (soft UI accents / chips)
                accent: {
                    50:  '#F2FAEA',
                    100: '#E3F4D4',
                    200: '#CBE9AF',
                    300: '#B0DD8A',
                    400: '#93CC65',
                    500: '#7DB64E',
                    600: '#6AA240',
                    700: '#568436',
                    800: '#42652C',
                    900: '#2D4620',
                    DEFAULT: '#719440', // matches your old accent
                },

                // Utility neutrals to replace "Blacky" + add usable gray ramp
                ink: {
                    50:  '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                    DEFAULT: '#131313', // your black, kept as default
                },

                // Legacy aliases (optional – keep for migration)
                lightaccent: '#D8FAC7',
                sidebar:     '#F5F7F4',
                topbar:      '#5C7934',
            },
        },

    },

    plugins: [forms,   require('tailwind-scrollbar'), ],
};
