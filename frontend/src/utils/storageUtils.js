/**
 * Storage Utilities
 * Centralized localStorage access patterns for authentication data
 */

const AUTH_STORAGE_KEY = "medtracker_auth";

/**
 * Get authentication data from localStorage
 * @returns {object|null} Authentication data object or null if not found
 */
export const getAuthData = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error reading auth data from localStorage:", error);
    return null;
  }
};

/**
 * Set authentication data to localStorage
 * @param {object} data - Authentication data object
 */
export const setAuthData = (data) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving auth data to localStorage:", error);
  }
};

/**
 * Remove authentication data from localStorage
 */
export const removeAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error removing auth data from localStorage:", error);
  }
};

/**
 * Get specific field from authentication data
 * @param {string} field - Field name to retrieve
 * @param {*} defaultValue - Default value if field not found
 * @returns {*} Field value or default value
 */
export const getAuthField = (field, defaultValue = null) => {
  const authData = getAuthData();
  return authData?.[field] ?? defaultValue;
};

/**
 * Update specific field in authentication data
 * @param {string} field - Field name to update
 * @param {*} value - Value to set
 */
export const updateAuthField = (field, value) => {
  const existing = getAuthData() || {};
  setAuthData({
    ...existing,
    [field]: value,
  });
};
