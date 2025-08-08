
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parolle: {
          green: '#35a854',
          yellow: '#c9b458',
          gray: '#787c7e',
          dark: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}
