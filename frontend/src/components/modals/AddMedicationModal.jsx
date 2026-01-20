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
import { Modal, Button, TimePickerDropdown, SelectMenu, AutocompleteInput } from "../ui";
import { PlusIcon } from "@phosphor-icons/react";
import {
  getModeHexColor,
  getNowTimeInputRounded,
  findMedicationPresetByName,
  MEDICATION_PRESETS,
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
      setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
      setErrors({});
      return;
    }

    if (!medication) {
      setFormData(DEFAULT_FORM_DATA);
      setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
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
    setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
    setErrors({});
  }, [isOpen, medication]);

  const isCaregiver = mode === "Caregiver";
  const submitVariant = isCaregiver ? "secondary" : "primary";
  const accentColor = getModeHexColor(mode);
  const formId = isEditing ? "edit-medication-details-form" : "add-medication-form";

  // Unit is derived from Type (and presets); keep the supply/quantity unit fields non-editable.
  const readOnlyUnitInputClass =
    "w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-secondary bg-background-subtle focus:outline-none focus:border-border-default transition-colors cursor-not-allowed";

  const inputBaseClass =
    "w-full px-4 py-3 rounded-xl border font-poppins text-sm text-text-primary bg-background-default focus:outline-none transition-colors";
  const inputFocusClass = isCaregiver
    ? "focus:border-secondary focus:ring-2 focus:ring-secondary/20"
    : "focus:border-primary focus:ring-2 focus:ring-primary/20";
  const inputNormalClass = `${inputBaseClass} border-border-default ${inputFocusClass}`;
  const inputErrorClass = `${inputBaseClass} border-danger focus:border-danger focus:ring-2 focus:ring-danger/20`;
  const getInputClass = (hasError) => (hasError ? inputErrorClass : inputNormalClass);

  const renderError = (name) => {
    if (!errors?.[name]) return null;
    return (
      <p
        className="mt-1.5 font-poppins font-semibold text-xs text-danger flex items-center gap-1.5 animate-fade-in"
        role="alert"
        aria-live="polite"
      >
        <span className="inline-block w-1 h-1 rounded-full bg-danger flex-shrink-0" />
        {errors[name]}
      </p>
    );
  };

  const applyPreset = (preset) => {
    if (!preset || !preset.formData) return;
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...preset.formData,
      // Ensure arrays exist
      instructions: Array.isArray(preset.formData.instructions) ? preset.formData.instructions : [],
      timeOfDay: Array.isArray(preset.formData.timeOfDay) ? preset.formData.timeOfDay : [],
    });
    setErrors({});
  };

  const isFormEmptyEnoughToAutofill = (fd) => {
    // Only autofill from name suggestions when the user hasn't meaningfully started filling other fields.
    return (
      !String(fd?.dosage || "").trim() &&
      !String(fd?.quantity || "").trim() &&
      !String(fd?.recommendSupply || "").trim() &&
      !String(fd?.frequencyValue || "").trim() &&
      !String(fd?.frequencyText || "").trim() &&
      (!Array.isArray(fd?.timeOfDay) || fd.timeOfDay.length === 0) &&
      (!Array.isArray(fd?.instructions) || fd.instructions.length === 0) &&
      !String(fd?.additionalInfo || "").trim()
    );
  };

  const maybeAutofillFromName = (nextName, fdSnapshot) => {
    if (isEditing) return;
    if (!nextName) return;
    const preset = findMedicationPresetByName(nextName);
    if (!preset) return;
    if (!isFormEmptyEnoughToAutofill(fdSnapshot)) return;
    applyPreset(preset);
  };

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
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        if (name === "name") {
          // If the user picked a known medication from the datalist (exact match),
          // autofill the rest of the form only if they haven't started filling it.
          maybeAutofillFromName(value, prev);
        }
        return next;
      });
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

  const presetNameOptions = (() => {
    const seen = new Set();
    const list = [];
    for (const preset of MEDICATION_PRESETS || []) {
      const names = Array.isArray(preset?.names) ? preset.names : [];
      for (const raw of names) {
        const n = String(raw || "").trim();
        if (!n) continue;
        const key = n.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ value: n, label: n });
      }
    }
    return list.sort((a, b) => a.label.localeCompare(b.label));
  })();

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
            variant="modalSecondary"
            onClick={onClose}
            fullWidth
            mode={mode}
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
              Medication Name <span className="text-danger ml-1">*</span>
            </label>
            <AutocompleteInput
              id="presets"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Medication name"
              required
              disabled={false}
              mode={mode}
              options={presetNameOptions}
              aria-label="Medication name"
              ariaInvalid={Boolean(errors.name)}
              ariaDescribedBy={errors.name ? "name-error" : undefined}
              className={getInputClass(Boolean(errors.name))}
            />
            {renderError("name")}
          </div>

          {/* Dosage + Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Dosage <span className="text-danger ml-1">*</span>
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 2"
                className={getInputClass(Boolean(errors.dosage))}
                required
              />
              {renderError("dosage")}
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
                className={getInputClass(false)}
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
              className={getInputClass(false)}
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
              Frequency <span className="text-danger ml-1">*</span>
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
                    className={getInputClass(Boolean(errors.frequency))}
                    required
                    aria-label={
                      formData.frequencyType === "timesPerDay"
                        ? "Times per day"
                        : "Every X hours"
                    }
                  />
                )}

                {/* Frequency Type Selector */}
                <div className={formData.frequencyType === "custom" ? "sm:col-span-2" : ""}>
                  <SelectMenu
                    value={formData.frequencyType}
                    onChange={(nextValue) =>
                      handleChange({ target: { name: "frequencyType", value: nextValue } })
                    }
                    options={[
                      { value: "timesPerDay", label: "Times per day" },
                      { value: "everyHours", label: "Every X hours" },
                      { value: "custom", label: "Custom" },
                    ]}
                    mode={mode}
                    aria-label="Frequency type"
                    buttonClassName="w-full"
                  />
                </div>
              </div>

              {formData.frequencyType === "custom" && (
                <input
                  type="text"
                  name="frequencyText"
                  value={formData.frequencyText}
                  onChange={handleChange}
                  placeholder="e.g., Every 6 hours, 3 times daily, As needed"
                  className={getInputClass(Boolean(errors.frequency))}
                  required
                />
              )}
            </div>
            {renderError("frequency")}
          </div>

          {/* Schedule Times */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Schedule Time(s) <span className="text-danger ml-1">*</span>
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
                  aria-label="Add schedule time"
                  title="Add schedule time"
                  mode={mode}
                  icon={<PlusIcon size={18} weight="bold" />}
                  className="px-3"
                >
                  Add
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
            {renderError("timeOfDay")}
          </div>

          {/* Total Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Total Quantity <span className="text-danger ml-1">*</span>
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 30"
                className={getInputClass(Boolean(errors.quantity))}
                required
              />
              {renderError("quantity")}
            </div>
            <div className="col-span-1">
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                placeholder="e.g., pills"
                readOnly
                className={readOnlyUnitInputClass}
                aria-label="Quantity unit"
              />
            </div>
          </div>

          {/* Recommended Supply */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Recommended Supply
                </label>
                <input
                  type="text"
                  name="recommendSupply"
                  value={formData.recommendSupply}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  className={getInputClass(false)}
                />
              </div>
              <div className="col-span-1">
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  placeholder="e.g., pills"
                  readOnly
                  className={readOnlyUnitInputClass}
                  aria-label="Supply unit"
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
              className={`${getInputClass(false)} resize-none`}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddMedicationModal;
