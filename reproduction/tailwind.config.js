import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./Sources/**/*.html",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#3E5F25",
                deepolive: "#4B4A16",
                "background-light": "#FFFFFF",
                "background-dark": "#121212",
                "surface-light": "#F8FAF5",
                "surface-dark": "#1E1E1E",
                "accent-label": "var(--accent-label)",
                "muted-accessible": "var(--muted-accessible)",
            },
            fontFamily: {
                display: ["Playfair Display", "serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
            },
        },
    },
    plugins: [
        forms,
        typography,
        containerQueries,
    ],
}
