/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic color tokens
        primary: {
          DEFAULT: "#155dfc", // Personal mode primary color
          hover: "#1350e0",
          light: "#e8f0fe",
        },
        secondary: {
          DEFAULT: "#da7488", // Caregiver mode primary color
          hover: "#c86478",
          light: "#fce8ec",
        },
        text: {
          primary: "#181818", // Main text color
          secondary: "#646464", // Secondary/subdued text color
          onPrimary: "#ffffff", // Text on primary background
          onSecondary: "#ffffff", // Text on secondary background
        },
        icon: {
          primary: "#181818", // Default icon color
          secondary: "#646464", // Secondary icon color
          onPrimary: "#ffffff", // Icon on primary background
          interactive: "#155dfc", // Interactive icon color (hover/active)
        },
        background: {
          default: "#ffffff", // Default background
          subtle: "#f9f9f9", // Subtle background (cards, hover states)
          hover: "#f9f9f9", // Hover background
          success: {
            hover: "#e9ffee", // Success state hover background
          },
        },
        border: {
          default: "rgba(100,100,100,0.2)", // Default border color
          subtle: "rgba(100,100,100,0.1)", // Subtle border
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontWeight: {
        regular: 400,
        semibold: 600,
        bold: 700,
      },
    },
  },
  plugins: [],
};
