/**
 * Simple EditMedicationModal Component
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
    additionalInfo: "",
  });

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
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
