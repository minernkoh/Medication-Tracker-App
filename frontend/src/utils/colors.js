/**
 * Semantic Color Tokens
 *
 * Centralized color values for the Medication Tracker app.
 * These tokens map semantic meanings to actual color values.
 *
 * Usage:
 * - Import `colors` for inline styles: style={{ color: colors.text.primary }}
 * - Import `getPrimaryColor` for mode-aware colors
 * - Use Tailwind classes for static colors: className="text-text-primary"
 *
 * Note: These values are mirrored in tailwind.config.js for utility classes.
 */

export const colors = {
  // Primary colors (Personal mode - blue)
  primary: {
    DEFAULT: "#155dfc",
    hover: "#1350e0",
    light: "#e8f0fe",
  },

  // Secondary colors (Caregiver mode - pink)
  secondary: {
    DEFAULT: "#da7488",
    hover: "#c86478",
    light: "#fce8ec",
  },

  // Text colors
  text: {
    primary: "#181818",
    secondary: "#646464",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
  },

  // Icon colors
  icon: {
    primary: "#181818",
    secondary: "#646464",
    onPrimary: "#ffffff",
    interactive: "#155dfc",
  },

  // Separator/divider colors
  separator: {
    default: "rgba(100, 100, 100, 1)",
    subtle: "rgba(100, 100, 100, 0.5)",
  },

  // Background colors
  background: {
    default: "#ffffff",
    subtle: "#f9f9f9",
    hover: "#f9f9f9",
    success: {
      hover: "#e9ffee",
    },
  },

  // Border colors
  border: {
    default: "rgba(100,100,100,0.2)",
    subtle: "rgba(100,100,100,0.1)",
  },
};

/**
 * Get primary color based on app mode
 * @param {'Personal' | 'Caregiver'} mode - The current app mode
 * @returns {string} The hex color value for the mode
 */
export const getPrimaryColor = (mode = "Personal") => {
  return mode === "Personal"
    ? colors.primary.DEFAULT
    : colors.secondary.DEFAULT;
};

/**
 * Get mode-specific colors for components
 * @param {'Personal' | 'Caregiver'} mode - The current app mode
 * @returns {object} Object containing DEFAULT and hover colors
 */
export const getModeColors = (mode = "Personal") => {
  return mode === "Personal" ? colors.primary : colors.secondary;
};
