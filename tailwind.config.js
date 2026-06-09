/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This is crucial! It tells Tailwind to look for the "dark" class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}