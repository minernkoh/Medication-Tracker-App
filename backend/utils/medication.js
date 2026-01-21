/**
 * Medication math helpers (backend)
 *
 * Small utilities used to safely adjust supply quantities.
 * These are defensive: if values are not numeric, they return the original input.
 */

const decrementQuantity = (currentQty, dosage) => {
  const qVal = Number(currentQty);
  const dVal = Number(dosage);

  if (isNaN(qVal) || isNaN(dVal)) return currentQty;

  return Math.max(qVal - dVal, 0);
};

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
