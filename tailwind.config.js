/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        premium: {
          bg: '#000000',
          surface: '#121212',
          surfaceLight: '#1F1F1F',
          text: '#FFFFFF',
          textMuted: '#A1A1AA',
          border: '#27272A'
        }
      }
    },
  },
  plugins: [],
};
