/**
 * MedicineDue Component - Displays a medication card
 *
 * @param {string} type - "Due" | "Taken" | "Supply"
 * @param {string} state - "Default" | "Hover" (optional, auto-managed)
 * @param {string} medicationName - Name of the medication
 * @param {string} dosage - Dosage information
 * @param {string} frequency - Frequency info (optional)
 * @param {string} additionalInfo - Extra info like "Before Meal" (optional)
 * @param {string} pillColor - Custom pill icon color (optional)
 * @param {function} onCheck - Called when check button is clicked
 * @param {function} onEdit - Called when edit button is clicked
 * @param {function} onDelete - Called when delete button is clicked
 * @param {function} onMouseEnter - Called when mouse enters the component
 * @param {function} onMouseLeave - Called when mouse leaves the component
 */
import React from "react";
import {
  PillIcon,
  CheckCircleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { colors } from "../../utils/colors";

function MedicineDue({
  type = "Due",
  state: controlledState,
  medicationName = "Paracetamol",
  dosage = "2 pills",
  frequency,
  additionalInfo, // e.g., "Before Meal", "After Meal", "Causes Drowsiness"
  pillColor, // Custom pill icon color (hex)
  onCheck,
  onEdit,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}) {
  // Track hover state internally
  const [hoverState, setHoverState] = React.useState(false);

  // Use controlled state if provided, otherwise use internal hover state
  const currentState = controlledState || (hoverState ? "Hover" : "Default");

  // Determine background color based on type and state
  const getBackgroundColor = () => {
    if (type === "Due" && currentState === "Hover") {
      return colors.background.success.hover;
    }
    if (type === "Taken" || type === "Supply") {
      return colors.background.subtle;
    }
    return colors.background.subtle;
  };

  const backgroundColor = getBackgroundColor();

  // Event handlers for hover effects
  const handleMouseEnter = (e) => {
    if (type === "Due") {
      setHoverState(true);
      if (onMouseEnter) onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e) => {
    setHoverState(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg w-full max-w-[31rem] transition-colors cursor-pointer"
      style={{ backgroundColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-name={`Type=${type}, State=${currentState}`}
    >
      {/* Left section: Icon and medication info */}
      <div className="flex gap-4 items-center shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
        {/* Pill icon */}
        <div className="flex-shrink-0 w-8 h-8">
          <PillIcon
            size={32}
            weight="regular"
            color={pillColor || colors.icon.primary}
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
            {(frequency || additionalInfo) && (
              <>
                {frequency && (
                  <>
                    <div className="flex-shrink-0 w-1 h-1">
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: colors.separator.default }}
                      />
                    </div>
                    <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary whitespace-pre">
                      {frequency}
                    </p>
                  </>
                )}

                {additionalInfo && (
                  <>
                    <div className="flex-shrink-0 w-1 h-1">
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: colors.separator.default }}
                      />
                    </div>
                    <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary whitespace-pre">
                      {additionalInfo}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex gap-[0.833rem] items-center justify-end shrink-0">
        {type === "Due" && (
          <button
            onClick={onCheck}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Mark as taken"
          >
            <CheckCircleIcon
              size={24}
              weight={currentState === "Hover" ? "fill" : "regular"}
              color={
                currentState === "Hover"
                  ? colors.icon.interactive
                  : colors.icon.primary
              }
            />
          </button>
        )}

        {(type === "Taken" || type === "Supply") && (
          <>
            <button
              onClick={onEdit}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Edit medication"
            >
              <PencilSimpleIcon
                size={20}
                weight="regular"
                color={colors.icon.primary}
              />
            </button>
            <button
              onClick={onDelete}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Delete medication"
            >
              <TrashIcon
                size={20}
                weight="regular"
                color={colors.icon.primary}
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MedicineDue;
