/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f3f6ff',
          100: '#e4e9fd',
          200: '#c1cdfa',
          300: '#8fa0e0',
          400: '#5c6dc8',
          500: '#3d4ba2',
          600: '#283375',
          700: '#1f285d',
          800: '#181e47',
          900: '#141838',
          950: '#0c0f24',
        }
      }
    },
  },
  plugins: [],
}
