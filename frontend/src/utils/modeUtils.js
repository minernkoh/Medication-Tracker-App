/**
 * Mode Utilities - Helper functions for mode-based styling
 * Uses Tailwind classes instead of inline colors
 */

/**
 * Get Tailwind class prefix based on app mode
 * @param {'Personal' | 'Caregiver'} mode - The current app mode
 * @returns {'primary' | 'secondary'} The Tailwind color prefix
 */
export const getModeColorClass = (mode = "Personal") => {
  return mode === "Personal" ? "primary" : "secondary";
};

/**
 * Get mode-specific Tailwind classes for common use cases
 * @param {'Personal' | 'Caregiver'} mode - The current app mode
 * @returns {object} Object containing Tailwind class strings
 */
export const getModeClasses = (mode = "Personal") => {
  const prefix = getModeColorClass(mode);
  return {
    bg: `bg-${prefix}`,
    bgHover: `hover:bg-${prefix}-hover`,
    bgLight: `bg-${prefix}-light`,
    text: `text-${prefix}`,
    textHover: `hover:text-${prefix}`,
    border: `border-${prefix}`,
    ring: `ring-${prefix}`,
    focusRing: `focus-visible:ring-${prefix}`,
    shadow: `shadow-glow-${prefix}`,
    shadowHover: `hover:shadow-glow-${prefix}-hover`,
  };
};

/**
 * Get hex color value for cases where inline color is absolutely needed
 * (e.g., SVG fill, chart colors)
 * @param {'Personal' | 'Caregiver'} mode - The current app mode
 * @returns {string} The hex color value
 */
export const getModeHexColor = (mode = "Personal") => {
  return mode === "Personal" ? "#155dfc" : "#da7488";
};

/**
 * Check if a user is a read-only patient
 * @param {object} userData - User data object from localStorage
 * @returns {boolean} True if user is a patient with read-only access
 */
export const isReadOnlyPatientUser = (userData) => {
  if (!userData) return false;
  const hasCaregiver =
    Boolean(userData?.caregiver) ||
    (Array.isArray(userData?.caregivers) && userData.caregivers.length > 0);
  // Patient accounts are read-only only when a caregiver is assigned (or explicitly flagged)
  return (userData.role === "patient" && hasCaregiver) || userData.isReadOnly === true;
};
