/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#171a38", lavender: "#f0efff", violet: "#6757dd" },
      fontFamily: { sans: ["var(--font-dm-sans)", "sans-serif"], display: ["var(--font-jakarta)", "sans-serif"] },
    },
  },
  plugins: [],
};
