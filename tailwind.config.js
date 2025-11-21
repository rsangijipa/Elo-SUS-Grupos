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
          DEFAULT: '#1351B4', // Institutional Blue
          light: '#2670E8',
          dark: '#0C326F',
        },
        secondary: {
          DEFAULT: '#008000', // Green
          light: '#28A745',
        },
        accent: {
          DEFAULT: '#F9D000', // Yellow
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
