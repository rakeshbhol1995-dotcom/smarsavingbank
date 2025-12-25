/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'financial-green': {
                    DEFAULT: '#10B981', // Vibrant Emerald for Dark Mode
                    glow: '#34D399',
                    dark: '#059669',
                },
                'navy-blue': {
                    DEFAULT: '#0F172A', // Slate 900 (Background Base)
                    lighter: '#1E293B', // Slate 800 (Card Base)
                    accent: '#3B82F6', // Blue 500
                },
                'premium-gold': '#F59E0B',
                'rich-dark': '#020617', // Slate 950
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scroll': 'scroll 20s linear infinite',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        },
    },
    plugins: [],
}
