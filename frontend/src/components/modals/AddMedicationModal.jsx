/**
 * AddMedicationModal Component - Modal for adding new medications
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close modal callback
 * @param {function} onSave - Save medication callback
 * @param {string} mode - "Personal" or "Caregiver"
 */
import React, { useMemo, useState, useEffect } from "react";
import { Modal, Button } from "../ui";
import { buildTimeOptions, getModeHexColor, to12HourDisplay } from "../../utils";

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

function AddMedicationModal({ isOpen, onClose, onSave, mode = "Personal" }) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    type: "pills",
    frequencyType: "timesPerDay",
    frequencyValue: "",
    frequencyText: "",
    quantity: "",
    recommendSupply: "",
    unit: "pills",
    instructions: [],
    timeOfDay: [],
    refillDate: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        dosage: "",
        type: "pills",
        frequencyType: "timesPerDay",
        frequencyValue: "",
        frequencyText: "",
        quantity: "",
        recommendSupply: "",
        unit: "pills",
        instructions: [],
        timeOfDay: [],
        refillDate: "",
        additionalInfo: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const primaryColor = getModeHexColor(mode);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        unit: getUnitForType(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const timeOptions = useMemo(() => buildTimeOptions(15), []);

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
    if (formData.timeOfDay.length === 0) {
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

    // Create new medication object
    const newMedication = {
      name: formData.name,
      dosage: parseFloat(formData.dosage) || 0,
      unit: formData.unit,
      type: formData.type,
      frequency: frequencyString,
      status: "pending",
      quantity: parseFloat(formData.quantity) || 0,
      recommendSupply:
        parseFloat(formData.recommendSupply) ||
        parseFloat(formData.quantity) ||
        0,
      initialQuantity: parseFloat(formData.quantity) || 0, // Track initial quantity for percentage calculation
      additionalInfo: additionalInfo,
      refillDate: formData.refillDate || "",
      instructions: formData.instructions,
      timeOfDay: primaryTimeOfDay,
      timesOfDay: formData.timeOfDay,
    };

    onSave(newMedication);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Medication"
      size="lg"
      footerContent={
        <>
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const form = document.getElementById("add-medication-form");
              if (form) {
                form.requestSubmit();
              }
            }}
            fullWidth
            style={{ backgroundColor: primaryColor }}
          >
            Add Medication
          </Button>
        </>
      }
    >
      <form id="add-medication-form" onSubmit={handleSubmit} className="p-5">
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

          {/* Dosage */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Dosage *
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g., 500mg or 2"
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
              {/* Frequency Type Selector */}
              <select
                name="frequencyType"
                value={formData.frequencyType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
              >
                <option value="timesPerDay">Times per day</option>
                <option value="everyHours">Every X hours</option>
                <option value="custom">Custom</option>
              </select>

              {/* Frequency Input based on type */}
              {formData.frequencyType === "timesPerDay" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="frequencyValue"
                    value={formData.frequencyValue}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    min="1"
                    max="12"
                    className="w-24 px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <span className="font-poppins text-sm text-text-secondary">
                    times per day
                  </span>
                </div>
              )}

              {formData.frequencyType === "everyHours" && (
                <div className="flex items-center gap-2">
                  <span className="font-poppins text-sm text-text-secondary">
                    Every
                  </span>
                  <input
                    type="number"
                    name="frequencyValue"
                    value={formData.frequencyValue}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                    min="1"
                    max="24"
                    className="w-24 px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <span className="font-poppins text-sm text-text-secondary">
                    hour(s)
                  </span>
                </div>
              )}

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
              <select
                value=""
                onChange={(e) => {
                  handleTimeOfDayChange(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
              >
                <option value="" disabled>
                  Select a time (15-minute intervals)
                </option>
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

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
            <div className="col-span-2">
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
            <div className="col-span-1">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-hover focus:outline-none"
                aria-label="Unit (auto-filled from Type)"
              />
              <p className="font-poppins text-[10px] text-text-secondary mt-1">
                Auto-filled from Type
              </p>
            </div>
          </div>

          {/* Recommended Supply */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Recommended Supply
            </label>
            <input
              type="text"
              name="recommendSupply"
              value={formData.recommendSupply}
              onChange={handleChange}
              placeholder="e.g., 30 pills"
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
            />
            <p className="font-poppins text-xs text-text-secondary mt-2">
              Used to calculate supply status and refill reminders. If left blank, we’ll use Total Quantity.
            </p>
          </div>

          {/* Refill Date */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Refill Date
            </label>
            <input
              type="date"
              name="refillDate"
              value={formData.refillDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
            />
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
                    style={{ "--checkbox-accent": primaryColor }}
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
