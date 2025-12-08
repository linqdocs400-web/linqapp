/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#00E676", // LINQ accent green
      },
      fontFamily: {
        sans: ["var(--font-sora)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        heading: ["var(--font-sora)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
