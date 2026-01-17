/**
 * AddAppointmentModal Component - Modal for creating/editing appointments
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close modal callback
 * @param {function} onSave - Save appointment callback
 * @param {object} appointment - Existing appointment for editing (null for new)
 * @param {string} mode - "Personal" or "Caregiver"
 */
import React, { useState, useEffect } from "react";
import { Modal, FormField, Button } from "../ui";
import { getModeHexColor } from "../../utils/modeUtils";

function AddAppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointment = null,
  mode = "Personal",
}) {
  const isEditing = !!appointment;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    doctorName: "",
    location: "",
    date: "",
    time: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  const normalizeDateInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title || "",
        doctorName: appointment.doctorName || "",
        location: appointment.location || "",
        date: normalizeDateInput(appointment.date),
        time: appointment.time || "",
        notes: appointment.notes || "",
      });
    } else {
      setFormData({
        title: "",
        doctorName: "",
        location: "",
        date: "",
        time: "",
        notes: "",
      });
    }
    setErrors({});
  }, [appointment, isOpen]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Appointment title is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const appointmentData = {
      ...formData,
      ...(isEditing && { id: appointment.id }),
    };

    onSave(appointmentData);
  };

  if (!isOpen) return null;

  const primaryColor = getModeHexColor(mode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Appointment" : "New Appointment"}
      size="md"
      footerContent={
        <>
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const form = document.getElementById("appointment-form");
              if (form) {
                form.requestSubmit();
              }
            }}
            fullWidth
            style={{ backgroundColor: primaryColor }}
          >
            {isEditing ? "Save Changes" : "Add Appointment"}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={handleSubmit} className="p-5">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <FormField
            label="Appointment Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Appointment title"
            error={errors.title}
            required
          />

          {/* Doctor Name */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Doctor Name
              <span className="font-normal text-text-secondary ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              placeholder="e.g., Dr Williams"
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Location */}
          <FormField
            label="Location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Clinic location"
            error={errors.location}
            required
          />

          {/* Date and Time row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
            <FormField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              error={errors.time}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
              Notes
              <span className="font-normal text-text-secondary ml-1">
                (optional)
              </span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-colors"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddAppointmentModal;
