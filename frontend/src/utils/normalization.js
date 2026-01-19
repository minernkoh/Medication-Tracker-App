/**
 * Normalization Utilities
 * Shared functions for normalizing data from API responses
 * Converts MongoDB _id to id, handles missing fields, etc.
 */

/**
 * Normalize an ID field (converts _id to id)
 * @param {object} item - Item with id or _id field
 * @returns {string|undefined} Normalized ID
 */
export const normalizeId = (item) => {
  if (!item) return undefined;
  return item?.id || item?._id;
};

/**
 * Normalize date input (converts Date object to YYYY-MM-DD string)
 * @param {Date|string} value - Date value to normalize
 * @returns {string} Normalized date string
 */
export const normalizeDateInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

/**
 * Normalize user object from API
 * @param {object} user - User object from API
 * @returns {object} Normalized user object
 */
export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: normalizeId(user),
  };
};

/**
 * Normalize medication object from API
 * @param {object} medication - Medication object from API
 * @returns {object} Normalized medication object
 */
export const normalizeMedication = (medication) => {
  if (!medication) return null;
  
  // Ensure dosage and quantity are numbers
  const dosage = typeof medication.dosage === 'string' ? parseFloat(medication.dosage) : (medication.dosage || 0);
  const quantity = typeof medication.quantity === 'string' ? parseFloat(medication.quantity) : (medication.quantity || 0);
  const initialQuantity = typeof medication.initialQuantity === 'string' ? parseFloat(medication.initialQuantity) : (medication.initialQuantity ?? quantity);

  const normalized = {
    ...medication,
    id: normalizeId(medication),
    dosage,
    quantity,
    initialQuantity,
    unit: medication.unit || (medication.type === 'pills' ? 'pills' : (medication.type === 'liquid' ? 'ml' : '')),
    status: medication.status || (medication.taken ? "taken" : "pending"),
    taken: Boolean(medication.taken),
  };
  // Preserve lastQuantityDelta if it exists
  if (!Object.prototype.hasOwnProperty.call(normalized, "lastQuantityDelta")) {
    normalized.lastQuantityDelta = 0;
  }
  return normalized;
};

/**
 * Normalize appointment object from API
 * @param {object} appointment - Appointment object from API
 * @returns {object} Normalized appointment object
 */
export const normalizeAppointment = (appointment) => {
  if (!appointment) return null;
  return {
    ...appointment,
    id: normalizeId(appointment),
    date: normalizeDateInput(appointment.date),
  };
};
