/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports editing all medication fields including: name, dosage, quantity, timeOfDay, refillDate, additionalInfo
 */
import React, { useState, useEffect } from "react";
import { Modal, FormField, Button } from "../ui";
import { getModeHexColor, toTimeInput } from "../../utils";

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
    unit: "",
    timeOfDay: [],
    refillDate: "",
    instructions: [],
    additionalInfo: "",
    takenDate: "",
    takenTime: "",
  });

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
      const takenForInput = toTimeInput(medication.takenTime || "");
      const defaultTakenDate = new Date().toISOString().split("T")[0];
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        type: medication.type || "pills",
        frequencyType,
        frequencyValue,
        frequencyText,
        quantity: medication.quantity || "",
        unit: medication.unit || "",
        timeOfDay: timesOfDay,
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const isSelected = prev.timeOfDay.includes(time);
      const newTimes = isSelected
        ? prev.timeOfDay.filter((t) => t !== time)
        : [...prev.timeOfDay, time];
      return { ...prev, timeOfDay: newTimes };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isTakenMode) {
      onSave({
        ...medication,
        takenDate: formData.takenDate,
        takenTime: medication.takenTime,
      });
      return;
    }

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
                label="Date Taken"
                name="takenDate"
                type="date"
                value={formData.takenDate}
                onChange={handleChange}
                required
              />

              <FormField
                label="Time Taken"
                name="takenTime"
                type="time"
                value={formData.takenTime}
                onChange={handleChange}
                step="900"
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
                required
              />

              <FormField
                label="Dosage"
                name="dosage"
                type="text"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg or 2"
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

              <FormField
                label="Unit"
                name="unit"
                type="text"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., pills, ml, mg"
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
              </div>

              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Time of Day
                </label>
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-border-default bg-background-default">
                  {[
                    { label: "Morning", sub: "(8:00 AM)", value: "morning" },
                    { label: "Afternoon", sub: "(1:00 PM)", value: "afternoon" },
                    { label: "Night", sub: "(9:00 PM)", value: "night" },
                  ].map(({ label, sub, value }) => {
                    const isSelected = formData.timeOfDay.includes(value);
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTimeOfDayChange(value)}
                          className="w-4 h-4 rounded border-2 border-border-default cursor-pointer transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-0"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="font-poppins text-sm text-text-primary group-hover:text-text-primary capitalize">
                          {label} <span className="text-text-secondary text-xs">{sub}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <FormField
                label="Quantity"
                name="quantity"
                type="text"
                value={formData.quantity}
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
                        className="w-4 h-4 rounded border-2 border-border-default cursor-pointer transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        style={{ accentColor: primaryColor }}
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
