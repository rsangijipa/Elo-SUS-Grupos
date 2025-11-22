/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0054A6', // EloSUS Blue
          light: '#2670E8',
          dark: '#004080',
        },
        secondary: {
          DEFAULT: '#0B8A4D', // EloSUS Green
          light: '#28A745',
        },
        accent: {
          DEFAULT: '#FFC857', // EloSUS Yellow
        },
        background: '#F4F7FF', // Soft Blue/Gray Background
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
