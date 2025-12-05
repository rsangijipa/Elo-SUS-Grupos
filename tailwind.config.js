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
          primary: '#7A5CFF',
          secondary: '#4E8FFF',
          accent: '#5EE6C8',
          surface: '#F8F9FC',
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
          },
          text: {
            DEFAULT: '#1e293b', // slate-800
            muted: '#64748b',   // slate-500
            light: '#94a3b8',   // slate-400
          }
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}