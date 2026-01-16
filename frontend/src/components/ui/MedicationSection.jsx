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
import { ClockIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { colors } from "../../utils/colors";
import { MedicineDue } from "./buttons";

function MedicationSection({
  variant = "pending",
  medications = [],
  onMarkAsTaken,
  onEdit,
  onDelete,
  showTimeGroups = true,
  compact = false,
  dateLabel = null,
}) {
  const isPending = variant === "pending";

  // Group medications by time of day
  const groupByTime = (meds) => {
    const groups = {};

    meds.forEach((med) => {
      const time = med.timeOfDay || med.time || "Other";
      const normalizedTime =
        time.charAt(0).toUpperCase() + time.slice(1).toLowerCase();
      if (!groups[normalizedTime]) {
        groups[normalizedTime] = [];
      }
      groups[normalizedTime].push(med);
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

  const groupedMeds = showTimeGroups ? groupByTime(medications) : null;

  // Time group colors
  const timeColors = {
    Morning: "bg-blue-500",
    Afternoon: "bg-amber-500",
    Night: "bg-purple-500",
    Other: "bg-gray-500",
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

  return (
    <div
      className={`bg-background-default border border-border-default rounded-2xl h-full ${
        compact ? "p-4 md:p-5" : "p-6"
      }`}
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
            color={colors.icon.primary}
          />
          <div>
            <h2
              className={`font-poppins font-bold text-text-primary ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              {compact ? config.compactTitle : config.title}
            </h2>
            {!compact && (
              <p className="font-poppins text-sm text-text-secondary mt-1">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>
        <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
          {medications.length} {config.countLabel}
        </span>
      </div>

      {/* Medications Content */}
      {medications.length > 0 ? (
        showTimeGroups && groupedMeds ? (
          // Grouped by time
          <div className={compact ? "space-y-4" : "space-y-6"}>
            {Object.entries(groupedMeds).map(([time, meds]) => (
              <div key={time} className={compact ? "" : "mb-6 last:mb-0"}>
                <h3 className="font-poppins font-bold leading-6 text-sm text-text-primary mb-3 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      timeColors[time] || timeColors.Other
                    }`}
                  />
                  {time}
                </h3>
                <div className="space-y-3">
                  {meds.map((med) => (
                    <MedicineDue
                      key={med.id}
                      type={isPending ? "Due" : "Taken"}
                      medicationName={med.name}
                      dosage={med.dosage}
                      additionalInfo={
                        isPending
                          ? med.additionalInfo
                          : med.takenTime
                          ? `Taken at ${med.takenTime}`
                          : med.additionalInfo
                      }
                      pillColor={med.pillColor}
                      onCheck={
                        isPending ? () => onMarkAsTaken?.(med.id) : undefined
                      }
                      onEdit={!isPending ? () => onEdit?.(med.id) : undefined}
                      onDelete={
                        !isPending ? () => onDelete?.(med.id) : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple list without time groups
          <div className="space-y-3">
            {medications.map((med) => (
              <MedicineDue
                key={med.id}
                type={isPending ? "Due" : "Taken"}
                medicationName={med.name}
                dosage={med.dosage}
                additionalInfo={
                  isPending
                    ? med.additionalInfo
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
        )
      ) : (
        // Empty state
        <p className="font-poppins text-sm text-text-secondary italic p-3 bg-background-subtle rounded-lg text-center">
          {config.emptyMessage}
        </p>
      )}
    </div>
  );
}

export default MedicationSection;
