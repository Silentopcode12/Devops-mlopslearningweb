/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#67e8f9',
          500: '#22d3ee'
        }
      }
    }
  },
  plugins: []
};
