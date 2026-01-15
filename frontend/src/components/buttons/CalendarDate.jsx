import React from "react";
import { colors } from "../../utils/colors";

/**
 * CalendarDate Component - Clickable date button in calendar
 *
 * @param {string} type - External state control (optional) - "Default" | "Hover" | "Selected"
 * @param {string} day - Day abbreviation ("Mon", "Tue", etc.)
 * @param {number} date - Date number (13, 14, etc.)
 * @param {boolean} isSelected - Is this date selected?
 * @param {function} onClick - Called when date is clicked
 * @param {function} onMouseEnter - Called when mouse enters
 * @param {function} onMouseLeave - Called when mouse leaves
 */
function DateButtons({
  type: controlledType,
  day = "Tue",
  date = 13,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const [hoverState, setHoverState] = React.useState(false);

  // Use controlled type if provided, otherwise use hover/selected state
  const currentType =
    controlledType ||
    (isSelected ? "Selected" : hoverState ? "Hover" : "Default");

  // Get styles based on current state
  const getStyles = () => {
    if (currentType === "Selected") {
      return {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: "transparent",
        dayColor: colors.text.onPrimary,
        dateColor: colors.text.onPrimary,
      };
    }

    if (currentType === "Hover") {
      return {
        backgroundColor: colors.background.default,
        borderColor: colors.border.default,
        dayColor: colors.primary.DEFAULT,
        dateColor: colors.primary.DEFAULT,
      };
    }

    // Default state
    return {
      backgroundColor: colors.background.default,
      borderColor: colors.border.default,
      dayColor: colors.text.secondary,
      dateColor: colors.text.primary,
    };
  };

  const styles = getStyles();

  const paddingY =
    currentType === "Selected" ? "py-[0.375rem]" : "py-[0.4375rem]";
  const pxValue = currentType === "Selected" ? "px-0" : "px-px";

  const handleMouseEnter = (e) => {
    if (!isSelected) {
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
      className={`flex flex-col h-[3.75rem] items-center justify-center ${pxValue} ${paddingY} rounded-lg border border-solid flex-1 min-w-[3.75rem] cursor-pointer transition-colors`}
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-name={`Type=${currentType}`}
    >
      <p
        className="font-poppins font-normal leading-6 text-sm shrink-0"
        style={{ color: styles.dayColor }}
      >
        {day}
      </p>
      <p
        className="font-poppins font-bold leading-6 text-base shrink-0"
        style={{ color: styles.dateColor }}
      >
        {date}
      </p>
    </div>
  );
}

export default DateButtons;
