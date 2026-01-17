/** @type {import('tailwindcss').Config} */

// Single source of truth for colors - exported for use in components
export const colors = {
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
          DEFAULT: "#181818", // Default icon color
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
        separator: {
          default: "rgba(100, 100, 100, 1)",
          subtle: "rgba(100, 100, 100, 0.5)",
        },
        // Status colors
        success: {
          DEFAULT: "#10b981", // Success green
          hover: "#059669",
          light: "#d1fae5",
        },
        warning: {
          DEFAULT: "#f59e0b", // Warning amber
          hover: "#d97706",
          light: "#fef3c7",
        },
        danger: {
          DEFAULT: "#ef4444", // Danger red
          hover: "#dc2626",
          light: "#fee2e2",
        },
        // Patient colors (for caregiver mode)
        patient: {
          pink: "#da7488",    // Secondary color
          blue: "#155dfc",    // Primary color
          green: "#10b981",   // Success color
          amber: "#f59e0b",   // Warning color
          purple: "#8b5cf6",  // Additional patient color
        },
};

// Tailwind config using the colors object
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors,
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
        full: "9999px",
      },
      boxShadow: {
        // Button glow effects
        "glow-primary": "0 0.5rem 1.5rem rgba(21, 93, 252, 0.35)",
        "glow-primary-hover": "0 0.625rem 2rem rgba(21, 93, 252, 0.45)",
        "glow-secondary": "0 0.5rem 1.5rem rgba(218, 116, 136, 0.35)",
        "glow-secondary-hover": "0 0.625rem 2rem rgba(218, 116, 136, 0.45)",
        "glow-success": "0 0.5rem 1.5rem rgba(16, 185, 129, 0.35)",
        "glow-success-hover": "0 0.625rem 2rem rgba(16, 185, 129, 0.45)",
        "glow-danger": "0 0.5rem 1.5rem rgba(239, 68, 68, 0.35)",
        "glow-danger-hover": "0 0.625rem 2rem rgba(239, 68, 68, 0.45)",
        // Inner glow for selected states
        "inner-primary": "inset 0 0 0 2px rgba(21, 93, 252, 0.3)",
        "inner-secondary": "inset 0 0 0 2px rgba(218, 116, 136, 0.3)",
        // Card shadows
        card: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.05)",
        "card-hover": "0 0.5rem 1rem rgba(0, 0, 0, 0.08)",
        // Elevated shadows
        elevated: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)",
        modal: "0 1rem 3rem rgba(0, 0, 0, 0.2)",
        // Standard shadows
        sm: "0 0.0625rem 0.125rem rgba(0, 0, 0, 0.05)",
        base: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)",
        md: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)",
        lg: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        xl: "0 1rem 2rem rgba(0, 0, 0, 0.2)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      zIndex: {
        base: "0",
        dropdown: "10",
        sticky: "20",
        overlay: "30",
        modal: "40",
        popover: "50",
        tooltip: "60",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "fade-in-slide-down": "fadeInSlideDown 0.2s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInSlideDown: {
          "0%": { opacity: "0", transform: "translateX(-50%) translateY(-0.5rem)" },
          "100%": { opacity: "1", transform: "translateX(-50%) translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
