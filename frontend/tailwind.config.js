/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#F0FDFA", 100: "#CCFBF1", 500: "#14B8A6", 600: "#0F766E", 700: "#115E59", 900: "#134E4A" },
        champagne: { 100: "#FFF8D6", 300: "#F5E6A8", 500: "#D4AF37", 700: "#9A7B19" },
        ink: "#18312F",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "sans-serif"],
        display: ["Lora", "serif"],
      },
      boxShadow: { soft: "0 12px 35px rgba(15, 118, 110, 0.10)" },
    },
  },
  plugins: [],
};
