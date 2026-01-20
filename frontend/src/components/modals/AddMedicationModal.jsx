/**
 * AddMedicationModal Component - Modal for adding new medications
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close modal callback
 * @param {function} onSave - Save medication callback
 * @param {object|null} medication - Optional medication to edit (prefills form)
 * @param {string} mode - "Personal" or "Caregiver"
 */
import { useState, useEffect } from "react";
import { Modal, Button } from "../ui";
import { PlusIcon } from "@phosphor-icons/react";
import {
  buildTimeOptions,
  getModeHexColor,
  roundTimeToInterval,
  TIME_BUCKET_TO_24H,
  to12HourDisplay,
  toTimeInput,
} from "../../utils";

const getUnitForType = (rawType) => {
  const t = String(rawType || "")
    .trim()
    .toLowerCase();
  if (!t) return "";
  // Common mappings used across the app (see normalization defaults)
  if (t === "liquid") return "ml";
  // Default: use the type string as the unit label
  return t;
};

const DEFAULT_FORM_DATA = {
  name: "",
  dosage: "",
  type: "pills",
  frequencyType: "timesPerDay",
  frequencyValue: "",
  frequencyText: "",
  quantity: "",
  recommendSupply: "",
  unit: getUnitForType("pills"),
  instructions: [],
  timeOfDay: [],
  additionalInfo: "",
};

const TIME_OPTIONS_15 = buildTimeOptions(15);

function AddMedicationModal({
  isOpen,
  onClose,
  onSave,
  medication = null,
  mode = "Personal",
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [scheduleTimeInput, setScheduleTimeInput] = useState("");

  const [errors, setErrors] = useState({});

  const isEditing = Boolean(medication);

  const parseFrequency = (frequency = "") => {
    if (!frequency)
      return {
        frequencyType: "timesPerDay",
        frequencyValue: "",
        frequencyText: "",
      };
    const normalized = String(frequency).trim();
    const hoursMatch = normalized.match(/every\s+(\d+)\s*hour/i);
    if (hoursMatch) {
      return {
        frequencyType: "everyHours",
        frequencyValue: hoursMatch[1],
        frequencyText: "",
      };
    }
    const timesMatch = normalized.match(/(\d+)\s*times\s*per\s*day/i);
    if (timesMatch) {
      return {
        frequencyType: "timesPerDay",
        frequencyValue: timesMatch[1],
        frequencyText: "",
      };
    }
    if (normalized.toLowerCase().includes("once daily")) {
      return {
        frequencyType: "timesPerDay",
        frequencyValue: "1",
        frequencyText: "",
      };
    }
    return {
      frequencyType: "custom",
      frequencyValue: "",
      frequencyText: normalized,
    };
  };

  // Reset/prefill form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(DEFAULT_FORM_DATA);
      setScheduleTimeInput("");
      setErrors({});
      return;
    }

    if (!medication) {
      setFormData(DEFAULT_FORM_DATA);
      setScheduleTimeInput("");
      setErrors({});
      return;
    }

    const timesOfDay = Array.isArray(medication.timesOfDay)
      ? medication.timesOfDay
      : medication.timeOfDay
        ? [medication.timeOfDay]
        : [];
    const normalizedTimesOfDay = (timesOfDay || [])
      .map((t) => {
        const raw = String(t || "").trim();
        if (!raw) return null;
        const lowered = raw.toLowerCase();
        if (TIME_BUCKET_TO_24H[lowered]) return TIME_BUCKET_TO_24H[lowered];
        const asTime = toTimeInput(raw);
        return asTime || null;
      })
      .filter(Boolean);

    const instructions = Array.isArray(medication.instructions)
      ? medication.instructions
      : [];

    const { frequencyType, frequencyValue, frequencyText } = parseFrequency(
      medication.frequency,
    );

    setFormData({
      name: medication.name || "",
      dosage:
        medication.dosage === 0 || medication.dosage
          ? String(medication.dosage)
          : "",
      type: medication.type || "pills",
      frequencyType,
      frequencyValue,
      frequencyText,
      quantity:
        medication.quantity === 0 || medication.quantity
          ? String(medication.quantity)
          : "",
      recommendSupply:
        medication.recommendSupply === 0 || medication.recommendSupply
          ? String(medication.recommendSupply)
          : "",
      unit:
        medication.unit ||
        getUnitForType(medication.type || DEFAULT_FORM_DATA.type) ||
        DEFAULT_FORM_DATA.unit,
      instructions,
      timeOfDay: normalizedTimesOfDay,
      additionalInfo: medication.additionalInfo || "",
    });
    setScheduleTimeInput("");
    setErrors({});
  }, [isOpen, medication]);

  const isCaregiver = mode === "Caregiver";
  const submitVariant = isCaregiver ? "secondary" : "primary";
  const cancelOverrideClassName = isCaregiver
    ? "border-secondary text-secondary hover:bg-secondary/5 focus-visible:ring-secondary/35"
    : "";
  const accentColor = getModeHexColor(mode);
  const formId = isEditing ? "edit-medication-details-form" : "add-medication-form";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => {
        const prevTypeUnit = getUnitForType(prev.type);
        const nextTypeUnit = getUnitForType(value);
        const shouldAutoUpdateUnit =
          !String(prev.unit || "").trim() || prev.unit === prevTypeUnit;
        return {
          ...prev,
          type: value,
          unit: shouldAutoUpdateUnit ? nextTypeUnit : prev.unit,
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Frequency validation uses a shared `frequency` key
    if (
      (name === "frequencyType" || name === "frequencyValue" || name === "frequencyText") &&
      errors.frequency
    ) {
      setErrors((prev) => ({ ...prev, frequency: "" }));
    }
  };

  const handleInstructionChange = (instruction) => {
    setFormData((prev) => {
      const instructions = prev.instructions.includes(instruction)
        ? prev.instructions.filter((inst) => inst !== instruction)
        : [...prev.instructions, instruction];
      return { ...prev, instructions };
    });
  };

  const handleTimeOfDayChange = (time) => {
    setFormData((prev) => {
      const normalized = String(time || "").trim();
      if (!normalized) return prev;
      const next = Array.isArray(prev.timeOfDay) ? [...prev.timeOfDay] : [];
      if (!next.includes(normalized)) next.push(normalized);
      return { ...prev, timeOfDay: next };
    });
  };

  const handleRemoveTimeOfDay = (time) => {
    setFormData((prev) => ({
      ...prev,
      timeOfDay: (prev.timeOfDay || []).filter((t) => t !== time),
    }));
  };

  const addScheduleTimeFromInput = (rawValue) => {
    const rounded = roundTimeToInterval(rawValue, 15, "nearest");
    if (!rounded) return;
    handleTimeOfDayChange(rounded);
    setScheduleTimeInput("");
    if (errors.timeOfDay) {
      setErrors((prev) => ({ ...prev, timeOfDay: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Field is required";
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Field is required";
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = "Field is required";
    }

    // Validate frequency based on type
    if (formData.frequencyType === "custom") {
      if (!formData.frequencyText.trim()) {
        newErrors.frequency = "Field is required";
      }
    } else if (!formData.frequencyValue) {
      newErrors.frequency = "Field is required";
    }

    // Validate time of day - at least one selection required
    if (!isEditing && formData.timeOfDay.length === 0) {
      newErrors.timeOfDay = "Field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Format frequency string
    let frequencyString = "";
    if (formData.frequencyType === "timesPerDay") {
      const times = formData.frequencyValue;
      frequencyString = times === "1" ? "Once daily" : `${times} times per day`;
    } else if (formData.frequencyType === "everyHours") {
      frequencyString = `Every ${formData.frequencyValue} hour${
        formData.frequencyValue !== "1" ? "s" : ""
      }`;
    } else {
      frequencyString = formData.frequencyText;
    }

    // Format instructions into additionalInfo string
    const additionalInfo =
      [
        formData.additionalInfo,
        ...(formData.instructions.length > 0
          ? [formData.instructions.join(", ")]
          : []),
      ]
        .filter(Boolean)
        .join(", ")
        .trim() || null;

    // Get the first time of day for timeOfDay field (for backward compatibility)
    const primaryTimeOfDay =
      formData.timeOfDay.length > 0 ? formData.timeOfDay[0] : null;

    const quantityValue = parseFloat(formData.quantity) || 0;
    const recommendSupplyValue =
      parseFloat(formData.recommendSupply) || quantityValue || 0;

    const payload = {
      ...(medication || {}),
      name: formData.name,
      dosage: parseFloat(formData.dosage) || 0,
      unit: formData.unit,
      type: formData.type,
      frequency: frequencyString,
      quantity: quantityValue,
      recommendSupply: recommendSupplyValue,
      additionalInfo: additionalInfo,
      instructions: formData.instructions,
      timeOfDay: primaryTimeOfDay,
      timesOfDay: formData.timeOfDay,
    };

    // Only set defaults for *new* medications
    if (!medication) {
      payload.status = "pending";
      payload.initialQuantity = quantityValue; // Used for percentage calculation
    } else if (payload.initialQuantity === null || payload.initialQuantity === undefined) {
      // Preserve existing initialQuantity; if missing, default to current quantity.
      payload.initialQuantity = quantityValue;
    }

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Medication" : "Add New Medication"}
      size="lg"
      mode={mode}
      footerContent={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            className={cancelOverrideClassName}
          >
            Cancel
          </Button>
          <Button
            variant={submitVariant}
            onClick={() => {
              const form = document.getElementById(formId);
              if (form) {
                form.requestSubmit();
              }
            }}
            fullWidth
          >
            {isEditing ? "Save Changes" : "Add Medication"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="p-5">
        <div className="flex flex-col gap-4">
          {/* Medication Name */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Medication Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Medication name"
              list="common-medications"
              className={`w-full px-4 py-3 rounded-xl border font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors ${
                errors.name ? "border-red-500" : "border-border-default"
              }`}
              required
            />
            <datalist id="common-medications">
              <option value="Aspirin">Aspirin</option>
              <option value="Ibuprofen">Ibuprofen</option>
              <option value="Acetaminophen">Acetaminophen (Tylenol)</option>
              <option value="Metformin">Metformin</option>
              <option value="Lisinopril">Lisinopril</option>
            </datalist>
            {errors.name && (
              <p className="font-poppins text-xs text-red-500 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Dosage + Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Dosage *
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 2"
                className={`w-full px-4 py-3 rounded-xl border font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors ${
                  errors.dosage ? "border-red-500" : "border-border-default"
                }`}
                required
              />
              {errors.dosage && (
                <p className="font-poppins text-xs text-red-500 mt-1">
                  {errors.dosage}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., ml"
                className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                aria-label="Dosage unit"
              />
            </div>
          </div>

          {/* Type - Text input with suggestions */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Type
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g., pills, tablets, liquid"
              list="medication-types"
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
            />
            <datalist id="medication-types">
              <option value="pills">Pills</option>
              <option value="tablets">Tablets</option>
              <option value="capsules">Capsules</option>
              <option value="liquid">Liquid</option>
              <option value="drops">Drops</option>
            </datalist>
          </div>

          {/* Frequency */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Frequency *
            </label>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 items-start">
                {/* Number value (shown for Times/Day and Every X hours) */}
                {(formData.frequencyType === "timesPerDay" ||
                  formData.frequencyType === "everyHours") && (
                  <input
                    type="number"
                    name="frequencyValue"
                    value={formData.frequencyValue}
                    onChange={handleChange}
                    placeholder={
                      formData.frequencyType === "timesPerDay" ? "e.g., 2" : "e.g., 4"
                    }
                    min={1}
                    max={formData.frequencyType === "timesPerDay" ? 12 : 24}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                    aria-label={
                      formData.frequencyType === "timesPerDay"
                        ? "Times per day"
                        : "Every X hours"
                    }
                  />
                )}

                {/* Frequency Type Selector */}
                <select
                  name="frequencyType"
                  value={formData.frequencyType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors ${
                    formData.frequencyType === "custom" ? "sm:col-span-2" : ""
                  }`}
                >
                  <option value="timesPerDay">Times per day</option>
                  <option value="everyHours">Every X hours</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {formData.frequencyType === "custom" && (
                <input
                  type="text"
                  name="frequencyText"
                  value={formData.frequencyText}
                  onChange={handleChange}
                  placeholder="e.g., Every 6 hours, 3 times daily, As needed"
                  className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                  required
                />
              )}
            </div>
            {errors.frequency && (
              <p className="font-poppins text-xs text-red-500 mt-1">
                {errors.frequency}
              </p>
            )}
          </div>

          {/* Schedule Times */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Schedule Time(s) *
            </label>
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-border-default bg-background-default">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={scheduleTimeInput}
                  onChange={(e) => setScheduleTimeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                  aria-label="Schedule time"
                >
                  <option value="">Select a time…</option>
                  {TIME_OPTIONS_15.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addScheduleTimeFromInput(scheduleTimeInput)}
                  aria-label="Add schedule time"
                  title="Add schedule time"
                  icon={<PlusIcon size={18} weight="bold" />}
                  className="px-3 border border-border-default text-text-primary hover:bg-background-hover"
                >
                </Button>
              </div>

              {Array.isArray(formData.timeOfDay) && formData.timeOfDay.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {[...formData.timeOfDay]
                    .slice()
                    .sort()
                    .map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-poppins font-semibold bg-background-hover text-text-primary border border-border-default"
                      >
                        {to12HourDisplay(t)}
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeOfDay(t)}
                          className="text-text-secondary hover:text-danger transition-colors"
                          aria-label={`Remove ${to12HourDisplay(t)}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
            {errors.timeOfDay && (
              <p className="font-poppins text-xs text-red-500 mt-1">
                {errors.timeOfDay}
              </p>
            )}
          </div>

          {/* Total Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Total Quantity *
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 30"
                className={`w-full px-4 py-3 rounded-xl border font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors ${
                  errors.quantity ? "border-red-500" : "border-border-default"
                }`}
                required
              />
              {errors.quantity && (
                <p className="font-poppins text-xs text-red-500 mt-1">
                  {errors.quantity}
                </p>
              )}
            </div>
          </div>

          {/* Recommended Supply */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Recommended Supply
                </label>
                <input
                  type="text"
                  name="recommendSupply"
                  value={formData.recommendSupply}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <p className="font-poppins text-xs text-text-secondary mt-2">
              Used to calculate supply status and refill reminders. If left blank, we’ll use Total Quantity.
            </p>
          </div>

          {/* Instructions */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Instructions
            </label>
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-border-default bg-background-default">
              {[
                "Before Meal",
                "After Meal",
                "With Food",
                "On Empty Stomach",
                "Causes Drowsiness",
                "Avoid Alcohol",
                "Take with Water",
                "Do Not Crush",
              ].map((instruction) => (
                <label
                  key={instruction}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
                >
                  <input
                    type="checkbox"
                    checked={formData.instructions.includes(instruction)}
                    onChange={() => handleInstructionChange(instruction)}
                    className="app-checkbox"
                    style={{ "--checkbox-accent": accentColor }}
                  />
                  <span className="font-poppins text-sm text-text-primary group-hover:text-text-primary">
                    {instruction}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes / Instructions */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Notes / Instructions
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="e.g., Take after meal, Before sleep"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-colors"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddMedicationModal;
