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
import {
  timeToMinutes,
  calculateSupplyStatus,
  filterMedsByStatus,
} from "../../../utils";

const MedicationPage = ({ userName = "", mode = "Personal" }) => {
  // ============================================================================
  // INITIALIZATION
  // ============================================================================

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
    isReadOnlyPatient,
  } = useMedications();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // State for add medication form modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for supply table sorting
  const [supplySortConfig, setSupplySortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Convert HH:MM to minutes for time-based sorting
   */
  // Use shared helper that supports both "morning" and "09:30" formats

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

  /**
   * Calculate supply status as percentage
   */
  // Calculate supply status using shared utility
  const getSupplyStatus = (medication) => {
    return calculateSupplyStatus(medication);
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle adding a new medication
   */

  const handleAddMedication = async (medicationData) => {
    try {
      if (isReadOnlyPatient) return;
      await createMedication(medicationData);
      setShowAddForm(false);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  /**
   * Handle editing a medication
   */
  const handleEditMedication = (medication) => {
    if (isReadOnlyPatient) return;
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  /**
   * Handle saving edited medication
   */
  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (isReadOnlyPatient) return;
      await updateMedication(updatedMedication.id, updatedMedication);
      setShowEditModal(false);
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  /**
   * Handle deleting a medication from taken section
   */

  const handleDeleteMedication = async (id) => {
    try {
      if (isReadOnlyPatient) return;
      await deleteMedication(id);
    } catch (error) {
      // Errors are surfaced via global error handler
    }
  };

  /**
   * Handle resetting medication status (from taken to pending)
   */
  const handleResetMedicationStatus = async (medication) => {
    try {
      if (isReadOnlyPatient) return;
      await resetMedicationStatus(medication.id);
    } catch (error) {
      // Errors are surfaced via global error handler
    }
  };

  // ============================================================================
  // MEDICATION FILTERING & SORTING
  // ============================================================================

  // Filter medications by status for display

  const pendingMeds = filterMedsByStatus(medications, "pending");
  const takenMeds = filterMedsByStatus(medications, "taken");
  const supplyMeds = filterMedsByStatus(medications, "supply");

  // Sort pending medications by time of day
  const pendingMedsSorted = [...pendingMeds].sort(
    (a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay),
  );

  // Sort supply medications
  const sortedSupplyMeds = [...supplyMeds].sort((a, b) => {
    const { key, direction } = supplySortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    switch (key) {
      case "name":
        return multiplier * a.name.localeCompare(b.name);

      case "dosage":
        return multiplier * (Number(a.dosage) - Number(b.dosage));

      case "quantity":
        return multiplier * (Number(a.quantity) - Number(b.quantity));

      case "refillDate": {
        const dateA = a.refillDate ? new Date(a.refillDate).getTime() : 0;
        const dateB = b.refillDate ? new Date(b.refillDate).getTime() : 0;
        return multiplier * (dateA - dateB);
      }

      case "supplyStatus": {
        const statusA = getSupplyStatus(a);
        const statusB = getSupplyStatus(b);

        // Medications without status go to the end
        if (!statusA && !statusB) return 0;
        if (!statusA) return 1;
        if (!statusB) return -1;

        // Sort by percentage value
        const percentA = parseInt(statusA.label.replace("%", ""), 10);
        const percentB = parseInt(statusB.label.replace("%", ""), 10);
        return multiplier * (percentA - percentB);
      }

      default:
        return 0;
    }
  });

  // ============================================================================
  // TABLE COLUMNS CONFIGURATION
  // ============================================================================

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
      render: (value, row) => (
        <span className="font-poppins text-sm text-text-primary">
          {formatQuantity(value, row.unit)}
        </span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (value, row) => (
        <span className="font-poppins text-sm font-medium text-text-primary">
          {value !== undefined ? formatQuantity(value, row.unit) : "N/A"}
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-background-default w-full overflow-x-hidden relative">
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
              isReadOnlyPatient ? null : (
                <Button
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                  icon={<PlusIcon size={18} weight="bold" />}
                  style={{ backgroundColor: primaryColor }}
                >
                  Add Medication
                </Button>
              )
            }
          />

          {/* Edit Medication Modal */}
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
                onMarkAsTaken={isReadOnlyPatient ? undefined : markMedicationAsTaken}
                showTimeGroups={true}
                compact={false}
              />
            </div>

            {/* 2. TAKEN TODAY SECTION */}
            <div className="flex-1">
              <MedicationSection
                variant="taken"
                medications={takenMeds}
                onEdit={isReadOnlyPatient ? undefined : handleEditMedication}
                onDelete={isReadOnlyPatient ? undefined : handleResetMedicationStatus}
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
              onEdit={isReadOnlyPatient ? undefined : (row) => handleEditMedication(row)}
              onDelete={isReadOnlyPatient ? undefined : (row) => handleDeleteMedication(row.id)}
              showActions={!isReadOnlyPatient}
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
