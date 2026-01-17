/**
 * MedicationSection Component - Reusable section for displaying medications
 * Used in both Dashboard and MedicationPage for Pending/Taken sections
 *
 * @param {string} variant - "pending" | "taken"
 * @param {Array} medications - Array of medication objects
 * @param {function} onMarkAsTaken - Callback when marking medication as taken (for pending)
 * @param {function} onEdit - Callback when editing a medication (for taken)
 * @param {function} onDelete - Callback when deleting a medication (for taken)
 * @param {boolean} showTimeGroups - Whether to show time-based grouping (Morning/Afternoon/Night)
 * @param {boolean} compact - Use compact styling (for Dashboard)
 * @param {string} dateLabel - Optional date label to replace "Today" (e.g., "Mon, Jan 13")
 */
import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  SunIcon,
  SunDimIcon,
  MoonIcon,
} from "@phosphor-icons/react";
import { EmptyState } from "../ui";
import PendingMedicine from "./PendingMedicine";
import { timeToMinutes, toTimeInput, to12HourDisplay, textStyles } from "../../utils";

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
}) {
  const isPending = variant === "pending";

  // Converts "08:00" -> "Morning", "13:00" -> "Afternoon", "20:00" -> "Night"
  const getTimeGroup = (timeOfDay) => {
    if (!timeOfDay) return "Other";

    // Normalize word formats (morning/afternoon/night)
    if (typeof timeOfDay === "string") {
      const normalized = timeOfDay.trim().toLowerCase();
      if (["morning", "afternoon", "night"].includes(normalized)) {
        return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
      }
      if (/^[A-Z]/.test(timeOfDay)) {
        return timeOfDay;
      }
    }

    // Convert 24-hour format (HH:MM) to time groups
    if (typeof timeOfDay === "string" && timeOfDay.includes(":")) {
      const hour = parseInt(timeOfDay.split(":")[0]);
      if (hour >= 5 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 17) return "Afternoon";
      if (hour >= 17 || hour < 5) return "Night";
    }

    return "Other";
  };

  // Group medications by time of day (for pending medications)
  const groupByTime = (meds) => {
    const groups = {};

    meds.forEach((med) => {
      // Use getTimeGroup helper to properly convert timeOfDay to group
      const time = getTimeGroup(med.timeOfDay);
      if (!groups[time]) {
        groups[time] = [];
      }
      groups[time].push(med);
    });

    // Sort groups by time order
    const sortedGroups = {};
    ["Morning", "Afternoon", "Night", "Other"].forEach((time) => {
      if (groups[time]) {
        sortedGroups[time] = groups[time];
      }
    });

    return sortedGroups;
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

  // For pending: group by time if showTimeGroups is true
  // For taken: group by hour if medications exist
  const groupedMeds = showTimeGroups && isPending ? groupByTime(medications) : null;
  const groupedTakenMeds = !isPending && medications.length > 0 ? groupTakenByHour(medications) : null;
  const sortedTakenMeds = !isPending && !groupedTakenMeds ? sortTakenByTime(medications) : null;

  // Time group colors
  const timeColors = {
    Morning: "bg-blue-500",
    Afternoon: "bg-amber-500",
    Night: "bg-purple-500",
    Other: "bg-gray-500",
  };

  // Time group icons
  const timeIcons = {
    Morning: SunIcon,
    Afternoon: SunDimIcon,
    Night: MoonIcon,
    Other: ClockIcon,
  };

  // Time group icon colors
  const timeIconColors = {
    Morning: "text-blue-500",
    Afternoon: "text-amber-500",
    Night: "text-purple-500",
    Other: "text-gray-500",
  };

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
      subtitle: `Medications scheduled for ${dateText.toLowerCase()}`,
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
      subtitle: `Medications already taken ${dateText.toLowerCase()}`,
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
      } ${onCardClick ? "cursor-pointer hover:border-primary transition-all" : ""} ${
        compact ? "h-full min-h-0" : ""
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
            {!compact && (
              <p className={`${textStyles.body.small} text-text-secondary mt-1`}>
                {config.subtitle}
              </p>
            )}
          </div>
        </div>
        <span className={`${textStyles.label.medium} text-text-secondary bg-background-hover px-3 py-1 rounded-full`}>
          {medications.length} {config.countLabel}
        </span>
      </div>

      {/* Medications Content */}
      {medications.length > 0 ? (
        <div className={`flex-1 overflow-y-auto ${compact ? "min-h-0" : ""}`}>
          {isPending && showTimeGroups && groupedMeds ? (
            // Pending: Grouped by time (Morning/Afternoon/Night)
            <div className="space-y-6">
            {Object.entries(groupedMeds).map(([time, meds]) => {
              const IconComponent = timeIcons[time] || timeIcons.Other;
              return (
                <div key={time}>
                  <h3 className={`${textStyles.heading.small} text-text-primary mb-3 flex items-center gap-2`}>
                    <IconComponent
                      size={16}
                      weight="regular"
                      className={timeIconColors[time] || timeIconColors.Other}
                    />
                    {time}
                  </h3>
                <div className="space-y-3">
                  {meds.map((med) => (
                    <PendingMedicine
                      key={med.id}
                      type="Due"
                      medicationName={med.name}
                      dosage={med.dosage}
                      additionalInfo={buildPendingInfo(med)}
                      pillColor={med.pillColor}
                      onCheck={() => onMarkAsTaken?.(med.id)}
                    />
                  ))}
                </div>
                </div>
              );
            })}
          </div>
        ) : !isPending && groupedTakenMeds ? (
          // Taken: Grouped by hour with time subheaders
          <div className="space-y-6">
            {Object.entries(groupedTakenMeds).map(([hourGroup, meds]) => (
              <div key={hourGroup}>
                <h3 className={`${textStyles.heading.small} text-text-primary mb-3`}>
                  {hourGroup}
                </h3>
                <div className="space-y-3">
                  {meds.map((med) => (
                    <PendingMedicine
                      key={med.id}
                      type="Taken"
                      medicationName={med.name}
                      dosage={med.dosage}
                      additionalInfo={
                        med.takenTime
                          ? `Taken at ${med.takenTime}`
                          : med.additionalInfo
                      }
                      pillColor={med.pillColor}
                      onEdit={() => onEdit?.(med)}
                      onDelete={() => onDelete?.(med.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : (
            // Fallback: Simple list sorted by takenTime, or Pending without time groups
            <div className="space-y-3">
              {(sortedTakenMeds || medications).map((med) => (
                <PendingMedicine
                  key={med.id}
                  type={isPending ? "Due" : "Taken"}
                  medicationName={med.name}
                  dosage={med.dosage}
                  additionalInfo={
                    isPending
                      ? buildPendingInfo(med)
                      : med.takenTime
                      ? `Taken at ${med.takenTime}`
                      : med.additionalInfo
                  }
                  pillColor={med.pillColor}
                  onCheck={isPending ? () => onMarkAsTaken?.(med.id) : undefined}
                  onEdit={!isPending ? () => onEdit?.(med) : undefined}
                  onDelete={!isPending ? () => onDelete?.(med.id) : undefined}
                />
              ))}
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
            variant === "pending" && onAddMedication
              ? "Add medications to start tracking your daily doses"
              : variant === "taken"
              ? "Medications you've taken will appear here"
              : undefined
          }
          size="sm"
          className={compact ? "py-4" : ""}
          action={
            variant === "pending" && onAddMedication ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMedication();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90 active:scale-95 shadow-sm mt-4 bg-primary`}
              >
                <PlusIcon size={16} weight="bold" />
                <span>Add Medication</span>
                <ArrowRightIcon size={16} weight="bold" />
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default MedicationSection;
