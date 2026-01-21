/**
 * MedicationSection Component - Reusable section for displaying medications
 * Used in both Dashboard and MedicationPage for Pending/Taken sections
 *
 * @param {string} variant - "pending" | "taken"
 * @param {Array} medications - Array of medication objects
 * @param {function} onMarkAsTaken - Callback when marking medication as taken (for pending)
 * @param {function} onEdit - Callback when editing a medication (for taken)
 * @param {function} onDelete - Callback when deleting a medication (for taken)
 * @param {boolean} showTimeGroups - Deprecated (pending meds are no longer grouped by Morning/Afternoon/Night)
 * @param {boolean} compact - Use compact styling (for Dashboard)
 * @param {string} dateLabel - Optional date label to replace "Today" (e.g., "Mon, Jan 13")
 */
import {
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { EmptyState } from "../ui";
import PendingMedicine from "./PendingMedicine";
import {
  timeToMinutes,
  toTimeInput,
  to12HourDisplay,
  textStyles,
  getStoredUser,
  isReadOnlyPatientUser,
} from "../../utils";
import { useMedications } from "../../contexts/MedicationsContext";

function MedicationSection({
  variant = "pending",
  medications = [],
  onMarkAsTaken,
  onEdit,
  onDelete,
  showTimeGroups = true,
  compact = false,
  dateLabel = null,
  onAddMedication,
  onCardClick,
  mode = "Personal",
}) {
  const { formatQuantity } = useMedications();
  const isCaregiver = mode === "Caregiver";
  const isPending = variant === "pending";
  const isReadOnlyPatient = isReadOnlyPatientUser(getStoredUser());

  const getScheduledTimes24 = (med) => {
    const rawTimes =
      Array.isArray(med?.timesOfDay) && med.timesOfDay.length > 0
        ? med.timesOfDay
        : med?.timeOfDay
          ? [med.timeOfDay]
          : [];

    return rawTimes
      .map((t) => toTimeInput(String(t || "")))
      .filter(Boolean)
      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  };

  const getPrimaryScheduleMinutes = (med) => {
    const times = getScheduledTimes24(med);
    if (!times.length) return Number.MAX_SAFE_INTEGER;
    return timeToMinutes(times[0]);
  };

  // Convert takenTime (e.g., "9:00 AM") to minutes for sorting
  const takenTimeToMinutes = (takenTime) => {
    if (!takenTime) return Number.MAX_SAFE_INTEGER;
    // Convert to HH:MM format first, then to minutes
    const time24 = toTimeInput(takenTime);
    if (!time24) return Number.MAX_SAFE_INTEGER;
    return timeToMinutes(time24);
  };

  // Get hour group from takenTime (e.g., "9:35 AM" -> "9:00 AM")
  const getHourGroup = (takenTime) => {
    if (!takenTime) return null;
    const time24 = toTimeInput(takenTime);
    if (!time24) return null;
    const [hour] = time24.split(":");
    const hourGroup24 = `${hour}:00`;
    return to12HourDisplay(hourGroup24);
  };

  // Group taken medications by hour
  const groupTakenByHour = (meds) => {
    const groups = {};

    meds.forEach((med) => {
      const hourGroup = getHourGroup(med.takenTime);
      if (!hourGroup) {
        // If no takenTime, put in "Other" group
        if (!groups["Other"]) {
          groups["Other"] = [];
        }
        groups["Other"].push(med);
        return;
      }

      if (!groups[hourGroup]) {
        groups[hourGroup] = [];
      }
      groups[hourGroup].push(med);
    });

    // Sort medications within each group by takenTime
    Object.keys(groups).forEach((hour) => {
      groups[hour].sort((a, b) => {
        const timeA = takenTimeToMinutes(a.takenTime);
        const timeB = takenTimeToMinutes(b.takenTime);
        return timeA - timeB;
      });
    });

    // Sort groups by time (convert hour group back to minutes for sorting)
    const sortedGroups = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      // Handle "Other" group - put it at the end
      if (a === "Other") return 1;
      if (b === "Other") return -1;

      const timeA = takenTimeToMinutes(toTimeInput(a));
      const timeB = takenTimeToMinutes(toTimeInput(b));
      return timeA - timeB;
    });

    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  };

  // Sort taken medications by takenTime
  const sortTakenByTime = (meds) => {
    return [...meds].sort((a, b) => {
      const timeA = takenTimeToMinutes(a.takenTime);
      const timeB = takenTimeToMinutes(b.takenTime);
      return timeA - timeB;
    });
  };

  // Group pending medications by scheduled hour (based on the earliest scheduled time)
  const groupPendingByHour = (meds) => {
    const groups = {};

    meds.forEach((med) => {
      const times24 = getScheduledTimes24(med);
      if (!times24.length) {
        if (!groups["Unscheduled"]) groups["Unscheduled"] = [];
        groups["Unscheduled"].push(med);
        return;
      }

      const [hour] = String(times24[0]).split(":");
      const hourLabel = to12HourDisplay(`${hour}:00`);
      const key = hourLabel || "Unscheduled";
      if (!groups[key]) groups[key] = [];
      groups[key].push(med);
    });

    // Sort medications within each group by their primary scheduled time
    Object.keys(groups).forEach((hour) => {
      groups[hour].sort((a, b) => {
        const aMins = getPrimaryScheduleMinutes(a);
        const bMins = getPrimaryScheduleMinutes(b);
        if (aMins !== bMins) return aMins - bMins;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      });
    });

    // Sort groups by time, keeping Unscheduled last
    const sortedGroups = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Unscheduled") return 1;
      if (b === "Unscheduled") return -1;
      const timeA = timeToMinutes(toTimeInput(a));
      const timeB = timeToMinutes(toTimeInput(b));
      return timeA - timeB;
    });
    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });
    return sortedGroups;
  };

  // For pending: group by hour if showTimeGroups is true
  // For taken: group by hour if showTimeGroups is true
  // Pending sections should always show hour headers for consistency (Personal mode expectation).
  // `showTimeGroups` remains respected for Taken sections.
  const groupedPendingMeds =
    isPending && medications.length > 0 ? groupPendingByHour(medications) : null;
  const groupedTakenMeds =
    !isPending && showTimeGroups && medications.length > 0
      ? groupTakenByHour(medications)
      : null;

  const sortedTakenMeds =
    !isPending && !groupedTakenMeds ? sortTakenByTime(medications) : null;

  const sortedPendingMeds = isPending
    ? [...medications].sort(
        (a, b) => getPrimaryScheduleMinutes(a) - getPrimaryScheduleMinutes(b),
      )
    : null;

  // Determine the date text to use
  const dateText = dateLabel || "Today";
  const isToday = !dateLabel;

  // Section config based on variant
  const sectionConfig = {
    pending: {
      icon: ClockIcon,
      iconWeight: "regular",
      title: `Pending ${dateText}`,
      compactTitle: dateLabel ? `Pending · ${dateLabel}` : "Pending",
      countLabel: "pending",
      emptyMessage: `No pending medications${
        isToday ? "" : ` for ${dateLabel}`
      }`,
    },
    taken: {
      icon: CheckCircleIcon,
      iconWeight: "fill",
      title: `Taken ${dateText}`,
      compactTitle: dateLabel ? `Taken · ${dateLabel}` : "Taken",
      countLabel: "taken",
      emptyMessage: `No medications taken${
        isToday ? " yet today" : ` on ${dateLabel}`
      }`,
    },
  };

  const config = sectionConfig[variant];
  const IconComponent = config.icon;

  const buildPendingInfo = (med) => {
    return med.additionalInfo || null;
  };

  // Handle card click - navigate to medications page unless clicking on interactive elements
  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or interactive elements
    if (
      e.target.closest("button") ||
      e.target.closest('[role="button"]') ||
      e.target.closest("a")
    ) {
      return;
    }
    onCardClick?.();
  };

  return (
    <div
      className={`bg-background-default border border-border-default rounded-2xl flex flex-col ${
        compact ? "p-4 md:p-5" : "p-6"
      } ${
        onCardClick
          ? isCaregiver
            ? "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-secondary hover:shadow-card-hover transition-all duration-200"
            : "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-primary hover:shadow-card-hover transition-all duration-200"
          : ""
      } ${
        "h-full min-h-0"
      }`}
      onClick={onCardClick ? handleCardClick : undefined}
    >
      {/* Section Header */}
      <div
        className={`flex justify-between items-center ${
          compact ? "mb-4" : "mb-6"
        }`}
      >
        <div className="flex items-center gap-3">
          <IconComponent
            size={compact ? 20 : 24}
            weight={config.iconWeight}
            className="text-icon-primary"
          />
          <div>
            <h2
              className={`${compact ? textStyles.heading.small : textStyles.heading.xl} text-text-primary`}
            >
              {compact ? config.compactTitle : config.title}
            </h2>
          </div>
        </div>
        <span
          className={`${textStyles.label.medium} text-text-secondary bg-background-hover px-3 py-1 rounded-full`}
        >
          {medications.length} {config.countLabel}
        </span>
      </div>

      {/* Medications Content */}
      {medications.length > 0 ? (
        <div className={`flex-1 ${compact ? "overflow-y-auto min-h-0" : ""}`}>
          {isPending && groupedPendingMeds ? (
            // Pending: Grouped by hour header (based on earliest scheduled time)
            <div className="space-y-6">
              {Object.entries(groupedPendingMeds).map(([hourGroup, meds]) => (
                <div key={hourGroup}>
                  <h3
                    className={`${textStyles.heading.small} text-text-primary mb-3`}
                  >
                    {hourGroup}
                  </h3>
                  <div className="space-y-3">
                    {meds.map((med) => (
                      <PendingMedicine
                        key={med.uiKey || med.id}
                        type="Due"
                        medicationName={med.name}
                        dosage={formatQuantity(med.dosage, med.unit)}
                        frequency={
                          !getScheduledTimes24(med).length ? "Unscheduled" : undefined
                        }
                        additionalInfo={buildPendingInfo(med)}
                        pillColor={med.pillColor}
                        onCheck={
                          onMarkAsTaken ? () => onMarkAsTaken(med) : undefined
                        }
                        mode={mode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : !isPending && groupedTakenMeds ? (
            // Taken: Grouped by hour with time subheaders
            <div className="space-y-6">
              {Object.entries(groupedTakenMeds).map(([hourGroup, meds]) => (
                <div key={hourGroup}>
                  <h3
                    className={`${textStyles.heading.small} text-text-primary mb-3`}
                  >
                    {hourGroup}
                  </h3>
                  <div className="space-y-3">
                    {meds.map((med) => (
                      <PendingMedicine
                        key={med.uiKey || med.id}
                        type="Taken"
                        medicationName={med.name}
                        dosage={formatQuantity(med.dosage, med.unit)}
                        additionalInfo={
                          med.takenTime
                            ? med.takenTime
                            : med.additionalInfo
                        }
                        pillColor={med.pillColor}
                        onEdit={onEdit ? () => onEdit(med.sourceMedication || med) : undefined}
                        onDelete={onDelete ? () => onDelete(med) : undefined}
                        mode={mode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Fallback: Simple list sorted by takenTime, or Pending without time groups
            <div className="space-y-3">
              {(isPending ? sortedPendingMeds : sortedTakenMeds || medications).map(
                (med) => (
                  <PendingMedicine
                    key={med.uiKey || med.id}
                    type={isPending ? "Due" : "Taken"}
                    medicationName={med.name}
                    dosage={formatQuantity(med.dosage, med.unit)}
                    frequency={
                      isPending && !getScheduledTimes24(med).length
                        ? "Unscheduled"
                        : undefined
                    }
                    additionalInfo={
                      isPending
                        ? buildPendingInfo(med)
                        : med.takenTime
                          ? med.takenTime
                          : med.additionalInfo
                    }
                    pillColor={med.pillColor}
                    onCheck={
                      isPending && onMarkAsTaken
                        ? () => onMarkAsTaken(med)
                        : undefined
                    }
                    onEdit={
                      !isPending && onEdit ? () => onEdit(med.sourceMedication || med) : undefined
                    }
                    onDelete={
                      !isPending && onDelete ? () => onDelete(med) : undefined
                    }
                    mode={mode}
                  />
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <EmptyState
          icon={
            <IconComponent
              weight={config.iconWeight}
              className="text-icon-secondary"
            />
          }
          title={config.emptyMessage}
          description={
            isReadOnlyPatient
              ? null
              : variant === "pending" && onAddMedication
              ? "Add medications to start tracking your daily doses"
              : variant === "taken"
                ? "Medications you've taken will appear here"
                : undefined
          }
          size="sm"
          className={compact ? "py-4" : ""}
          action={
            isReadOnlyPatient ? null : variant === "pending" && onAddMedication ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMedication();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90 active:scale-95 shadow-sm mt-4 ${
                  isCaregiver ? "bg-secondary" : "bg-primary"
                }`}
              >
                <PlusIcon size={16} weight="bold" />
                <span>Add Medication</span>
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default MedicationSection;
