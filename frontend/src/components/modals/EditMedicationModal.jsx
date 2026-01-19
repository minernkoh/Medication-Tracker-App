/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports editing all medication fields including: name, dosage, quantity, timeOfDay, refillDate, additionalInfo
 */
import React, { useState, useEffect } from "react";
import { Modal, FormField, Button } from "../ui";
import { getModeHexColor, toTimeInput, to12HourDisplay } from "../../utils";

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
    quantity: "",
    unit: "",
    timeOfDay: "",
    refillDate: "",
    additionalInfo: "",
    takenTime: "",
  });

  useEffect(() => {
    if (medication) {
      const timeForInput = toTimeInput(medication.timeOfDay || "");
      const takenForInput = toTimeInput(medication.takenTime || timeForInput);
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        quantity: medication.quantity || "",
        unit: medication.unit || "",
        timeOfDay: timeForInput,
        refillDate: medication.refillDate || "",
        additionalInfo: medication.additionalInfo || "",
        takenTime: takenForInput,
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // For taken medications, update time if changed
    const updatedMedication = {
      ...medication,
      name: formData.name,
      dosage: parseFloat(formData.dosage) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      additionalInfo: formData.additionalInfo,
      refillDate: formData.refillDate,
    };

    // Update timeOfDay if it's a pending/supply medication
    if (medication.status !== "taken") {
      updatedMedication.timeOfDay = formData.timeOfDay;
    }

    // Update takenTime if it's a taken medication
    if (medication.status === "taken" || medication.taken) {
      updatedMedication.takenTime = to12HourDisplay(
        formData.takenTime || formData.timeOfDay
      );
    }

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
          {/* Name */}
          <FormField
            label="Medication Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Dosage */}
          <FormField
            label="Dosage"
            name="dosage"
            type="text"
            value={formData.dosage}
            onChange={handleChange}
            placeholder="e.g., 2 pills, 500mg"
            required
          />

          {/* Quantity */}
          <FormField
            label="Quantity"
            name="quantity"
            type="text"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g., 30, 60"
          />

          {/* Unit */}
          <FormField
            label="Unit"
            name="unit"
            type="text"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g., pills, ml, mg"
          />

          {/* Time of Day (for pending/supply medications) */}
          {!isTakenMode && (
            <FormField
              label="Time of Day"
              name="timeOfDay"
              type="time"
              value={formData.timeOfDay}
              onChange={handleChange}
            />
          )}

          {/* Refill Date */}
          <FormField
            label="Refill Date"
            name="refillDate"
            type="date"
            value={formData.refillDate}
            onChange={handleChange}
          />

          {/* Taken Time (for taken medications) */}
          {isTakenMode && (
            <FormField
              label="Taken at"
              name="takenTime"
              type="time"
              value={formData.takenTime}
              onChange={handleChange}
              required
            />
          )}

          {/* Additional Information / Instructions */}
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

export default EditMedicationModal;
