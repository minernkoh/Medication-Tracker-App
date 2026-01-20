/**
 * Medication Logic Utilities
 * Shared logic for supply calculations, status determination, and grouping
 */

/**
 * Calculate supply status based on ratio of Total Quantity vs Recommend Supply
 * @param {object} med - Normalized medication object
 * @returns {object|null} { label, className, ratio } or null
 */
export const calculateSupplyStatus = (med) => {
  const totalQuantity = parseFloat(med.quantity) || 0;
  const recommendSupply = parseFloat(med.recommendSupply || med.quantity) || 0;

  if (!recommendSupply || recommendSupply === 0) {
    return null; // No status if recommend supply not set
  }

  const ratio = (totalQuantity / recommendSupply) * 100;

  let label, className;
  if (ratio === 0) {
    label = "Empty";
    className = "bg-gray-100 text-gray-700";
  } else if (ratio > 100) {
    label = "Over";
    className = "bg-blue-100 text-blue-700";
  } else if (ratio > 70) {
    label = "High";
    className = "bg-green-100 text-green-700";
  } else if (ratio > 30) {
    label = "Med";
    className = "bg-amber-100 text-amber-700";
  } else {
    label = "Low";
    className = "bg-red-100 text-red-700";
  }

  return { label, className, ratio };
};

/**
 * Determine if medication needs refill based on supply status
 * @param {object} med - Normalized medication object
 * @returns {boolean}
 */
export const needsRefill = (med) => {
  const status = calculateSupplyStatus(med);
  if (!status) return false;
  return status.label === "Low" || status.label === "Empty";
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
    return meds.filter(
      (m) =>
        !m?.isArchived &&
        m.quantity !== undefined &&
        m.quantity !== null &&
        String(m.quantity).trim() !== "",
    );
  }
  if (targetStatus === "pending") {
    return meds.filter((m) => !m?.isArchived && m.status === targetStatus);
  }
  return meds.filter((m) => m.status === targetStatus);
};
