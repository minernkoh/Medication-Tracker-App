/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports editing all medication fields including: name, dosage, quantity, timeOfDay, additionalInfo
 */
import { useState, useEffect } from "react";
import { Modal, FormField, Button, TimePickerDropdown, SelectMenu } from "../ui";
import {
  getModeHexColor,
  getNowTimeInputRounded,
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
    instructions: [],
    additionalInfo: "",
    takenDate: "",
    takenTime: "",
  });
  const [scheduleTimeInput, setScheduleTimeInput] = useState("");
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
      const takenForInput = toTimeInput(medication.takenTime || "");
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
        unit: medication.unit || getUnitForType(medication.type || ""),
        timeOfDay: normalizedTimesOfDay,
        instructions,
        additionalInfo: medication.additionalInfo || "",
        takenDate: defaultTakenDate,
        takenTime: takenForInput,
      });
      setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
    }
  }, [medication]);

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

  const addScheduleTimeFromInput = (rawValue) => {
    const normalized = String(rawValue || "").trim();
    if (!/^\d{2}:\d{2}$/.test(normalized)) return;
    handleTimeOfDayChange(normalized);
    setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
    if (errors.timeOfDay) {
      setErrors((prev) => ({ ...prev, timeOfDay: "" }));
    }
  };

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
    };

    onSave(updatedMedication);
  };

  if (!isOpen || !medication) return null;

  const isCaregiver = mode === "Caregiver";
  const submitVariant = isCaregiver ? "secondary" : "primary";
  const cancelOverrideClassName = isCaregiver
    ? "border-secondary text-secondary hover:bg-secondary/5 focus-visible:ring-secondary/35"
    : "";
  const accentColor = getModeHexColor(mode);
  const isTakenMode = medication?.status === "taken" || medication?.taken;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Time"
      size="md"
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
              const form = document.getElementById("edit-medication-form");
              if (form) {
                form.requestSubmit();
              }
            }}
            fullWidth
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
              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Time Taken <span className="text-danger">*</span>
                </label>
                <TimePickerDropdown
                  value={formData.takenTime}
                  onChange={(time) => {
                    setFormData((prev) => ({ ...prev, takenTime: time }));
                    if (errors.takenTime) {
                      setErrors((prev) => ({ ...prev, takenTime: "" }));
                    }
                  }}
                  minuteStep={15}
                  mode={mode}
                />
                {errors.takenTime && (
                  <p className="mt-1.5 font-poppins font-semibold text-xs text-danger flex items-center gap-1.5 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-danger flex-shrink-0" />
                    {errors.takenTime}
                  </p>
                )}
              </div>
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

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  className="col-span-2"
                  label="Dosage"
                  name="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  error={errors.dosage}
                  required
                />
                <FormField
                  className="col-span-1"
                  label="Unit"
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., ml"
                />
              </div>

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
                  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 items-start">
                    {(formData.frequencyType === "timesPerDay" ||
                      formData.frequencyType === "everyHours") && (
                      <input
                        type="number"
                        name="frequencyValue"
                        value={formData.frequencyValue}
                        onChange={handleChange}
                        placeholder={
                          formData.frequencyType === "timesPerDay"
                            ? "e.g., 2"
                            : "e.g., 4"
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

                    <div
                      className={
                        formData.frequencyType === "custom" ? "sm:col-span-2" : ""
                      }
                    >
                      <SelectMenu
                        value={formData.frequencyType}
                        onChange={(nextValue) =>
                          handleChange({
                            target: { name: "frequencyType", value: nextValue },
                          })
                        }
                        options={[
                          { value: "timesPerDay", label: "Times per day" },
                          { value: "everyHours", label: "Every X hours" },
                          { value: "custom", label: "Custom" },
                        ]}
                        mode={mode}
                        aria-label="Frequency type"
                      />
                    </div>
                  </div>

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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full" aria-label="Schedule time">
                      <TimePickerDropdown
                        value={scheduleTimeInput}
                        onChange={(time) => setScheduleTimeInput(time)}
                        minuteStep={15}
                        mode={mode}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addScheduleTimeFromInput(scheduleTimeInput)}
                    >
                      Add
                    </Button>
                  </div>

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
                  className="col-span-3"
                  label="Total Quantity"
                  name="quantity"
                  type="text"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  error={errors.quantity}
                  required
                />
              </div>

              <div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    className="col-span-3"
                    label="Recommended Supply"
                    name="recommendSupply"
                    type="text"
                    value={formData.recommendSupply}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                  />
                </div>
                <p className="font-poppins text-xs text-text-secondary mt-2">
                  Used to calculate supply status and refill reminders. If left blank, we’ll use Total Quantity.
                </p>
              </div>

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
