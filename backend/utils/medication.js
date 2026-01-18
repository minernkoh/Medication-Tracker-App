/**
 * Backend Medication Utilities
 */

/**
 * Parse numeric quantity and extract unit
 * @param {string} q - Quantity string (e.g., "30 pills")
 * @returns {object} { value, unit }
 */
const parseQuantity = (q) => {
  const match = String(q || "").match(/^\s*(\d+)/);
  const value = match ? parseInt(match[1], 10) : null;
  const unit = String(q || "").replace(/^\s*\d+\s*/, "").trim();
  return { value, unit };
};

/**
 * Parse numeric dosage
 * @param {string} d - Dosage string (e.g., "2 pills")
 * @returns {number}
 */
const parseDosage = (d) => {
  const match = String(d || "").match(/^\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

/**
 * Calculate new quantity after taking a dose
 * @param {string} currentQty - Current quantity string
 * @param {string} dosage - Dosage string
 * @returns {string|null} New quantity string or original if unparseable
 */
const decrementQuantity = (currentQty, dosage) => {
  const { value: qVal, unit } = parseQuantity(currentQty);
  if (qVal === null) return currentQty;

  const dVal = parseDosage(dosage);
  const newValue = Math.max(qVal - dVal, 0);
  return `${newValue}${unit ? ` ${unit}` : ""}`;
};

/**
 * Calculate new quantity after undoing a dose
 * @param {string} currentQty - Current quantity string
 * @param {string} dosage - Dosage string
 * @returns {string|null} New quantity string
 */
const incrementQuantity = (currentQty, dosage) => {
  const { value: qVal, unit } = parseQuantity(currentQty);
  if (qVal === null) return currentQty;

  const dVal = parseDosage(dosage);
  const newValue = qVal + dVal;
  return `${newValue}${unit ? ` ${unit}` : ""}`;
};

module.exports = {
  parseQuantity,
  parseDosage,
  decrementQuantity,
  incrementQuantity,
};
