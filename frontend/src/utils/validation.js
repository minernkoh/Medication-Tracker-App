/**
 * Form Validation Utilities
 * Provides reusable validation functions for form fields
 * Works seamlessly with FormField component
 */

/**
 * Validation rule types
 */
export const validators = {
  /**
   * Required field validator
   * @param {string} value - Field value
   * @param {string} fieldName - Field name for error message
   * @returns {string|null} Error message or null if valid
   */
  required: (value, fieldName = "This field") => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  /**
   * Email validator
   * @param {string} value - Email value
   * @returns {string|null} Error message or null if valid
   */
  email: (value) => {
    if (!value) return null; // Use required validator separately
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  /**
   * Minimum length validator
   * @param {number} minLength - Minimum required length
   * @returns {function} Validator function
   */
  minLength: (minLength) => (value, fieldName = "This field") => {
    if (!value) return null; // Use required validator separately
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  },

  /**
   * Maximum length validator
   * @param {number} maxLength - Maximum allowed length
   * @returns {function} Validator function
   */
  maxLength: (maxLength) => (value, fieldName = "This field") => {
    if (!value) return null;
    if (value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`;
    }
    return null;
  },

  /**
   * Password strength validator
   * @param {string} value - Password value
   * @returns {string|null} Error message or null if valid
   */
  password: (value) => {
    if (!value) return null; // Use required validator separately
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  },

  /**
   * Password match validator
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @returns {string|null} Error message or null if valid
   */
  passwordMatch: (password, confirmPassword) => {
    if (!confirmPassword) return null; // Use required validator separately
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  },

  /**
   * Date validator (ensures date is not in the past)
   * @param {string} value - Date value (YYYY-MM-DD format)
   * @returns {string|null} Error message or null if valid
   */
  futureDate: (value) => {
    if (!value) return null; // Use required validator separately
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return "Date cannot be in the past";
    }
    return null;
  },

  /**
   * Time validator
   * @param {string} value - Time value (HH:MM format)
   * @returns {string|null} Error message or null if valid
   */
  time: (value) => {
    if (!value) return null; // Use required validator separately
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return "Please enter a valid time (HH:MM format)";
    }
    return null;
  },

  /**
   * Custom validator function
   * @param {function} fn - Custom validation function
   * @param {string} errorMessage - Error message to return if validation fails
   * @returns {function} Validator function
   */
  custom: (fn, errorMessage) => (value) => {
    if (!value) return null; // Use required validator separately
    if (!fn(value)) {
      return errorMessage;
    }
    return null;
  },
};

/**
 * Validate a single field with multiple validators
 * @param {any} value - Field value
 * @param {Array<function>} rules - Array of validator functions
 * @returns {string|null} First error message found or null if all valid
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate an entire form
 * @param {object} formData - Form data object
 * @param {object} validationRules - Object mapping field names to validation rules
 * @returns {object} Object with field names as keys and error messages as values
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    const error = validateField(value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Create a validation rule set for common form types
 */
export const validationSchemas = {
  /**
   * Email and password login form
   */
  login: {
    email: [
      (value) => validators.required(value, "Email"),
      validators.email,
    ],
    password: [
      (value) => validators.required(value, "Password"),
    ],
  },

  /**
   * Signup form with password confirmation
   */
  signup: {
    name: [
      (value) => validators.required(value, "Name"),
      validators.minLength(2),
    ],
    email: [
      (value) => validators.required(value, "Email"),
      validators.email,
    ],
    password: [
      (value) => validators.required(value, "Password"),
      validators.password,
    ],
    confirmPassword: [
      (value, formData) => validators.required(value, "Confirm Password"),
      (value, formData) => validators.passwordMatch(formData.password, value),
    ],
  },

  /**
   * Appointment form
   */
  appointment: {
    title: [
      (value) => validators.required(value, "Appointment title"),
    ],
    location: [
      (value) => validators.required(value, "Location"),
    ],
    date: [
      (value) => validators.required(value, "Date"),
    ],
    time: [
      (value) => validators.required(value, "Time"),
      validators.time,
    ],
  },

  /**
   * Medication form
   */
  medication: {
    name: [
      (value) => validators.required(value, "Medication name"),
    ],
    dosage: [
      (value) => validators.required(value, "Dosage"),
    ],
    timeOfDay: [
      validators.time,
    ],
  },
};

