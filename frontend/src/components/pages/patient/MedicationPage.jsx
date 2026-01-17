/**
 * MedicationPage Component - Comprehensive medication management page
 * Shows: Pending Today (with Morning/Afternoon/Night sections), Taken Today, Current Supply
 *
 * @param {string} userName - User's name
 * @param {string} mode - "Personal" or "Caregiver"
 */

import React, { useState } from "react";
import { PlusIcon, PillIcon, CheckCircleIcon } from "@phosphor-icons/react";
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
import { useMedications } from "../../../contexts/MedicationsContext";
import { colors } from "../../../../tailwind.config.js";
import { getMedicationColor } from "../../../utils/medicationColors";

const MedicationPage = ({ userName = "", mode = "Personal" }) => {
  const primaryColor = getModeHexColor(mode);
  const {
    medications,
    parseQuantity,
    formatQuantity,
    createMedication,
    updateMedication,
    deleteMedication,
    markMedicationAsTaken,
    resetMedicationStatus,
  } = useMedications();

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
  // Include medications with status "pending" OR "supply" that have a scheduled time
  const pendingMeds = medications.filter((med) => {
    const isPending = med.status === "pending";
    const isSupplyWithSchedule = med.status === "supply" && (med.timeOfDay || (med.timesOfDay && med.timesOfDay.length > 0));
    return isPending || isSupplyWithSchedule;
  });
  const takenMeds = medications.filter((med) => med.status === "taken");
  // Sort pending medications by time ascending so they display in order
  const pendingMedsSorted = [...pendingMeds].sort(
    (a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay)
  );

  // Keep current supply aligned with all medications regardless of pending/taken status
  const supplyMeds = medications.filter(
    (med) =>
      med.quantity !== undefined && med.quantity !== null && med.quantity !== ""
  );

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
      const statusA = getSupplyStatus(a);
      const statusB = getSupplyStatus(b);
      // Medications without status (not taken yet) go to the end
      if (!statusA && !statusB) return 0;
      if (!statusA) return 1;
      if (!statusB) return -1;
      // Sort by percentage value
      const percentA = parseInt(statusA.label.replace("%", ""), 10);
      const percentB = parseInt(statusB.label.replace("%", ""), 10);
      return multiplier * (percentA - percentB);
    }
    return 0;
  });

  // Get supply status as percentage (only calculated when medication has been taken)
  const getSupplyStatus = (medication) => {
    // Only calculate percentage if medication has been taken and has initialQuantity
    if (!medication.taken || !medication.initialQuantity) {
      return null; // No status shown if medication hasn't been taken yet
    }

    const currentValue = parseQuantity(medication.quantity).value;
    const initialValue = parseQuantity(medication.initialQuantity).value;

    if (initialValue === 0) {
      return null; // Avoid division by zero
    }

    const percentage = Math.round((currentValue / initialValue) * 100);

    // Determine color based on percentage
    let className;
    if (percentage < 30) {
      className = "bg-red-100 text-red-700";
    } else if (percentage <= 60) {
      className = "bg-amber-100 text-amber-700";
    } else {
      className = "bg-green-100 text-green-700";
    }

    return { label: `${percentage}%`, className };
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
        const status = getSupplyStatus(row);
        if (!status) {
          return (
            <span className="font-poppins text-sm text-text-secondary">
              Not calculated
            </span>
          );
        }
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
   * Handled by context (handleMarkAsTaken)
   */

  /**
   * Handle deleting a medication from taken section
   * Handled by context (handleDeleteMedication)
   */

  /**
   * Handle editing a medication
   * In a full implementation, this would open an edit modal
   */
  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      await updateMedication(updatedMedication.id, updatedMedication);
      setShowEditModal(false);
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  /**
   * Handle adding a new medication to supply
   * Receives medication data from AddMedicationModal
   */
  const handleAddMedication = async (medicationData) => {
    try {
      await createMedication(medicationData);
      setShowAddForm(false);
    } catch {
      // Errors are surfaced via global error handler
    }
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
                onMarkAsTaken={markMedicationAsTaken}
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
                onDelete={resetMedicationStatus}
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
              onDelete={(row) => deleteMedication(row.id)}
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
