/**
 * Design System - Rem-based spacing and sizing tokens
 * 
 * All values are in rem units for consistent, scalable design.
 * Base font size is typically 16px, so 1rem = 16px
 * 
 * Usage:
 * - Import spacing/sizing tokens for inline styles
 * - Use Tailwind classes that reference these tokens
 * - All measurements should use rem for accessibility and scalability
 */

// Spacing scale (in rem)
export const spacing = {
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "0.75rem",    // 12px
  base: "1rem",     // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "2.5rem",  // 40px
  "3xl": "3rem",    // 48px
  "4xl": "4rem",    // 64px
  "5xl": "5rem",    // 80px
};

// Font sizes (in rem)
export const fontSize = {
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  base: "1rem",     // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "2rem",    // 32px
  "4xl": "2.5rem",  // 40px
};

// Line heights (unitless or rem)
export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
};

// Border radius (in rem)
export const borderRadius = {
  none: "0",
  sm: "0.25rem",    // 4px
  base: "0.5rem",   // 8px
  md: "0.75rem",    // 12px
  lg: "1rem",       // 16px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  full: "9999px",
};

// Component-specific sizes (in rem)
export const sizes = {
  // Icons
  icon: {
    xs: "0.75rem",   // 12px
    sm: "1rem",      // 16px
    base: "1.25rem", // 20px
    md: "1.5rem",    // 24px
    lg: "2rem",      // 32px
  },
  // Buttons
  button: {
    sm: {
      height: "2rem",      // 32px
      paddingX: "0.75rem", // 12px
      paddingY: "0.5rem",  // 8px
    },
    base: {
      height: "2.5rem",    // 40px
      paddingX: "1rem",    // 16px
      paddingY: "0.625rem", // 10px
    },
    lg: {
      height: "3rem",       // 48px
      paddingX: "1.25rem",  // 20px
      paddingY: "0.75rem",  // 12px
    },
  },
  // Sidebar
  sidebar: {
    width: "16rem",        // 256px
  },
  // Calendar
  calendar: {
    dateHeight: "3.75rem", // 60px
    dateMinWidth: "3.75rem", // 60px
  },
  // Cards
  card: {
    padding: "1.25rem",    // 20px
    paddingSm: "1rem",     // 16px
    borderRadius: "1.25rem", // 20px
  },
  // Container
  container: {
    maxWidth: "67.5rem",   // 1080px
  },
};

// Shadows (using rem for blur/offset)
export const shadows = {
  sm: "0 0.0625rem 0.125rem rgba(0, 0, 0, 0.05)",
  base: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)",
  md: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)",
  lg: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
  xl: "0 1rem 2rem rgba(0, 0, 0, 0.2)",
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
};
