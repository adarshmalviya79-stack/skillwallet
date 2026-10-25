/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
          600: '#475569',
        },
        construction: {
          blue: '#1E40AF',
          lightBlue: '#3B82F6',
          amber: '#F59E0B',
          orange: '#EA580C',
          dark: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}
