/**
 * PendingMedicine Component - Displays a medication card
 * (Renamed from MedicineDue to better reflect its purpose)
 *
 * @param {string} type - "Due" | "Taken" | "Supply"
 * @param {string} medicationName - Name of the medication
 * @param {string} dosage - Dosage information
 * @param {string} frequency - Frequency info (optional)
 * @param {string} additionalInfo - Extra info like "Before Meal" (optional)
 * @param {string} pillColor - Custom pill icon color (optional, deprecated - now uses medication name)
 * @param {function} onCheck - Called when check button is clicked
 * @param {function} onEdit - Called when edit button is clicked
 * @param {function} onDelete - Called when delete button is clicked
 */
import React from "react";
import {
  PillIcon,
  CheckCircleIcon,
  ArrowUUpLeft,
  PencilSimple,
} from "@phosphor-icons/react";
import ActionButtons from "../ui/ActionButtons";
import { getMedicationColor } from "../../utils/medicationColors";

function PendingMedicine({
  type = "Due",
  medicationName = "",
  dosage = "",
  frequency,
  scheduleGroups,
  additionalInfo,
  pillColor,
  onCheck,
  onEdit,
  onDelete,
}) {
  // background classes based on type
  const bgClasses =
    type === "Due" && onCheck
      ? "bg-background-subtle hover:bg-success-light cursor-pointer"
      : "bg-background-subtle";

  // For "Due" type, make the whole card clickable only if onCheck is provided
  const CardWrapper = type === "Due" && onCheck ? "button" : "div";
  const cardProps =
    type === "Due" && onCheck
      ? {
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            onCheck();
          },
          "aria-label": "Mark as taken",
        }
      : {};

  // Get medication color based on name (consistent across app)
  const medicationColor = getMedicationColor(medicationName);

  return (
    <CardWrapper
      className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-lg w-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${bgClasses}`}
      {...cardProps}
    >
      {/* Left section: Icon and medication info */}
      <div className="flex gap-4 items-center w-full sm:w-auto min-w-0">
        {/* Pill icon with colored background */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: medicationColor.bg }}
          aria-hidden="true"
        >
          <PillIcon
            size={20}
            weight="fill"
            color={medicationColor.icon}
            aria-label={`${medicationName} medication icon`}
          />
        </div>

        {/* Medication details */}
        <div className="flex flex-col items-start justify-center min-w-0">
          <p className="font-poppins font-bold leading-6 text-sm text-text-primary text-left whitespace-normal break-words w-full min-w-0">
            {medicationName}
          </p>

          <div className="flex flex-col gap-1 w-full min-w-0">
            <div className="flex gap-1 items-center shrink-0 flex-wrap">
              <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary text-left whitespace-normal break-words">
                {dosage}
              </p>

              {/* Schedule fallback (ungrouped / unscheduled) */}
              {frequency && !scheduleGroups?.length && (
                <>
                  <div className="flex-shrink-0 w-1 h-1">
                    <div className="w-full h-full rounded-full bg-separator-default" />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary text-left whitespace-normal break-words">
                    {frequency}
                  </p>
                </>
              )}

              {additionalInfo && (
                <>
                  <div className="flex-shrink-0 w-1 h-1">
                    <div className="w-full h-full rounded-full bg-separator-default" />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary text-left whitespace-normal break-words">
                    {additionalInfo}
                  </p>
                </>
              )}
            </div>

            {/* Schedule groups (group by hour, list original times) */}
            {scheduleGroups?.length ? (
              <div className="space-y-0.5">
                {scheduleGroups.map((group) => (
                  <div
                    key={group.hourLabel}
                    className="flex flex-wrap gap-x-2 items-baseline"
                  >
                    <span className="font-poppins font-bold leading-6 text-sm text-text-secondary">
                      {group.hourLabel}
                    </span>
                    <span className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                      {Array.isArray(group.times) ? group.times.join(", ") : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex gap-1 items-center justify-end w-full sm:w-auto shrink-0">
        {type === "Due" && onCheck && (
          <CheckCircleIcon
            size={24}
            weight="regular"
            className="text-icon-primary hover:text-blue-500 transition-colors flex-shrink-0"
          />
        )}

        {type === "Taken" && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg hover:bg-primary-light transition-colors group/edit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Edit taken medication"
              >
                <PencilSimple
                  size={18}
                  weight="regular"
                  className="text-icon-primary group-hover/edit:text-primary transition-colors"
                />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg hover:bg-yellow-100 transition-colors group/undo focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                aria-label="Undo taken status"
              >
                <ArrowUUpLeft
                  size={18}
                  weight="bold"
                  className="text-icon-primary group-hover/undo:text-yellow-800 transition-colors"
                />
              </button>
            )}
          </div>
        )}

        {type === "Supply" && (
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            size="base"
            editLabel="Edit medication"
            deleteLabel={type === "Taken" ? "Undo taken" : "Delete medication"}
            deleteIconType={type === "Taken" ? "undo" : "delete"}
          />
        )}
      </div>
    </CardWrapper>
  );
}

export default PendingMedicine;
