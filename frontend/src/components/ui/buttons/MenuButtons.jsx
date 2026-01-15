import React from "react";
import {
  SquaresFourIcon,
  PillIcon,
  StethoscopeIcon,
  UsersIcon,
  PlusIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { getPrimaryColor, colors } from "../../../utils/colors";

/**
 * MenuButtons Component
 * Navigation button component for the medication tracker app
 *
 * @param {string} type - Button type: "Dashboard" | "Medications" | "Appointments" | "Add Medication" | "Patients"
 * @param {string} state - Button state: "Default" | "Hover" | "Selected" (optional, auto-managed)
 * @param {string} mode - App mode: "Personal" | "Caregiver"
 * @param {boolean} isSelected - Whether this button is currently selected
 * @param {function} onClick - Called when button is clicked
 * @param {function} onMouseEnter - Called when mouse enters the button
 * @param {function} onMouseLeave - Called when mouse leaves the button
 */
function MenuButtons({
  type = "Dashboard",
  state: controlledState,
  mode = "Personal",
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const [hoverState, setHoverState] = React.useState(false);

  // Determine colors based on mode
  const primaryColorHex = getPrimaryColor(mode);

  // Use controlled state if provided, otherwise use hover state
  const currentState =
    controlledState ||
    (isSelected ? "Selected" : hoverState ? "Hover" : "Default");

  // Icon component mapping
  const iconProps = {
    size: 24,
    weight: currentState === "Selected" ? "fill" : "regular",
  };

  const getIcon = () => {
    switch (type) {
      case "Dashboard":
        return <SquaresFourIcon {...iconProps} />;
      case "Medications":
        return <PillIcon {...iconProps} />;
      case "Appointments":
        return <StethoscopeIcon {...iconProps} />;
      case "Add Medication":
        return <PlusIcon {...iconProps} />;
      case "Patients":
        return <UsersIcon {...iconProps} />;
      case "Settings":
        return <GearIcon {...iconProps} />;
      default:
        return <SquaresFourIcon {...iconProps} />;
    }
  };

  const getLabel = () => {
    return type;
  };

  // Determine styles based on state
  const getStyles = () => {
    if (currentState === "Selected") {
      return {
        backgroundColor: primaryColorHex,
        textColor: colors.text.onPrimary,
        iconColor: colors.icon.onPrimary,
      };
    }

    if (currentState === "Hover") {
      return {
        backgroundColor: colors.background.default,
        textColor: primaryColorHex,
        iconColor: primaryColorHex,
      };
    }

    // Default state
    return {
      backgroundColor: colors.background.default,
      textColor: colors.text.primary,
      iconColor: colors.icon.primary,
    };
  };

  const styles = getStyles();

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
    <button
      type="button"
      className="flex gap-2 items-center px-4 py-3 rounded-lg transition-colors cursor-pointer w-full text-left border-none"
      style={{
        backgroundColor: styles.backgroundColor,
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={getLabel()}
      data-name={`Type=${type}, State=${currentState}, Mode=${mode}`}
    >
      <div className="flex-shrink-0" style={{ color: styles.iconColor }}>
        {getIcon()}
      </div>
      <span
        className="font-poppins font-semibold leading-6 text-base whitespace-pre shrink-0"
        style={{ color: styles.textColor }}
      >
        {getLabel()}
      </span>
    </button>
  );
}

export default MenuButtons;
