import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
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
           colors: {
                text: '#1C252E',           // clean dark text
                background: '#fbfbfe',     // off-white background
                primary: '#5C7934',        // leafy green
                secondary: '#E0B52B',      // sunlight gold
                accent: '#719440',         // sage green
                lightaccent: '#d8fac7',    // light sage green
                sidebar: '#F5F7F4',        // very light green-gray
                topbar: '#5C7934',         // same as primary
                Amber: '#FFBF00',           //good yellow orange
                Blacky: '#131313',          // goods na black

            }
        },

    },

    plugins: [forms,   require('tailwind-scrollbar'), ],
};
