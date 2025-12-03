/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8', // SUS Blue
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          patient: {
            DEFAULT: '#6C4FFE', // Wellness Purple
            light: '#8B74FE',
            dark: '#5B3FD9',
            50: '#F6F8FE',
            surface: '#FBFBFF', // Ultra light for backgrounds
          },
          professional: {
            DEFAULT: '#0054A6', // SUS Blue
            light: '#2E74C0',
            dark: '#003F7D',
            50: '#EFF6FF',
            surface: '#F5F9FF', // Ultra light for backgrounds
          },
          secondary: {
            pink: '#EC4899', // From Login gradient
            cyan: '#06B6D4', // From Login gradient
            orange: '#F97316', // From Login gradient
          }
        }
      }
    },
  },
  plugins: [],
}