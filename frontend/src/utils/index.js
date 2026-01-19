/**
 * Utils Index
 * Central export for all utility modules
 */

// Mode-based styling utilities
export {
  getModeColorClass,
  getModeClasses,
  getModeHexColor,
} from "./modeUtils";

// Typography utilities
export { textStyles, getTextStyle } from "./typography";

/**
 * Get gradient background using design tokens
 * @param {number} opacity - Opacity value (0-1, default: 0.1)
 * @returns {string} CSS gradient string
 */
export const getGradientBackground = (opacity = 0.1) => {
  const primaryRgba = hexToRgba("#155dfc", opacity);
  const secondaryRgba = hexToRgba("#da7488", opacity);
  return `linear-gradient(135deg, ${primaryRgba} 0%, ${secondaryRgba} 100%)`;
};

/**
 * Convert hex color to rgba string
 * @param {string} hex - Hex color (e.g., "#155dfc")
 * @param {number} opacity - Opacity (0-1)
 * @returns {string} rgba string
 */
export const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get box shadow using design tokens
 * @param {string} color - Color token (e.g., colors.primary.DEFAULT)
 * @param {number} opacity - Opacity (0-1, default: 0.3)
 * @param {string} size - Shadow size ("sm" | "md" | "lg", default: "md")
 * @returns {string} CSS box-shadow string
 */
export const getBoxShadow = (color, opacity = 0.3, size = "md") => {
  const sizes = {
    sm: "0 5px 15px",
    md: "0 10px 25px -5px",
    lg: "0 25px 50px -12px",
  };
  const rgba = hexToRgba(color, opacity);
  return `${sizes[size]} ${rgba}`;
};

// API error handling utilities
export {
  getErrorMessage,
  isNetworkError,
  isServerError,
  isClientError,
  getErrorSeverity,
} from "./apiErrorHandler";

// Empty state presets
export {
  getMedicationsEmptyState,
  getAppointmentsEmptyState,
  getPatientsEmptyState,
  getSearchEmptyState,
  getSupplyEmptyState,
  getGenericEmptyState,
} from "./emptyStates.jsx";

// Form validation utilities
export {
  validators,
  validateField,
  validateForm,
  validationSchemas,
} from "./validation";

// Date utilities
export {
  MONTHS,
  MONTHS_SHORT,
  DAYS,
  formatDate,
  formatDateNumeric,
  formatTime,
  formatDateLocale,
  getDaysInMonth,
  getStartOfWeek,
  formatMonthYear,
  formatShortMonthYear,
} from "./dateUtils";

// Storage utilities
export {
  getAuthData,
  setAuthData,
  removeAuthData,
  getAuthField,
  updateAuthField,
  getStoredUser,
  isReadOnlyPatientUser,
} from "./storageUtils";

// Time utilities
export {
  toTimeInput,
  to12HourDisplay,
  buildTimeOptions,
  TIME_BUCKET_TO_24H,
  roundTimeToInterval,
  getNowTimeInputRounded,
  timeToMinutes,
} from "./timeUtils";

// Medication utilities
export { getMedicationColor, getMedicationColorHex } from "./medicationColors";
export {
  calculateSupplyStatus,
  getTimeGroup,
  filterMedsByStatus,
} from "./medicationUtils";

// Normalization utilities
export {
  normalizeId,
  normalizeDateInput,
  normalizeUser,
  normalizeMedication,
  normalizeAppointment,
} from "./normalization";
