// vite.config.js
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                'resources/js/app.jsx',   // your React entry
                'resources/css/app.css',
                // (optional) 'resources/js/admin.js' for Filament-only JS
            ],
            refresh: true,
        }),
    ],
    
});
