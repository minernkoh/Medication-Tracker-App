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
import { colors, getPrimaryColor } from "../../../utils/colors";
import { MedicineDue, DataTable, MedicationSection } from "../../ui";
import EditMedicationModal from "../../modals/EditMedicationModal";

const MedicationPage = ({ userName = "Sarah", mode = "Personal" }) => {
  const primaryColor = getPrimaryColor(mode);

  // State to track medications - initially populated with sample data
  const [medications, setMedications] = useState([
    // Pending medications (for today)
    {
      id: 1,
      name: "Paracetamol",
      dosage: "2 pills",
      timeOfDay: "08:00",
      quantity: "50 pills",
      status: "pending",
      takenTime: null,
      additionalInfo: "For headache",
    },
    {
      id: 2,
      name: "Ibuprofen",
      dosage: "1 pill",
      timeOfDay: "13:00",
      quantity: "30 pills",
      status: "pending",
      additionalInfo: "After Meal",
      pillColor: "#ffd5d5",
    },
    {
      id: 3,
      name: "Vitamin C",
      dosage: "1 pill",
      timeOfDay: "20:00",
      quantity: "45 pills",
      status: "pending",
      additionalInfo: "Before Sleep",
      pillColor: "#d9ffaf",
    },

    // Taken medications (example of already taken today)

    {
      id: 4,
      name: "Aspirin",
      dosage: "1 pill",
      timeOfDay: "08:00",
      quantity: "100 pills",
      status: "taken",
      takenTime: "9:00 AM",
      additionalInfo: "",
    },

    {
      id: 5,
      name: "Metformin",
      dosage: "500mg",
      status: "supply",
      quantity: "30 pills",
      timeOfDay: "08:00",
      refillDate: "2026-02-15",
      additionalInfo: "Before Meal",
    },
    {
      id: 6,
      name: "Blood Pressure Meds",
      dosage: "1 pill",
      status: "supply",
      quantity: "60 pills",
      timeOfDay: "20:00",
      refillDate: "2026-03-10",
      additionalInfo: "Before Sleep",
    },
  ]);

  // State for add medication form modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    type: "pills",
    frequencyType: "timesPerDay", // "timesPerDay", "everyHours", "custom"
    frequencyValue: "",
    frequencyText: "", // For custom frequency
    quantity: "",
    instructions: [], // Array of selected instruction checkboxes
  });

  // State for supply table sorting
  const [supplySortConfig, setSupplySortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper: convert HH:MM to minutes for sorting
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
      return Number.MAX_SAFE_INTEGER;
    const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER;
    return h * 60 + m;
  };

  // Filter medications by status for display
  const pendingMeds = medications.filter((med) => med.status === "pending");
  const takenMeds = medications.filter((med) => med.status === "taken");
  const supplyOnlyMeds = medications.filter((med) => med.status === "supply");

  // Sort pending medications by time ascending so they display in order
  const pendingMedsSorted = [...pendingMeds].sort(
    (a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay)
  );

  // Keep current supply aligned with today's pending meds; include any extra supply-only rows without duplicating IDs
  const supplyMeds = [
    ...pendingMedsSorted,
    ...supplyOnlyMeds.filter(
      (med) => !pendingMedsSorted.some((pending) => pending.id === med.id)
    ),
  ];

  // Sort supply medications
  const sortedSupplyMeds = [...supplyMeds].sort((a, b) => {
    const { key, direction } = supplySortConfig;
    const multiplier = direction === "asc" ? 1 : -1;
    if (key === "name") return multiplier * a.name.localeCompare(b.name);
    if (key === "dosage") return multiplier * a.dosage.localeCompare(b.dosage);
    if (key === "quantity")
      return multiplier * a.quantity.localeCompare(b.quantity);
    return 0;
  });

  // Get supply status based on quantity
  const getSupplyStatus = (quantityStr) => {
    // Extract numeric value from quantity string (e.g., "30 pills" -> 30)
    const numericValue = parseInt(quantityStr.match(/\d+/)?.[0] || "0");

    if (numericValue < 20) {
      return { label: "Low", className: "bg-red-100 text-red-700" };
    } else if (numericValue <= 50) {
      return { label: "Medium", className: "bg-amber-100 text-amber-700" };
    } else {
      return { label: "High", className: "bg-green-100 text-green-700" };
    }
  };

  // Supply table columns
  const supplyColumns = [
    {
      key: "name",
      label: "Medication",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center">
            <PillIcon size={18} weight="regular" color={colors.icon.primary} />
          </div>
          <span className="font-poppins font-semibold text-sm text-text-primary">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "dosage",
      label: "Dosage",
      render: (value) => (
        <span className="font-poppins text-sm text-text-primary">{value}</span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      // Display quantity field which is now editable in the modal
      render: (value) => (
        <span className="font-poppins text-sm text-text-primary">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "timeOfDay",
      label: "Time",
      //  Display timeOfDay in readable format (convert 24-hour to readable time)
      render: (value) => {
        if (!value)
          return (
            <span className="font-poppins text-sm text-text-secondary">
              N/A
            </span>
          );
        // Convert 24-hour format to readable time (08:00 -> 8:00 AM)
        if (typeof value === "string" && value.includes(":")) {
          const [hour, minute] = value.split(":");
          const numHour = parseInt(hour);
          const ampm = numHour >= 12 ? "PM" : "AM";
          const displayHour =
            numHour > 12 ? numHour - 12 : numHour === 0 ? 12 : numHour;
          return (
            <span className="font-poppins text-sm text-text-primary">
              {displayHour}:{minute} {ampm}
            </span>
          );
        }
        return (
          <span className="font-poppins text-sm text-text-primary">
            {value}
          </span>
        );
      },
    },
    {
      key: "supplyStatus",
      label: "Supply Status",
      render: (value, row) => {
        const status = getSupplyStatus(row.quantity);
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-poppins font-medium ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
  ];

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
   * Handle deleting a medication from taken section
   * Moves medication back to pending status instead of permanently deleting
   * When user clicks delete on "Taken Today" section, this restores it to "Pending Today"
   */
  const handleDeleteMedication = (medicationId) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId
          ? { ...med, status: "pending", takenTime: null }
          : med
      )
    );
  };

  /**
   * Handle editing a medication
   * In a full implementation, this would open an edit modal
   */
  const handleEditMedication = (medication) => {
    console.log("Opening edit modal for medication:", medication?.id);
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = (updatedMedication) => {
    console.log("Saving edited medication:", updatedMedication);
    // Update the medication in state
    setMedications((prev) =>
      prev.map((med) =>
        med.id === updatedMedication.id ? { ...med, ...updatedMedication } : med
      )
    );
    setShowEditModal(false);
    setEditingMedication(null);
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
      !newMedication.quantity
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate frequency based on type
    if (newMedication.frequencyType === "custom") {
      if (!newMedication.frequencyText) {
        alert("Please enter frequency information");
        return;
      }
    } else if (!newMedication.frequencyValue) {
      alert("Please enter frequency information");
      return;
    }

    // Format frequency string
    let frequencyString = "";
    if (newMedication.frequencyType === "timesPerDay") {
      const times = newMedication.frequencyValue;
      frequencyString = times === "1" ? "Once daily" : `${times} times per day`;
    } else if (newMedication.frequencyType === "everyHours") {
      frequencyString = `Every ${newMedication.frequencyValue} hour${
        newMedication.frequencyValue !== "1" ? "s" : ""
      }`;
    } else {
      frequencyString = newMedication.frequencyText;
    }

    // Format instructions into additionalInfo string
    const additionalInfo =
      newMedication.instructions.length > 0
        ? newMedication.instructions.join(", ")
        : null;

    // Create new medication object
    const newMed = {
      id: medications.length + 1,
      name: newMedication.name,
      dosage: newMedication.dosage,
      type: newMedication.type,
      frequency: frequencyString,
      status: "supply",
      quantity: newMedication.quantity,
      additionalInfo: additionalInfo,
    };

    // Add to medications list
    setMedications((prev) => [...prev, newMed]);

    // Reset form and close modal
    setNewMedication({
      name: "",
      dosage: "",
      type: "pills",
      frequencyType: "timesPerDay",
      frequencyValue: "",
      frequencyText: "",
      quantity: "",
      instructions: [],
    });
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
   * Handle checkbox change for medication instructions
   */
  const handleInstructionChange = (instruction) => {
    setNewMedication((prev) => {
      const instructions = prev.instructions.includes(instruction)
        ? prev.instructions.filter((inst) => inst !== instruction)
        : [...prev.instructions, instruction];
      return { ...prev, instructions };
    });
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

          {showEditModal && editingMedication && (
            <EditMedicationModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setEditingMedication(null);
              }}
              onSave={handleSaveEditedMedication}
              medication={editingMedication}
              mode={mode}
            />
          )}

          {/* PENDING TODAY and TAKEN TODAY Sections - Horizontal Layout */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* 1. PENDING TODAY SECTION */}
            <div className="flex-1">
              <MedicationSection
                variant="pending"
                medications={pendingMedsSorted}
                onMarkAsTaken={handleMarkAsTaken}
                showTimeGroups={true}
                compact={false}
              />
            </div>

            {/* 2. TAKEN TODAY SECTION */}
            <div className="flex-1">
              <MedicationSection
                variant="taken"
                medications={takenMeds}
                onEdit={handleEditMedication}
                onDelete={handleDeleteMedication}
                showTimeGroups={true}
                compact={false}
              />
            </div>
          </div>

          {/* 3. CURRENT SUPPLY SECTION */}
          <div>
            <div className="flex justify-between items-center mb-4">
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

            <DataTable
              columns={supplyColumns}
              data={sortedSupplyMeds}
              sortConfig={supplySortConfig}
              onSort={setSupplySortConfig}
              onEdit={(row) => handleEditMedication(row)}
              onDelete={(row) => handleDeleteMedication(row.id)}
              emptyMessage="No medications in supply"
              emptySubMessage="Click 'Add Medication' to get started"
              EmptyIcon={PillIcon}
              mode={mode}
            />
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
                    placeholder="e.g., 500mg or 2"
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Type
                  </label>
                  <select
                    name="type"
                    value={newMedication.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="pills">Pills</option>
                    <option value="tablets">Tablets</option>
                    <option value="capsules">Capsules</option>
                    <option value="liquid">Liquid</option>
                    <option value="drops">Drops</option>
                    <option value="spray">Spray</option>
                    <option value="injection">Injection</option>
                    <option value="patch">Patch</option>
                    <option value="cream">Cream</option>
                    <option value="ointment">Ointment</option>
                    <option value="gel">Gel</option>
                    <option value="powder">Powder</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                    Frequency *
                  </label>
                  <div className="flex flex-col gap-3">
                    {/* Frequency Type Selector */}
                    <select
                      name="frequencyType"
                      value={newMedication.frequencyType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="timesPerDay">Times per day</option>
                      <option value="everyHours">Every X hours</option>
                      <option value="custom">Custom</option>
                    </select>

                    {/* Frequency Input based on type */}
                    {newMedication.frequencyType === "timesPerDay" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="frequencyValue"
                          value={newMedication.frequencyValue}
                          onChange={handleFormChange}
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

                    {newMedication.frequencyType === "everyHours" && (
                      <div className="flex items-center gap-2">
                        <span className="font-poppins text-sm text-text-secondary">
                          Every
                        </span>
                        <input
                          type="number"
                          name="frequencyValue"
                          value={newMedication.frequencyValue}
                          onChange={handleFormChange}
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

                    {newMedication.frequencyType === "custom" && (
                      <input
                        type="text"
                        name="frequencyText"
                        value={newMedication.frequencyText}
                        onChange={handleFormChange}
                        placeholder="e.g., Every 6 hours, 3 times daily, As needed"
                        className="w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm text-text-primary bg-background-default focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    )}
                  </div>
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
                          checked={newMedication.instructions.includes(
                            instruction
                          )}
                          onChange={() => handleInstructionChange(instruction)}
                          className="w-4 h-4 rounded border-2 border-border-default cursor-pointer transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-0"
                          style={{
                            accentColor: primaryColor,
                          }}
                        />
                        <span className="font-poppins text-sm text-text-primary group-hover:text-text-primary">
                          {instruction}
                        </span>
                      </label>
                    ))}
                  </div>
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
