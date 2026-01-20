/**
 * Date Utilities
 * Centralized date formatting and calendar helper functions
 */

// Month names (full)
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Month names (short)
export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Day names (short)
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format date string to display format (e.g., "Mon, Jan 13")
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr) => {
  return formatDateNumeric(dateStr);
};

/**
 * Format date to numeric format (e.g., "13/01/26")
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Numeric formatted date string
 */
export const formatDateNumeric = (dateStr) => {
  if (!dateStr) return "";
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
};

/**
 * Format time string to 12-hour format (e.g., "9:00 AM")
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return "";
  
  const [hours, minutes] = timeStr.split(":");
  const hourNum = parseInt(hours, 10);
  
  if (isNaN(hourNum) || isNaN(parseInt(minutes, 10))) return timeStr;
  
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Get number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get start of week (Monday) for a given date
 * @param {Date} date - Date object
 * @returns {Date} Start of week date
 */
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
};

/**
 * Format month and year (e.g., "January 2026")
 * @param {number} month - Month index (0-11)
 * @param {number} year - Year
 * @returns {string} Formatted month year string
 */
export const formatMonthYear = (month, year) => {
  return `${MONTHS[month]} ${year}`;
};

/**
 * Format short month and year (e.g., "Jan 2026")
 * @param {number} month - Month index (0-11)
 * @param {number} year - Year
 * @returns {string} Formatted short month year string
 */
export const formatShortMonthYear = (month, year) => {
  return `${MONTHS[month].slice(0, 3)} ${year}`;
};

/**
 * Format date using locale string (for CaregiverAppointmentsPage)
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Locale formatted date string
 */
export const formatDateLocale = (dateStr) => {
  return formatDateNumeric(dateStr);
};
