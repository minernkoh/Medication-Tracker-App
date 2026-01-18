/**
 * Medication Logic Utilities
 * Shared logic for supply calculations, status determination, and grouping
 */

/**
 * Calculate supply status as percentage and determine visual style
 * @param {object} med - Normalized medication object
 * @param {function} parseQuantity - Helper to parse quantity string
 * @returns {object|null} { label, className } or null
 */
export const calculateSupplyStatus = (med, parseQuantity) => {
  if (!med.taken || !med.initialQuantity) return null;

  const currentQ = parseQuantity(med.quantity).value;
  const initialQ = parseQuantity(med.initialQuantity).value;

  if (initialQ === 0) return null;

  const percentage = Math.round((currentQ / initialQ) * 100);

  let className;
  if (percentage < 30) {
    className = "bg-red-100 text-red-700";
  } else if (percentage <= 60) {
    className = "bg-amber-100 text-amber-700";
  } else {
    className = "bg-green-100 text-green-700";
  }

  return { label: `${percentage}%`, className, percentage };
};

/**
 * Standardize time-of-day groups
 * @param {string} timeOfDay - Raw timeOfDay string
 * @returns {string} One of: "Morning", "Afternoon", "Night", "Other"
 */
export const getTimeGroup = (timeOfDay) => {
  if (!timeOfDay) return "Other";

  if (typeof timeOfDay === "string") {
    const normalized = timeOfDay.trim().toLowerCase();
    if (["morning", "afternoon", "night"].includes(normalized)) {
      return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
    }
    // Handle 24h format HH:MM
    if (timeOfDay.includes(":")) {
      const hour = parseInt(timeOfDay.split(":")[0], 10);
      if (hour >= 5 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 17) return "Afternoon";
      if (hour >= 17 || hour < 5) return "Night";
    }
  }

  return "Other";
};

/**
 * Filter medications by their effective status for a given view
 * @param {Array} meds - List of normalized meds
 * @param {string} targetStatus - "pending" | "taken" | "supply"
 * @returns {Array} Filtered meds
 */
export const filterMedsByStatus = (meds, targetStatus) => {
  if (targetStatus === "supply") {
    return meds.filter(m => m.quantity !== undefined && m.quantity !== null && String(m.quantity).trim() !== "");
  }
  return meds.filter(m => m.status === targetStatus);
};
