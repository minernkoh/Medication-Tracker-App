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
