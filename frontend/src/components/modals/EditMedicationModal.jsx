/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports editing all medication fields including: name, dosage, quantity, timeOfDay, refillDate, additionalInfo
 */
import React, { useMemo, useState, useEffect } from "react";
import { Modal, FormField, Button } from "../ui";
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
  if (t === "liquid") return "ml";
  return t;
};

function EditMedicationModal({
  isOpen,
  onClose,
  onSave,
  medication = null,
  mode = "Personal",
}) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    type: "pills",
    frequencyType: "timesPerDay",
    frequencyValue: "",
    frequencyText: "",
    quantity: "",
    recommendSupply: "",
    unit: "",
    timeOfDay: [],
    refillDate: "",
    instructions: [],
    additionalInfo: "",
    takenDate: "",
    takenTime: "",
  });
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (medication) {
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
        : medication.additionalInfo
          ? medication.additionalInfo
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean)
          : [];
      const { frequencyType, frequencyValue, frequencyText } = parseFrequency(
        medication.frequency,
      );
      const takenForInput = roundTimeToInterval(
        toTimeInput(medication.takenTime || ""),
        15,
        "nearest",
      );
      const defaultTakenDate =
        medication.takenDate || new Date().toISOString().split("T")[0];
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        type: medication.type || "pills",
        frequencyType,
        frequencyValue,
        frequencyText,
        quantity: medication.quantity || "",
        recommendSupply: medication.recommendSupply || "",
        unit: getUnitForType(medication.type || ""),
        timeOfDay: normalizedTimesOfDay,
        refillDate: medication.refillDate || "",
        instructions,
        additionalInfo: medication.additionalInfo || "",
        takenDate: defaultTakenDate,
        takenTime: takenForInput,
      });
    }
  }, [medication]);

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
    if (errors.timeOfDay) {
      setErrors((prev) => ({ ...prev, timeOfDay: "" }));
    }
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
    if (isTakenMode) {
      if (!formData.takenTime) newErrors.takenTime = "Field is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!String(formData.name || "").trim()) newErrors.name = "Field is required";
    if (!String(formData.dosage || "").trim()) newErrors.dosage = "Field is required";
    if (!String(formData.quantity || "").trim()) newErrors.quantity = "Field is required";

    if (formData.frequencyType === "custom") {
      if (!String(formData.frequencyText || "").trim()) newErrors.frequency = "Field is required";
    } else if (!formData.frequencyValue) {
      newErrors.frequency = "Field is required";
    }

    if (!Array.isArray(formData.timeOfDay) || formData.timeOfDay.length === 0) {
      newErrors.timeOfDay = "Field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isTakenMode) {
      if (!validate()) return;
      onSave({
        ...medication,
        takenDate:
          formData.takenDate ||
          medication?.takenDate ||
          new Date().toISOString().split("T")[0],
        takenTime: formData.takenTime ? to12HourDisplay(formData.takenTime) : "",
      });
      return;
    }

    if (!validate()) return;

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

    const additionalInfo = [
      formData.additionalInfo,
      ...(formData.instructions.length > 0
        ? [formData.instructions.join(", ")]
        : []),
    ]
      .filter(Boolean)
      .join(", ");

    const updatedMedication = {
      ...medication,
      name: formData.name,
      dosage: parseFloat(formData.dosage) || 0,
      type: formData.type,
      frequency: frequencyString,
      quantity: parseFloat(formData.quantity) || 0,
      recommendSupply: parseFloat(formData.recommendSupply) || 0,
      unit: formData.unit,
      timeOfDay: formData.timeOfDay?.[0] || null,
      timesOfDay: formData.timeOfDay,
      instructions: formData.instructions,
      additionalInfo,
      refillDate: formData.refillDate,
    };

    onSave(updatedMedication);
  };

  if (!isOpen || !medication) return null;

  const primaryColor = getModeHexColor(mode);
  const isTakenMode = medication?.status === "taken" || medication?.taken;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Medication"
      size="md"
      footerContent={
        <>
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const form = document.getElementById("edit-medication-form");
              if (form) {
                form.requestSubmit();
              }
            }}
            fullWidth
            style={{ backgroundColor: primaryColor }}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form id="edit-medication-form" onSubmit={handleSubmit} className="p-5">
        <div className="space-y-4">
          {isTakenMode ? (
            <>
              <FormField
                label="Time Taken"
                name="takenTime"
                type="time"
                value={formData.takenTime}
                onChange={handleChange}
                step="900"
                error={errors.takenTime}
                required
              />
            </>
          ) : (
            <>
              <FormField
                label="Medication Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <FormField
                label="Dosage"
                name="dosage"
                type="text"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg or 2"
                error={errors.dosage}
                required
              />

              <FormField
                label="Type"
                name="type"
                type="text"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g., pills, tablets, liquid"
              />

              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Frequency
                </label>
                <div className="flex flex-col gap-3">
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
                      placeholder="e.g., Every 6 hours, 3 times daily"
                      className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  )}
                </div>
                {errors.frequency && (
                  <p className="mt-1.5 font-poppins font-semibold text-xs text-danger">
                    {errors.frequency}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Schedule Time(s)
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

                  {Array.isArray(formData.timeOfDay) &&
                    formData.timeOfDay.length > 0 && (
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
                  <p className="mt-1.5 font-poppins font-semibold text-xs text-danger">
                    {errors.timeOfDay}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  className="col-span-2"
                  label="Total Quantity"
                  name="quantity"
                  type="text"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  error={errors.quantity}
                  required
                />
                <div className="col-span-1">
                  <FormField
                    label="Unit"
                    name="unit"
                    type="text"
                    value={formData.unit}
                    onChange={handleChange}
                    readOnly
                    className=""
                  />
                  <p className="font-poppins text-[10px] text-text-secondary mt-1">
                    Auto-filled from Type
                  </p>
                </div>
              </div>

              <FormField
                label="Recommended Supply"
                name="recommendSupply"
                type="text"
                value={formData.recommendSupply}
                onChange={handleChange}
                placeholder="e.g., 30 pills"
              />

              <FormField
                label="Refill Date"
                name="refillDate"
                type="date"
                value={formData.refillDate}
                onChange={handleChange}
              />

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
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default EditMedicationModal;
