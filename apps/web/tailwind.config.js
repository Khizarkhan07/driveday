import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // GoShorty-inspired mint green — primary CTAs, links, active states
        brand: {
          50: "#ecfdf3",
          100: "#d3fbe1",
          200: "#a8f5c6",
          300: "#73fda3",
          400: "#70ed9b",
          500: "#3ddc81",
          600: "#22b868",
          700: "#1c9456",
          800: "#19754a",
          900: "#16603e",
        },
        // GoShorty-inspired purple/magenta — sparing decorative accents
        accent: {
          400: "#e08bff",
          500: "#ce43ff",
          600: "#b522e8",
        },
        // GoShorty-inspired dark navy — headings, body text, dark surfaces
        ink: {
          50: "#f4f5f8",
          100: "#e4e6ee",
          300: "#9598ab",
          500: "#4a4d63",
          700: "#2d3047",
          800: "#181926",
          900: "#1d1e2c",
          950: "#0b0c1e",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
