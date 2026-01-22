/**
 * Storage Utilities
 * Centralized localStorage access patterns for authentication data
 */

const AUTH_STORAGE_KEY = "medtracker_auth";
const LEGACY_TOKEN_KEY = "token";
const LEGACY_USER_KEY = "user";

/**
 * Get authentication data from localStorage
 * @returns {object|null} Authentication data object or null if not found
 */
export const getAuthData = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;

    // Merge legacy keys for backwards compatibility (prevents drift during migration).
    const token = (() => {
      if (parsed?.token) return parsed.token;
      try {
        return localStorage.getItem(LEGACY_TOKEN_KEY);
      } catch {
        return null;
      }
    })();

    const user = (() => {
      if (parsed?.user) return parsed.user;
      try {
        const raw = localStorage.getItem(LEGACY_USER_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (!parsed && (token || user)) {
      return { token, user };
    }

    if (parsed && (token || user)) {
      return { ...parsed, ...(token ? { token } : {}), ...(user ? { user } : {}) };
    }

    return parsed;
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

    // Keep legacy keys in sync for now (some codepaths still read them).
    if (data?.token) {
      localStorage.setItem(LEGACY_TOKEN_KEY, data.token);
    }
    if (data?.user) {
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(data.user));
    }
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
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch (error) {
    console.error("Error removing auth data from localStorage:", error);
  }
};

/**
 * Get the current auth token from storage (best-effort).
 * Prefers the structured auth payload; falls back to legacy `localStorage.token`.
 */
export const getStoredToken = () => {
  const token = getAuthField("token");
  if (token) return token;
  try {
    return localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
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

/**
 * Get the current user object from storage (best-effort).
 * Prefers the structured auth payload; falls back to legacy `localStorage.user`.
 */
export const getStoredUser = () => {
  const user = getAuthField("user");
  if (user) return user;
  try {
    const raw = localStorage.getItem(LEGACY_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Patients linked to a caregiver have read-only access to their own data.
 */
export const isReadOnlyPatientUser = (user) => {
  const hasCaregiver =
    Boolean(user?.caregiver) ||
    (Array.isArray(user?.caregivers) && user.caregivers.length > 0);
  return user?.role === "patient" && hasCaregiver;
};
