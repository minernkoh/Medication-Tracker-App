/**
 * Time Utilities
 * Centralized time conversion and formatting functions
 */

/**
 * Convert a display time like "9:00 AM" or "21:30" to HH:MM for <input type="time">
 * @param {string} value - Time string in various formats
 * @returns {string} Time string in HH:MM format or empty string
 */
export const toTimeInput = (value) => {
  if (!value) return "";
  const trimmed = value.trim();

  // Handle 12-hour format with AM/PM
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  // Handle 24-hour format already
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  return "";
};

/**
 * Convert HH:MM to 12-hour display format (e.g., "09:00" -> "9:00 AM")
 * @param {string} value - Time string in HH:MM format
 * @returns {string} Time string in 12-hour format with AM/PM
 */
export const to12HourDisplay = (value) => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return value || "";
  const [h, m] = value.split(":");
  const hourNum = parseInt(h, 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const displayHour =
    hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return `${displayHour}:${m} ${ampm}`;
};

/**
 * Convert time string to minutes for sorting/comparison
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Time in minutes or MAX_SAFE_INTEGER if invalid
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return Number.MAX_SAFE_INTEGER;

  // Support coarse time buckets used across the app
  const normalized = timeStr.trim().toLowerCase();
  if (normalized === "morning") return 8 * 60;
  if (normalized === "afternoon") return 13 * 60;
  if (normalized === "night") return 20 * 60;

  if (!timeStr.includes(":")) return Number.MAX_SAFE_INTEGER;
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER;
  return h * 60 + m;
};
