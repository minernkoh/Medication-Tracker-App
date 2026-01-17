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
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import {
  DataTable,
  PageHeader,
  SectionHeader,
  GradientBackground,
  Button,
} from "../../ui";
import { MedicationSection } from "../../features";
import { AddMedicationModal, EditMedicationModal } from "../../modals";
import { colors } from "../../../../tailwind.config.js";
import { getMedicationColor } from "../../../utils/medicationColors";

const MedicationPage = ({ userName = "Sarah", mode = "Personal" }) => {
  const primaryColor = getModeHexColor(mode);

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
    if (key === "refillDate") {
      const dateA = a.refillDate ? new Date(a.refillDate).getTime() : 0;
      const dateB = b.refillDate ? new Date(b.refillDate).getTime() : 0;
      return multiplier * (dateA - dateB);
    }
    if (key === "supplyStatus") {
      const statusOrder = { Low: 0, Medium: 1, High: 2 };
      const statusA = getSupplyStatus(a.quantity).label;
      const statusB = getSupplyStatus(b.quantity).label;
      return multiplier * (statusOrder[statusA] - statusOrder[statusB]);
    }
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

  // Helper: format date for display
  const formatRefillDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  // Supply table columns
  const supplyColumns = [
    {
      key: "name",
      label: "Medication",
      render: (value, row) => {
        const medicationColor = getMedicationColor(value);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: medicationColor.bg }}
              aria-hidden="true"
            >
              <PillIcon
                size={20}
                weight="fill"
                color={medicationColor.icon}
                aria-label={`${value} medication icon`}
              />
            </div>
            <span className="font-poppins font-semibold text-sm text-text-primary">
              {value}
            </span>
          </div>
        );
      },
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
      label: "Current Quantity",
      render: (value) => (
        <span className="font-poppins text-sm font-medium text-text-primary">
          {value || "N/A"}
        </span>
      ),
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
    {
      key: "refillDate",
      label: "Refill Date",
      render: (value, row) => {
        const formattedDate = formatRefillDate(value);
        if (!formattedDate) {
          return (
            <span className="font-poppins text-sm text-text-secondary">
              Not set
            </span>
          );
        }
        return (
          <span className="font-poppins text-sm text-text-primary">
            {formattedDate}
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
   * Receives medication data from AddMedicationModal
   */
  const handleAddMedication = (medicationData) => {
    // Get existing medication colors to ensure differentiation
    const existingColors = medications
      .map((med) => {
        if (med.name) {
          const color = getMedicationColor(med.name);
          return color.bg;
        }
        return null;
      })
      .filter((color) => color !== null);

    // Generate color for new medication, ensuring it's different from existing ones
    const newMedicationColor = getMedicationColor(
      medicationData.name,
      existingColors
    );

    // Create new medication object with ID
    const newMed = {
      id: medications.length + 1,
      ...medicationData,
      // Store the generated color (optional, for consistency)
      pillColor: newMedicationColor.bg,
    };

    // Add to medications list
    setMedications((prev) => [...prev, newMed]);
    setShowAddForm(false);
  };
  return (
    <div className="bg-background-default w-full overflow-x-hidden">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
        <div className="w-full max-w-[67.5rem] mx-auto flex flex-col gap-6">
          {/* Page Header */}
          <PageHeader
            title="Medication Tracker"
            description="Track your daily medications and manage your supply"
            action={
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                icon={<PlusIcon size={18} weight="bold" />}
                style={{ backgroundColor: primaryColor }}
              >
                Add Medication
              </Button>
            }
          />

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
          <div className="flex flex-col md:flex-row gap-6">
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
            <SectionHeader
              icon={
                <PillIcon
                  size={24}
                  weight="regular"
                  color={colors.icon.primary}
                />
              }
              title="Current Supply"
              description="Your current medication inventory"
              action={
                <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                  {supplyMeds.length} in supply
                </span>
              }
            />

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
      <AddMedicationModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSave={handleAddMedication}
        mode={mode}
      />
    </div>
  );
};

export default MedicationPage;
