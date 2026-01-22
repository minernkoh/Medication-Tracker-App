/**
 * Runtime design tokens (frontend)
 *
 * IMPORTANT:
 * - Do NOT import `tailwind.config.js` from runtime React code.
 * - Keep these values in sync with `frontend/tailwind.config.js`.
 *
 * Prefer using Tailwind token classes (e.g. `text-primary`, `bg-secondary-light`)
 * when possible. This module is for cases that truly require runtime values
 * (inline styles, SVG fills via `color` props, charts, etc).
 */

export const colors = {
  primary: {
    DEFAULT: "#155dfc",
    hover: "#1350e0",
    light: "#e8f0fe",
  },
  secondary: {
    DEFAULT: "#da7488",
    hover: "#c86478",
    light: "#fce8ec",
  },
  text: {
    primary: "#181818",
    secondary: "#646464",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
  },
  icon: {
    DEFAULT: "#181818",
    primary: "#181818",
    secondary: "#646464",
    onPrimary: "#ffffff",
    interactive: "#155dfc",
  },
  background: {
    default: "#ffffff",
    subtle: "#f9f9f9",
    hover: "#f9f9f9",
    success: { hover: "#e9ffee" },
  },
  border: {
    default: "rgba(100,100,100,0.2)",
    subtle: "rgba(100,100,100,0.1)",
  },
  separator: {
    default: "rgba(100, 100, 100, 1)",
    subtle: "rgba(100, 100, 100, 0.5)",
  },
  success: {
    DEFAULT: "#10b981",
    hover: "#059669",
    light: "#d1fae5",
  },
  warning: {
    DEFAULT: "#f59e0b",
    hover: "#d97706",
    light: "#fef3c7",
  },
  danger: {
    DEFAULT: "#ef4444",
    hover: "#dc2626",
    light: "#fee2e2",
  },
  patient: {
    pink: "#da7488",
    blue: "#155dfc",
    green: "#10b981",
    amber: "#f59e0b",
    purple: "#8b5cf6",
  },
};

