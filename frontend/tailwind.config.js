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
      spacing: {
        // Rem-based spacing scale
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "0.75rem", // 12px
        base: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": "3rem", // 48px
        "4xl": "4rem", // 64px
        "5xl": "5rem", // 80px
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["2rem", { lineHeight: "2.5rem" }], // 32px
        "4xl": ["2.5rem", { lineHeight: "3rem" }], // 40px
      },
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px
        base: "0.5rem", // 8px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
      },
    },
  },
  plugins: [],
};
