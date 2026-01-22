/**
 * Time Utilities
 * Centralized time conversion and formatting functions
 */

export const TIME_BUCKET_TO_24H = Object.freeze({
  morning: "08:00",
  afternoon: "12:00",
  night: "20:00",
});

/**
 * Convert a display time like "9:00 AM" or "21:30" to HH:MM for <input type="time">
 * @param {string} value - Time string in various formats
 * @returns {string} Time string in HH:MM format or empty string
 */
export const toTimeInput = (value) => {
  if (!value) return "";
  const trimmed = value.trim();

  // Handle coarse bucket labels
  const lowered = trimmed.toLowerCase();
  if (TIME_BUCKET_TO_24H[lowered]) return TIME_BUCKET_TO_24H[lowered];

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
  let displayHour;
  if (hourNum === 0) {
    displayHour = 12;
  } else if (hourNum > 12) {
    displayHour = hourNum - 12;
  } else {
    displayHour = hourNum;
  }
  return `${displayHour}:${m} ${ampm}`;
};

/**
 * Round an HH:MM time string to a fixed minute interval (default: 15 minutes).
 * Useful with <input type="time" step="900"> to avoid invalid values.
 *
 * @param {string} value - Time string in HH:MM format
 * @param {number} intervalMinutes - Interval in minutes (e.g., 15)
 * @param {"nearest"|"floor"|"ceil"} method - Rounding method (default: "nearest")
 * @returns {string} Rounded HH:MM string, or original value if not HH:MM
 */
export const roundTimeToInterval = (
  value,
  intervalMinutes = 15,
  method = "nearest",
) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!/^\d{2}:\d{2}$/.test(trimmed)) return value;

  const [hStr, mStr] = trimmed.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;

  const interval = Number(intervalMinutes);
  if (!Number.isFinite(interval) || interval <= 0) return trimmed;

  const total = h * 60 + m;
  const mod = total % interval;

  let rounded = total;
  if (method === "floor") {
    rounded = total - mod;
  } else if (method === "ceil") {
    rounded = mod === 0 ? total : total + (interval - mod);
  } else {
    // nearest
    rounded = mod < interval / 2 ? total - mod : total + (interval - mod);
  }

  // Avoid rolling into the next day (would mismatch selected date in forms)
  if (rounded < 0) rounded = 0;
  if (rounded >= 24 * 60) rounded = 24 * 60 - interval;

  const outH = Math.floor(rounded / 60)
    .toString()
    .padStart(2, "0");
  const outM = (rounded % 60).toString().padStart(2, "0");
  return `${outH}:${outM}`;
};

/**
 * Get the current local time as HH:MM, rounded to a minute interval.
 * @param {number} intervalMinutes - Interval in minutes (e.g., 15)
 * @param {"nearest"|"floor"|"ceil"} method - Rounding method (default: "ceil")
 * @returns {string} Rounded HH:MM string
 */
export const getNowTimeInputRounded = (intervalMinutes = 15, method = "ceil") => {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  return roundTimeToInterval(`${hh}:${mm}`, intervalMinutes, method);
};

/**
 * Build time dropdown options in fixed-minute intervals.
 * @param {number} intervalMinutes - Interval in minutes (e.g., 15)
 * @returns {{value: string, label: string}[]} Array of { value: "HH:MM", label: "h:mm AM" }
 */
export const buildTimeOptions = (intervalMinutes = 15) => {
  const interval = Number(intervalMinutes);
  if (!Number.isFinite(interval) || interval <= 0) return [];

  const out = [];
  for (let mins = 0; mins < 24 * 60; mins += interval) {
    const hh = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const mm = (mins % 60).toString().padStart(2, "0");
    const value = `${hh}:${mm}`;
    out.push({ value, label: to12HourDisplay(value) });
  }
  return out;
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
  if (normalized === "afternoon") return 12 * 60;
  if (normalized === "night") return 20 * 60;

  if (!timeStr.includes(":")) return Number.MAX_SAFE_INTEGER;
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER;
  return h * 60 + m;
};
