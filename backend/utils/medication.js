/**
 * Backend Medication Utilities
 */

/**
 * Calculate new quantity after taking a dose
 * @param {number} currentQty - Current quantity
 * @param {number} dosage - Dosage
 * @returns {number} New quantity
 */
const decrementQuantity = (currentQty, dosage) => {
  const qVal = Number(currentQty);
  const dVal = Number(dosage);
  
  if (isNaN(qVal) || isNaN(dVal)) return currentQty;
  
  return Math.max(qVal - dVal, 0);
};

/**
 * Calculate new quantity after undoing a dose
 * @param {number} currentQty - Current quantity
 * @param {number} dosage - Dosage
 * @returns {number} New quantity
 */
const incrementQuantity = (currentQty, dosage) => {
  const qVal = Number(currentQty);
  const dVal = Number(dosage);
  
  if (isNaN(qVal) || isNaN(dVal)) return currentQty;
  
  return qVal + dVal;
};

module.exports = {
  decrementQuantity,
  incrementQuantity,
};
