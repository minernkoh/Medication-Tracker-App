/**
 * MedicationPage Component - Comprehensive medication management page
 * Shows: Pending Today (sorted by scheduled time), Taken Today, Current Supply
 *
 * @param {string} mode - "Personal" or "Caregiver"
 */

import { useState } from "react";
import { PlusIcon, PillIcon } from "@phosphor-icons/react";
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
  toTimeInput,
} from "../../../utils";

const MedicationPage = ({ mode = "Personal" }) => {
  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const primaryColor = getModeHexColor(mode);
  const {
    medications,
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
  const [editingSupplyMedication, setEditingSupplyMedication] = useState(null);
  const [showSupplyEditModal, setShowSupplyEditModal] = useState(false);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Convert HH:MM to minutes for time-based sorting
   */
  // Use shared helper that supports both "morning" and "09:30" formats

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

  const handleEditSupplyMedication = (medication) => {
    if (isReadOnlyPatient) return;
    setEditingSupplyMedication(medication);
    setShowSupplyEditModal(true);
  };

  /**
   * Handle saving edited medication
   */
  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (isReadOnlyPatient) return;
      if (
        updatedMedication?.takenDate &&
        updatedMedication?.status === "taken"
      ) {
        const todayStr = new Date().toISOString().split("T")[0];
        const targetDate = updatedMedication.takenDate;
        const timeSlot =
          updatedMedication.timeOfDay || updatedMedication.timesOfDay?.[0];
        if (targetDate !== todayStr) {
          await resetMedicationStatus(updatedMedication.id, todayStr, timeSlot);
        }
        await markMedicationAsTaken(
          updatedMedication.id,
          updatedMedication.takenTime,
          targetDate,
          timeSlot,
        );
      } else {
        await updateMedication(updatedMedication.id, updatedMedication);
      }
      setShowEditModal(false);
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  const handleSaveSupplyMedication = async (updatedMedication) => {
    try {
      if (isReadOnlyPatient) return;
      await updateMedication(updatedMedication.id, updatedMedication);
      setShowSupplyEditModal(false);
      setEditingSupplyMedication(null);
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
      const timeSlot = medication?.timeOfDay || medication?.timesOfDay?.[0];
      await resetMedicationStatus(medication?.id, null, timeSlot);
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
  const pendingMedsSorted = [...pendingMeds].sort((a, b) => {
    const aSlot =
      (Array.isArray(a.timesOfDay) && a.timesOfDay.length > 0
        ? a.timesOfDay[0]
        : a.timeOfDay) || "";
    const bSlot =
      (Array.isArray(b.timesOfDay) && b.timesOfDay.length > 0
        ? b.timesOfDay[0]
        : b.timeOfDay) || "";
    return timeToMinutes(toTimeInput(aSlot)) - timeToMinutes(toTimeInput(bSlot));
  });

  // ============================================================================
  // TABLE COLUMNS CONFIGURATION
  // ============================================================================

  // Supply table columns
  const supplyColumns = [
    {
      key: "name",
      label: "Name",
      sortValue: (row) => row?.name || "",
      render: (value) => {
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
      label: "Dose/Frequency",
      sortValue: (row) => Number(row?.dosage ?? 0),
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-poppins text-sm text-text-primary">
            {formatQuantity(value, row.unit)}
          </span>
          <span className="font-poppins text-[10px] text-text-secondary uppercase">
            {row.frequency || "daily"}
          </span>
        </div>
      ),
    },
    {
      key: "instructions",
      label: "Instructions",
      sortValue: (row) => {
        const value = row?.instructions;
        const instructionsList = Array.isArray(value)
          ? value
          : typeof value === "string"
            ? value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        const notes = String(row?.additionalInfo || "").trim();
        return instructionsList.length > 0
          ? instructionsList.join(", ")
          : notes || "";
      },
      render: (value, row) => {
        const instructionsList = Array.isArray(value)
          ? value
          : typeof value === "string"
            ? value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

        if (instructionsList.length > 0) {
          return (
            <div className="flex flex-wrap gap-1 max-w-[240px]">
              {instructionsList.map((instruction) => (
                <span
                  key={instruction}
                  title={instruction}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-semibold bg-background-hover text-text-secondary border border-border-subtle max-w-[220px] truncate"
                >
                  {instruction}
                </span>
              ))}
            </div>
          );
        }

        const notes = String(row?.additionalInfo || "").trim();
        if (notes) {
          return (
            <span className="font-poppins text-sm text-text-primary max-w-[260px] whitespace-normal break-words">
              {notes}
            </span>
          );
        }

        return <span className="font-poppins text-sm text-text-secondary">—</span>;
      },
    },
    {
      key: "quantity",
      label: "Total Quantity",
      sortValue: (row) => Number(row?.quantity ?? 0),
      render: (value, row) => (
        <span className="font-poppins text-sm font-medium text-text-primary">
          {value !== undefined ? formatQuantity(value, row.unit) : "N/A"}
        </span>
      ),
    },
    {
      key: "recommendSupply",
      label: "Recommended Supply",
      sortValue: (row) => Number(row?.recommendSupply ?? 0),
      render: (value, row) => (
        <span className="font-poppins text-sm text-text-primary">
          {value ? formatQuantity(value, row.unit) : "—"}
        </span>
      ),
    },
    {
      key: "supplyStatus",
      label: "Supply Status",
      sortValue: (row) => getSupplyStatus(row)?.ratio ?? null,
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

          {/* Edit Supply (Medication Details) Modal */}
          {showSupplyEditModal && editingSupplyMedication && (
            <AddMedicationModal
              isOpen={showSupplyEditModal}
              onClose={() => {
                setShowSupplyEditModal(false);
                setEditingSupplyMedication(null);
              }}
              onSave={handleSaveSupplyMedication}
              medication={editingSupplyMedication}
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
                onMarkAsTaken={
                  isReadOnlyPatient ? undefined : markMedicationAsTaken
                }
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
                onDelete={
                  isReadOnlyPatient ? undefined : handleResetMedicationStatus
                }
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
              action={
                <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                  {supplyMeds.length} in supply
                </span>
              }
            />

            <DataTable
              columns={supplyColumns}
              data={supplyMeds}
              defaultSortConfig={{ key: "name", direction: "asc" }}
              onEdit={
                isReadOnlyPatient
                  ? undefined
                  : (row) => handleEditSupplyMedication(row)
              }
              onDelete={
                isReadOnlyPatient
                  ? undefined
                  : (row) => handleDeleteMedication(row.id)
              }
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
