/**
 * Medication Presets
 * Simple, editable templates to help users autofill the Add Medication form.
 *
 * Notes:
 * - `dosage` here represents the per-intake amount in the same unit as `quantity`
 *   (since intake reduces `quantity` by `dosage` in backend logic).
 * - `timeOfDay` is stored as an array of 24h "HH:MM" strings to match existing UI.
 */

const normalizeNameKey = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  // Strip common parenthetical brand names: "Acetaminophen (Tylenol)" -> "acetaminophen"
  const noParen = raw.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  return noParen.replace(/\s+/g, " ");
};

export const MEDICATION_PRESETS = [
  // IMPORTANT:
  // - Keep at most 10 presets (we enforce this below).
  // - Keep presets alphabetically sorted by label for a stable dropdown order.
  {
    key: "acetaminophen",
    label: "Acetaminophen / Tylenol (2x daily)",
    names: ["Acetaminophen", "Acetaminophen (Tylenol)", "Tylenol"],
    formData: {
      name: "Acetaminophen",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "2",
      frequencyText: "",
      quantity: "60",
      recommendSupply: "60",
      instructions: ["Take with Water"],
      timeOfDay: ["09:00", "21:00"],
      additionalInfo: "",
    },
  },
  {
    key: "aspirin",
    label: "Aspirin (once daily)",
    names: ["Aspirin"],
    formData: {
      name: "Aspirin",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "1",
      frequencyText: "",
      quantity: "30",
      recommendSupply: "30",
      instructions: ["After Meal", "Take with Water"],
      timeOfDay: ["08:00"],
      additionalInfo: "",
    },
  },
  {
    key: "atorvastatin",
    label: "Atorvastatin (nightly)",
    names: ["Atorvastatin", "Lipitor"],
    formData: {
      name: "Atorvastatin",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "1",
      frequencyText: "",
      quantity: "30",
      recommendSupply: "30",
      instructions: ["Take with Water"],
      timeOfDay: ["21:00"],
      additionalInfo: "",
    },
  },
  {
    key: "ibuprofen",
    label: "Ibuprofen (3x daily)",
    names: ["Ibuprofen"],
    formData: {
      name: "Ibuprofen",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "3",
      frequencyText: "",
      quantity: "90",
      recommendSupply: "90",
      instructions: ["With Food", "Take with Water"],
      timeOfDay: ["08:00", "14:00", "20:00"],
      additionalInfo: "",
    },
  },
  {
    key: "levothyroxine",
    label: "Levothyroxine (morning, empty stomach)",
    names: ["Levothyroxine", "Synthroid"],
    formData: {
      name: "Levothyroxine",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "1",
      frequencyText: "",
      quantity: "30",
      recommendSupply: "30",
      instructions: ["On Empty Stomach", "Take with Water"],
      timeOfDay: ["07:00"],
      additionalInfo: "",
    },
  },
  {
    key: "lisinopril",
    label: "Lisinopril (once daily)",
    names: ["Lisinopril"],
    formData: {
      name: "Lisinopril",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "1",
      frequencyText: "",
      quantity: "30",
      recommendSupply: "30",
      instructions: ["Take with Water"],
      timeOfDay: ["08:00"],
      additionalInfo: "",
    },
  },
  {
    key: "metformin",
    label: "Metformin (2x daily)",
    names: ["Metformin"],
    formData: {
      name: "Metformin",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "2",
      frequencyText: "",
      quantity: "60",
      recommendSupply: "60",
      instructions: ["With Food", "Take with Water"],
      timeOfDay: ["08:00", "20:00"],
      additionalInfo: "",
    },
  },
  {
    key: "omeprazole",
    label: "Omeprazole (before breakfast)",
    names: ["Omeprazole", "Prilosec"],
    formData: {
      name: "Omeprazole",
      dosage: "1",
      type: "capsules",
      unit: "capsules",
      frequencyType: "timesPerDay",
      frequencyValue: "1",
      frequencyText: "",
      quantity: "30",
      recommendSupply: "30",
      instructions: ["Before Meal", "Take with Water"],
      timeOfDay: ["07:30"],
      additionalInfo: "",
    },
  },
  {
    key: "paracetamol",
    label: "Paracetamol / Panadol (4x daily)",
    // Include the misspelling requested so it still matches autocomplete input.
    names: ["Paracetamol", "Paractemol", "Panadol"],
    formData: {
      name: "Paracetamol",
      dosage: "1",
      type: "tablets",
      unit: "tablets",
      frequencyType: "timesPerDay",
      frequencyValue: "4",
      frequencyText: "",
      quantity: "120",
      recommendSupply: "120",
      instructions: ["After Meal", "Take with Water"],
      timeOfDay: ["06:00", "12:00", "18:00", "22:00"],
      additionalInfo: "",
    },
  },
].slice().sort((a, b) => String(a?.label || "").localeCompare(String(b?.label || ""))).slice(0, 10);

const PRESETS_BY_NAME = (() => {
  const map = new Map();
  for (const preset of MEDICATION_PRESETS) {
    const names = Array.isArray(preset.names) ? preset.names : [];
    for (const n of names) {
      const key = normalizeNameKey(n);
      if (!key) continue;
      if (!map.has(key)) map.set(key, preset);
    }
  }
  return map;
})();

export const findMedicationPresetByName = (name) => {
  const key = normalizeNameKey(name);
  return key ? PRESETS_BY_NAME.get(key) || null : null;
};

