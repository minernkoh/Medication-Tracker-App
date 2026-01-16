import React from "react";
import {
  SquaresFourIcon,
  PillIcon,
  StethoscopeIcon,
  UsersIcon,
  PlusIcon,
  GearIcon,
} from "@phosphor-icons/react";

/**
 * SideMenuButtons Component
 * Navigation button for sidebar - uses CSS hover states, no JS state needed
 *
 * @param {string} type - Button type: "Dashboard" | "Medications" | "Appointments" | "Add Medication" | "Patients" | "Settings"
 * @param {string} mode - App mode: "Personal" | "Caregiver"
 * @param {boolean} isSelected - Whether this button is currently selected
 * @param {function} onClick - Called when button is clicked
 */
function SideMenuButtons({
  type = "Dashboard",
  mode = "Personal",
  isSelected = false,
  onClick,
}) {
  // determine color classes based on mode
  const modeColorClasses =
    mode === "Personal"
      ? {
          selected: "bg-primary text-text-onPrimary",
          hover: "hover:text-primary",
        }
      : {
          selected: "bg-secondary text-text-onSecondary",
          hover: "hover:text-secondary",
        };

  // base classes for the button
  const baseClasses = `
    flex gap-2 items-center px-4 py-3 rounded-lg transition-colors cursor-pointer w-full text-left border-none
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ${
      mode === "Personal"
        ? "focus-visible:ring-primary"
        : "focus-visible:ring-secondary"
    }
  `;

  // state-based classes
  const stateClasses = isSelected
    ? modeColorClasses.selected
    : `bg-background-default text-text-primary ${modeColorClasses.hover}`;

  // get icon component
  const getIcon = () => {
    const weight = isSelected ? "fill" : "regular";
    const size = 24;

    switch (type) {
      case "Dashboard":
        return <SquaresFourIcon size={size} weight={weight} />;
      case "Medications":
        return <PillIcon size={size} weight={weight} />;
      case "Appointments":
        return <StethoscopeIcon size={size} weight={weight} />;
      case "Add Medication":
        return <PlusIcon size={size} weight={weight} />;
      case "Patients":
        return <UsersIcon size={size} weight={weight} />;
      case "Settings":
        return <GearIcon size={size} weight={weight} />;
      default:
        return <SquaresFourIcon size={size} weight={weight} />;
    }
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses} group`}
      onClick={onClick}
      aria-label={type}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <span className="font-poppins font-semibold leading-6 text-base whitespace-pre shrink-0">
        {type}
      </span>
    </button>
  );
}

export default SideMenuButtons;
