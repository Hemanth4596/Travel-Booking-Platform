export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Navy blue
          light: '#1e293b',
        },
        accent: {
          DEFAULT: '#0ea5e9', // Cyan/sky blue
          hover: '#0284c7',
        }
      }
    },
  },
  plugins: [],
}
