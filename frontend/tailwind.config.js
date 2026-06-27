/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6fd',
          200: '#b9cdfb',
          300: '#90aef7',
          400: '#6789f0',
          500: '#4a65e6',
          600: '#3a4fd9',
          700: '#2f3ec2',
          800: '#29369e',
          900: '#24307c',
          950: '#181f50',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#161b27',
          border:  '#1e2536',
          input:   '#1a2130',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
