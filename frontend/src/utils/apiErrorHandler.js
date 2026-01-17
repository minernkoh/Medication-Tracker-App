/**
 * API Error Handler Utilities
 * Helper functions for handling API errors consistently
 */

/**
 * Extract user-friendly error message from API error
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) return "An unexpected error occurred";

  // Axios/Fetch API error with response
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check for specific error messages from API
    if (data?.message) {
      return data.message;
    }

    // Fallback to status-based messages
    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Please log in to continue";
      case 403:
        return "You don't have permission to perform this action";
      case 404:
        return "The requested resource was not found";
      case 409:
        return "This resource already exists";
      case 422:
        return "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
      case 502:
      case 503:
        return "Server error. Please try again later.";
      default:
        return `Error (${status}): Something went wrong`;
    }
  }

  // Network error (no response received)
  if (error?.request) {
    return "Network error. Please check your connection and try again.";
  }

  // Error in request setup or generic error
  if (error?.message) {
    // Filter out technical error messages for users
    if (error.message.includes("Network")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  return !error.response && !!error.request;
}

/**
 * Check if error is a server error (5xx)
 * @param {Error} error - Error object
 * @returns {boolean} True if server error
 */
export function isServerError(error) {
  if (!error?.response) return false;
  const status = error.response.status;
  return status >= 500 && status < 600;
}

/**
 * Check if error is a client error (4xx)
 * @param {Error} error - Error object
 * @returns {boolean} True if client error
 */
export function isClientError(error) {
  if (!error?.response) return false;
  const status = error.response.status;
  return status >= 400 && status < 500;
}

/**
 * Get error severity for UI display
 * @param {Error} error - Error object
 * @returns {"error" | "warning" | "info"} Error severity
 */
export function getErrorSeverity(error) {
  if (!error) return "error";

  if (error?.response) {
    const status = error.response.status;

    // Client errors are typically less severe (validation, etc.)
    if (status >= 400 && status < 500) {
      // 401/403 are more critical
      if (status === 401 || status === 403) return "error";
      return "warning";
    }

    // Server errors are critical
    if (status >= 500) return "error";
  }

  // Network errors are critical
  if (isNetworkError(error)) return "error";

  return "error";
}
