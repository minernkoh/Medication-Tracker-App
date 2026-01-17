/**
 * EditMedicationModal Component - Allows editing medication details
 * Supports both pending/taken medications and supply medications
 * Fields include: name, dosage, quantity, timeOfDay, additionalInfo
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
    timeOfDay: "",
    takenTime: "",
    additionalInfo: "",
  });


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

  const primaryColor = getModeHexColor(mode);

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
      <form
        id="edit-medication-form"
        onSubmit={handleSubmit}
        className="p-5"
      >
        <div className="space-y-4">
          {isTakenMode ? (
            // Taken medications: only allow editing the "Taken at" time
            <FormField
              label="Taken at"
              name="takenTime"
              type="time"
              value={formData.takenTime}
              onChange={handleChange}
              required
            />
          ) : (
            // Pending/Supply: show full editable fields
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
                required
              />
              <FormField
                label="Quantity"
                name="quantity"
                type="text"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 30 pills, 60ml"
              />
              <FormField
                label="Time of Day"
                name="timeOfDay"
                type="time"
                value={formData.timeOfDay}
                onChange={handleChange}
              />
              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
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
