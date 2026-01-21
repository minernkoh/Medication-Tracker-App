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
import { getMedicationColor } from "../../../utils/medicationColors";
import {
  timeToMinutes,
  calculateSupplyStatus,
  filterMedsByStatus,
  splitMedicationsBySlot,
  toTimeInput,
  toLocalIsoDay,
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
        // 1. Check if the medication has a "takenDate" (meaning it's an edit from the "Taken Today" section)
        updatedMedication?.takenDate &&
        // 2. Confirm that the intended action is to mark it as "taken"
        updatedMedication?.status === "taken"
      ) {
        // A. If both conditions are met, we're dealing with editing a *specific dose*
        // a.1 Get the current day
        const todayStr = toLocalIsoDay(new Date());
        // a.2. Get the date the user selected
        const targetDate = updatedMedication.takenDate;
        // a.3. If the user selected a day in the past we have to reconcile the current date with the users selected date
        const timeSlot =
          updatedMedication.timeOfDay || updatedMedication.timesOfDay?.[0];

        // a.4. if the current day does NOT match the users selected day, reconcile
        if (targetDate !== todayStr) {
          // a.4.1. Clear the current day
          await resetMedicationStatus(updatedMedication.id, todayStr, timeSlot);
        }

        // a.5. Mark the selected day as taken
        await markMedicationAsTaken(
          updatedMedication.id,
          updatedMedication.takenTime,
          targetDate,
          timeSlot,
        );
      } else {
        // B. If the updatedMedication does NOT have a "takenDate"
        // b.1. We're dealing with a general medication update
        await updateMedication(updatedMedication.id, updatedMedication);
      }

      // C. Once complete
      // c.1. Close the modal
      setShowEditModal(false);

      // c.2. Clear the current edit
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  /**
   * handleSaveSupplyMedication - async function to update a medication
   *
   * @param {Object} updatedMedication the medication that will be updated
   * @returns {Promise<void>}
   */
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

  // ============================================================================
  // MEDICATION FILTERING & SORTING
  // ============================================================================

  const todayStr = toLocalIsoDay(new Date());

  // Slot-level split for "Today" views
  const splitMeds = splitMedicationsBySlot(medications);
  const pendingMeds = splitMeds.pending;
  const takenMeds = splitMeds.taken;
  const supplyMeds = filterMedsByStatus(medications, "supply");

  // Sort pending medications by time of day
  const pendingMedsSorted = [...pendingMeds].sort((a, b) => {
    const aSlot =
      a?.timeOfDay ||
      (Array.isArray(a?.timesOfDay) ? a.timesOfDay[0] : "") ||
      "";
    const bSlot =
      b?.timeOfDay ||
      (Array.isArray(b?.timesOfDay) ? b.timesOfDay[0] : "") ||
      "";
    return (
      timeToMinutes(toTimeInput(aSlot) || aSlot) -
      timeToMinutes(toTimeInput(bSlot) || bSlot)
    );
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
        return instructionsList.join(", ");
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

        return (
          <span className="font-poppins text-sm text-text-secondary">—</span>
        );
      },
    },
    {
      key: "additionalInfo",
      label: "Description",
      sortValue: (row) => String(row?.additionalInfo || "").trim(),
      render: (value, row) => {
        const notes = String(row?.additionalInfo || "").trim();
        if (notes) {
          return (
            <span className="font-poppins text-sm text-text-primary max-w-[260px] whitespace-normal break-words">
              {notes}
            </span>
          );
        }

        return (
          <span className="font-poppins text-sm text-text-secondary">—</span>
        );
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
                  isReadOnlyPatient
                    ? undefined
                    : (med) =>
                        markMedicationAsTaken(
                          med?.sourceMedication || med,
                          null,
                          todayStr,
                          med?.slot || null,
                        )
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
                  isReadOnlyPatient
                    ? undefined
                    : (med) =>
                        resetMedicationStatus(
                          med?.sourceMedication || med,
                          todayStr,
                          med?.slot || null,
                        )
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
                  className="text-icon-primary"
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
