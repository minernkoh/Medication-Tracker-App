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
import { PillIcon, CheckCircleIcon } from "@phosphor-icons/react";
import ActionButtons from "../ui/ActionButtons";
import { getMedicationColor } from "../../utils/medicationColors";

function PendingMedicine({
  type = "Due",
  medicationName = "",
  dosage = "",
  frequency,
  additionalInfo,
  pillColor,
  onCheck,
  onEdit,
  onDelete,
}) {
  // background classes based on type
  const bgClasses =
    type === "Due"
      ? "bg-background-subtle hover:bg-success-light cursor-pointer"
      : "bg-background-subtle";

  // For "Due" type, make the whole card clickable
  const CardWrapper = type === "Due" ? "button" : "div";
  const cardProps =
    type === "Due"
      ? {
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            onCheck?.();
          },
          "aria-label": "Mark as taken",
        }
      : {};

  // Get medication color based on name (consistent across app)
  const medicationColor = getMedicationColor(medicationName);

  return (
    <CardWrapper
      className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg w-full max-w-[31rem] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${bgClasses}`}
      {...cardProps}
    >
      {/* Left section: Icon and medication info */}
      <div className="flex gap-4 items-center shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
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
        <div className="flex flex-col items-start justify-center shrink-0">
          <p className="font-poppins font-bold leading-6 text-sm text-text-primary whitespace-pre">
            {medicationName}
          </p>

          <div className="flex gap-1 items-center shrink-0 flex-wrap">
            <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary whitespace-pre">
              {dosage}
            </p>

            {/* Additional info separator and content */}
            {frequency && (
              <>
                <div className="flex-shrink-0 w-1 h-1">
                  <div className="w-full h-full rounded-full bg-separator-default" />
                </div>
                <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary whitespace-pre">
                  {frequency}
                </p>
              </>
            )}

            {additionalInfo && (
              <>
                <div className="flex-shrink-0 w-1 h-1">
                  <div className="w-full h-full rounded-full bg-separator-default" />
                </div>
                <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary whitespace-pre">
                  {additionalInfo}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex gap-1 items-center justify-end shrink-0">
        {type === "Due" && (
          <CheckCircleIcon
            size={24}
            weight="regular"
            className="text-icon-primary hover:text-blue-500 transition-colors flex-shrink-0"
          />
        )}

        {(type === "Taken" || type === "Supply") && (
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            size="base"
            editLabel="Edit medication"
            deleteLabel="Delete medication"
          />
        )}
      </div>
    </CardWrapper>
  );
}

export default PendingMedicine;
