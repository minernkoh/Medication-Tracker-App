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
import { XIcon } from "@phosphor-icons/react";
import { colors, getPrimaryColor } from "../utils/colors";

function AddAppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointment = null,
  mode = "Personal",
}) {
  const isEditing = !!appointment;
  const primaryColor = getPrimaryColor(mode);

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
  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title || "",
        doctorName: appointment.doctorName || "",
        location: appointment.location || "",
        date: appointment.date || "",
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
    if (!formData.doctorName.trim()) {
      newErrors.doctorName = "Doctor name is required";
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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Common input styles
  const inputBaseClass =
    "w-full px-4 py-3 rounded-xl border font-poppins text-sm text-text-primary bg-background-default focus:outline-none transition-colors";
  const inputNormalClass = `${inputBaseClass} border-border-default focus:border-primary`;
  const inputErrorClass = `${inputBaseClass} border-red-400 focus:border-red-500`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="font-poppins font-bold text-xl text-text-primary">
            {isEditing ? "Edit Appointment" : "New Appointment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-hover transition-colors"
            aria-label="Close modal"
          >
            <XIcon size={24} weight="regular" color={colors.icon.primary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Appointment Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Physical Check Up"
                className={errors.title ? inputErrorClass : inputNormalClass}
              />
              {errors.title && (
                <p className="font-poppins text-xs text-red-500 mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Doctor Name *
              </label>
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                placeholder="e.g., Dr Williams"
                className={
                  errors.doctorName ? inputErrorClass : inputNormalClass
                }
              />
              {errors.doctorName && (
                <p className="font-poppins text-xs text-red-500 mt-1">
                  {errors.doctorName}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Singapore General Hospital"
                className={errors.location ? inputErrorClass : inputNormalClass}
              />
              {errors.location && (
                <p className="font-poppins text-xs text-red-500 mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Date and Time row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? inputErrorClass : inputNormalClass}
                />
                {errors.date && (
                  <p className="font-poppins text-xs text-red-500 mt-1">
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={errors.time ? inputErrorClass : inputNormalClass}
                />
                {errors.time && (
                  <p className="font-poppins text-xs text-red-500 mt-1">
                    {errors.time}
                  </p>
                )}
              </div>
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
                className={`${inputNormalClass} resize-none`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-text-primary border border-border-default hover:bg-background-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              {isEditing ? "Save Changes" : "Add Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
