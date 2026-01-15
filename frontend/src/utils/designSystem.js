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

import { colors } from "./colors";

// Button glow effects (for primary action buttons)
// Uses color values from colors.js for consistency
export const glowEffects = {
  // Primary button glow (blue)
  primary: `0 0.5rem 1.5rem ${colors.primary.DEFAULT}59`, // 35% opacity
  primaryHover: `0 0.625rem 2rem ${colors.primary.DEFAULT}73`, // 45% opacity
  // Secondary/Caregiver button glow (pink)
  secondary: `0 0.5rem 1.5rem ${colors.secondary.DEFAULT}59`,
  secondaryHover: `0 0.625rem 2rem ${colors.secondary.DEFAULT}73`,
  // Success button glow (green)
  success: "0 0.5rem 1.5rem rgba(16, 185, 129, 0.35)",
  successHover: "0 0.625rem 2rem rgba(16, 185, 129, 0.45)",
  // Danger button glow (red)
  danger: "0 0.5rem 1.5rem rgba(239, 68, 68, 0.35)",
  dangerHover: "0 0.625rem 2rem rgba(239, 68, 68, 0.45)",
  // Subtle inner glow for selected states
  innerPrimary: `inset 0 0 0 2px ${colors.primary.DEFAULT}4D`, // 30% opacity
  innerSecondary: `inset 0 0 0 2px ${colors.secondary.DEFAULT}4D`,
};

// Button variants configuration - references colors.js for consistency
export const buttonVariants = {
  primary: {
    bg: colors.primary.DEFAULT,
    bgHover: colors.primary.hover,
    text: colors.text.onPrimary,
    shadow: glowEffects.primary,
    shadowHover: glowEffects.primaryHover,
  },
  secondary: {
    bg: colors.secondary.DEFAULT,
    bgHover: colors.secondary.hover,
    text: colors.text.onSecondary,
    shadow: glowEffects.secondary,
    shadowHover: glowEffects.secondaryHover,
  },
  success: {
    bg: "#10b981",
    bgHover: "#059669",
    text: "#ffffff",
    shadow: glowEffects.success,
    shadowHover: glowEffects.successHover,
  },
  danger: {
    bg: "#ef4444",
    bgHover: "#dc2626",
    text: "#ffffff",
    shadow: glowEffects.danger,
    shadowHover: glowEffects.dangerHover,
  },
  outline: {
    bg: "transparent",
    bgHover: `${colors.primary.DEFAULT}0D`, // 5% opacity
    text: colors.primary.DEFAULT,
    border: colors.primary.DEFAULT,
    shadow: "none",
    shadowHover: "none",
  },
  ghost: {
    bg: "transparent",
    bgHover: "rgba(0, 0, 0, 0.05)",
    text: colors.text.primary,
    shadow: "none",
    shadowHover: "none",
  },
};

// Animation durations
export const transitions = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
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
