/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports both pending/taken medications and supply medications
 * Fields include: name, dosage, quantity, timeOfDay, additionalInfo
 */
import React, { useState, useEffect } from "react";
import { XIcon } from "@phosphor-icons/react";
import { colors, getPrimaryColor } from "../../utils/colors";

function EditMedicationModal({
  isOpen,
  onClose,
  onSave,
  medication = null,
  mode = "Personal",
}) {
  const primaryColor = getPrimaryColor(mode);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    quantity: "",
    timeOfDay: "",
    takenTime: "",
    additionalInfo: "",
  });

  // Convert a display time like "9:00 AM" or "21:30" to HH:MM for <input type="time">
  const toTimeInput = (value) => {
    if (!value) return "";
    const trimmed = value.trim();

    // Handle 12-hour format with AM/PM
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10);
      const minute = ampmMatch[2];
      const ampm = ampmMatch[3].toUpperCase();
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, "0")}:${minute}`;
    }

    // Handle 24-hour format already
    if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

    return "";
  };

  // Convert HH:MM to 12-hour display (e.g., 09:00 -> 9:00 AM)
  const to12HourDisplay = (value) => {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) return value || "";
    const [h, m] = value.split(":");
    const hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${m} ${ampm}`;
  };

  const isTakenMode = medication?.status === "taken" || medication?.taken;

  useEffect(() => {
    if (medication) {
      const timeForInput = toTimeInput(medication.timeOfDay || "");
      const takenForInput = toTimeInput(medication.takenTime || timeForInput);
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        quantity: medication.quantity || "",
        // Store as HH:MM for the time input
        timeOfDay: timeForInput,
        takenTime: takenForInput,
        additionalInfo: medication.additionalInfo || "",
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isTakenMode) {
      // Only allow editing the "taken at" time for taken medications
      const formattedTakenTime = to12HourDisplay(
        formData.takenTime || formData.timeOfDay
      );
      const updatedMedication = {
        ...medication,
        takenTime: formattedTakenTime,
      };
      onSave(updatedMedication);
      return;
    }

    const updatedMedication = {
      ...medication,
      ...formData,
    };
    onSave(updatedMedication);
  };

  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-background-default rounded-2xl w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="font-poppins font-bold text-xl text-text-primary">
            Edit Medication
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-hover transition-colors"
          >
            <XIcon size={24} weight="regular" color={colors.icon.primary} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            {isTakenMode ? (
              // Taken medications: only allow editing the "Taken at" time
              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Taken at
                </label>
                <input
                  type="time"
                  name="takenTime"
                  value={formData.takenTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary"
                  required
                />
              </div>
            ) : (
              // Pending/Supply: show full editable fields
              <>
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Dosage
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                {/* Quantity field */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 30 pills, 60ml"
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Time of Day field */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Time of Day
                  </label>
                  <input
                    type="time"
                    name="timeOfDay"
                    value={formData.timeOfDay}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-text-primary border border-border-default hover:bg-background-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-white hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMedicationModal;
