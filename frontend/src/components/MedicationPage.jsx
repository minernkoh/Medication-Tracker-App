/**
 * MedicationPage Component - Comprehensive medication management page
 * Shows: Pending Today (with Morning/Afternoon/Night sections), Taken Today, Current Supply
 *
 * @param {string} userName - User's name
 * @param {string} mode - "Personal" or "Caregiver"
 */

import React, { useState } from "react";
import {
  PlusIcon,
  PillIcon,
  ClockIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { colors, getPrimaryColor } from "../utils/colors";
import MedicineDue from "./buttons/MedicineDue";

const MedicationPage = ({ userName = "Sarah", mode = "Personal" }) => {
  const primaryColor = getPrimaryColor(mode);

  // State to track medications - initially populated with sample data
  const [medications, setMedications] = useState([
    // Pending medications (for today)
    {
      id: 1,
      name: "Paracetamol",
      dosage: "2 pills",
      timeOfDay: "morning",
      status: "pending",
      takenTime: null,
      additionalInfo: "For headache",
    },
    {
      id: 2,
      name: "Ibuprofen",
      dosage: "1 pill",
      timeOfDay: "afternoon",
      status: "pending",
      additionalInfo: "After Meal",
      pillColor: "#ffd5d5",
    },
    {
      id: 3,
      name: "Vitamin C",
      dosage: "1 pill",
      timeOfDay: "night",
      status: "pending",
      additionalInfo: "Before Sleep",
      pillColor: "#d9ffaf",
    },
    // Taken medications (example of already taken today)
    {
      id: 4,
      name: "Aspirin",
      dosage: "1 pill",
      timeOfDay: "morning",
      status: "taken",
      takenTime: "9:00 AM",
    },
    // Current supply medications
    {
      id: 5,
      name: "Metformin",
      dosage: "500mg",
      status: "supply",
      quantity: "30 pills",
      refillDate: "2026-02-15",
    },
    {
      id: 6,
      name: "Blood Pressure Meds",
      dosage: "1 pill",
      status: "supply",
      quantity: "60 pills",
      refillDate: "2026-03-10",
    },
  ]);

  // State for add medication form modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    quantity: "",
    refillDate: "",
  });

  // Filter medications by status for display
  const pendingMeds = medications.filter((med) => med.status === "pending");
  const takenMeds = medications.filter((med) => med.status === "taken");
  const supplyMeds = medications.filter((med) => med.status === "supply");

  // Group pending medications by time of day
  const morningMeds = pendingMeds.filter((med) => med.timeOfDay === "morning");
  const afternoonMeds = pendingMeds.filter(
    (med) => med.timeOfDay === "afternoon"
  );
  const nightMeds = pendingMeds.filter((med) => med.timeOfDay === "night");

  /**
   * Handle marking a medication as taken
   * When clicked, moves medication from pending to taken with current timestamp
   */
  const handleMarkAsTaken = (medicationId) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId
          ? {
              ...med,
              status: "taken",
              takenTime: currentTime,
            }
          : med
      )
    );
  };

  /**
   * Handle deleting a medication
   * Removes medication from the list after confirmation
   */
  const handleDeleteMedication = (medicationId) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      setMedications((prev) => prev.filter((med) => med.id !== medicationId));
    }
  };

  /**
   * Handle editing a medication
   * In a full implementation, this would open an edit modal
   */
  const handleEditMedication = (medicationId) => {
    // For now, just log which medication to edit
    console.log("Edit medication:", medicationId);
    // In a real app, you would open an edit form similar to the add form
  };

  /**
   * Handle adding a new medication to supply
   * Validates form and adds medication to current supply
   */
  const handleAddMedication = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newMedication.name ||
      !newMedication.dosage ||
      !newMedication.quantity ||
      !newMedication.refillDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new medication object
    const newMed = {
      id: medications.length + 1,
      name: newMedication.name,
      dosage: newMedication.dosage,
      status: "supply",
      quantity: newMedication.quantity,
      refillDate: newMedication.refillDate,
    };

    // Add to medications list
    setMedications((prev) => [...prev, newMed]);

    // Reset form and close modal
    setNewMedication({ name: "", dosage: "", quantity: "", refillDate: "" });
    setShowAddForm(false);
  };

  /**
   * Handle input change in add medication form
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewMedication((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle backdrop click to close modal
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAddForm(false);
    }
  };
  return (
    <div className="bg-background-default w-full min-h-screen overflow-x-hidden">
      {/* Gradient background decoration - matches Dashboard styling */}
      <div className="hidden md:block absolute h-[85.6875rem] left-[4.3125rem] top-[-11rem] w-[88.3125rem] pointer-events-none z-0">
        <div className="absolute inset-[-36.47%_-35.39%]">
          <div
            className="w-full h-full opacity-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(21, 93, 252, 0.1) 0%, rgba(218, 116, 136, 0.1) 100%)",
            }}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
        <div className="w-full max-w-[67.5rem] mx-auto">
          {/* Page Header with Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-poppins font-bold leading-none text-2xl md:text-3xl text-text-primary">
                Medication Tracker
              </h1>
              <p className="font-poppins text-sm text-text-secondary mt-2">
                Track your daily medications and manage your supply
              </p>
            </div>

            {/* Add Medication Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusIcon size={18} weight="bold" />
              <span>Add Medication</span>
            </button>
          </div>

          {/* 1. PENDING TODAY SECTION */}
          <div className="bg-background-default border border-border-default rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ClockIcon
                  size={24}
                  weight="regular"
                  color={colors.icon.primary}
                />
                <div>
                  <h2 className="font-poppins font-bold text-xl text-text-primary">
                    Pending Today
                  </h2>
                  <p className="font-poppins text-sm text-text-secondary mt-1">
                    Medications scheduled for today
                  </p>
                </div>
              </div>
              <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                {pendingMeds.length} pending
              </span>
            </div>

            {/* Morning Section */}
            <div className="mb-6">
              <h3 className="font-poppins font-bold leading-6 text-sm text-text-primary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Morning
              </h3>
              <div className="space-y-3">
                {morningMeds.map((med) => (
                  <MedicineDue
                    key={med.id}
                    type="Due"
                    medicationName={med.name}
                    dosage={med.dosage}
                    additionalInfo={med.additionalInfo}
                    pillColor={med.pillColor}
                    onCheck={() => handleMarkAsTaken(med.id)}
                  />
                ))}
                {morningMeds.length === 0 && (
                  <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg">
                    No morning medications scheduled
                  </p>
                )}
              </div>
            </div>

            {/* Afternoon Section */}
            <div className="mb-6">
              <h3 className="font-poppins font-bold leading-6 text-sm text-text-primary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Afternoon
              </h3>
              <div className="space-y-3">
                {afternoonMeds.map((med) => (
                  <MedicineDue
                    key={med.id}
                    type="Due"
                    medicationName={med.name}
                    dosage={med.dosage}
                    additionalInfo={med.additionalInfo}
                    pillColor={med.pillColor}
                    onCheck={() => handleMarkAsTaken(med.id)}
                  />
                ))}
                {afternoonMeds.length === 0 && (
                  <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg">
                    No afternoon medications scheduled
                  </p>
                )}
              </div>
            </div>

            {/* Night Section */}
            <div>
              <h3 className="font-poppins font-bold leading-6 text-sm text-text-primary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Night
              </h3>
              <div className="space-y-3">
                {nightMeds.map((med) => (
                  <MedicineDue
                    key={med.id}
                    type="Due"
                    medicationName={med.name}
                    dosage={med.dosage}
                    additionalInfo={med.additionalInfo}
                    pillColor={med.pillColor}
                    onCheck={() => handleMarkAsTaken(med.id)}
                  />
                ))}
                {nightMeds.length === 0 && (
                  <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg">
                    No night medications scheduled
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. TAKEN TODAY SECTION */}
          <div className="bg-background-default border border-border-default rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon
                  size={24}
                  weight="fill"
                  color={colors.icon.primary}
                />
                <div>
                  <h2 className="font-poppins font-bold text-xl text-text-primary">
                    Taken Today
                  </h2>
                  <p className="font-poppins text-sm text-text-secondary mt-1">
                    Medications already taken today
                  </p>
                </div>
              </div>
              <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                {takenMeds.length} taken
              </span>
            </div>

            <div className="space-y-3">
              {takenMeds.map((med) => (
                <MedicineDue
                  key={med.id}
                  type="Taken"
                  medicationName={med.name}
                  dosage={med.dosage}
                  additionalInfo={`Taken at ${med.takenTime}`}
                  onEdit={() => handleEditMedication(med.id)}
                  onDelete={() => handleDeleteMedication(med.id)}
                />
              ))}
              {takenMeds.length === 0 && (
                <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg">
                  No medications taken yet today
                </p>
              )}
            </div>
          </div>

          {/* 3. CURRENT SUPPLY SECTION */}
          <div className="bg-background-default border border-border-default rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <PillIcon
                  size={24}
                  weight="regular"
                  color={colors.icon.primary}
                />
                <div>
                  <h2 className="font-poppins font-bold text-xl text-text-primary">
                    Current Supply
                  </h2>
                  <p className="font-poppins text-sm text-text-secondary mt-1">
                    Your current medication inventory
                  </p>
                </div>
              </div>
              <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                {supplyMeds.length} in supply
              </span>
            </div>

            <div className="space-y-3">
              {supplyMeds.map((med) => (
                <MedicineDue
                  key={med.id}
                  type="Supply"
                  medicationName={med.name}
                  dosage={`${med.dosage} (${med.quantity})`}
                  additionalInfo={`Refill: ${med.refillDate}`}
                  onEdit={() => handleEditMedication(med.id)}
                  onDelete={() => handleDeleteMedication(med.id)}
                />
              ))}
              {supplyMeds.length === 0 && (
                <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg">
                  No medications in supply. Click "Add Medication" to get
                  started.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD MEDICATION MODAL */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-background-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-default">
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Add New Medication
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg hover:bg-background-hover transition-colors"
                aria-label="Close modal"
              >
                <XIcon size={24} weight="regular" color={colors.icon.primary} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMedication} className="p-5">
              <div className="flex flex-col gap-4">
                {/* Medication Name */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newMedication.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Paracetamol"
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Dosage */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={newMedication.dosage}
                    onChange={handleFormChange}
                    placeholder="e.g., 500mg or 2 pills"
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={newMedication.quantity}
                    onChange={handleFormChange}
                    placeholder="e.g., 30 pills"
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Refill Date */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Next Refill Date *
                  </label>
                  <input
                    type="date"
                    name="refillDate"
                    value={newMedication.refillDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-text-primary border border-border-default hover:bg-background-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add to Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationPage;
