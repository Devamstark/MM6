/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F6F6F2',
                primary: {
                    DEFAULT: '#EF4444',
                    foreground: '#ffffff',
                },
                secondary: '#f0f4f8',
                accent: '#EF4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Montserrat', 'sans-serif'],
            },
            borderRadius: {
                lg: '1rem',
                md: '0.75rem',
                sm: '0.5rem',
            }
        },
    },
    plugins: [],
}
