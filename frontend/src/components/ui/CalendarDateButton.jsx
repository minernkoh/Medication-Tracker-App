import React from "react";

/**
 * CalendarDateButton Component - Accessible clickable date button in calendar
 *
 * @param {string} day - Day abbreviation ("Mon", "Tue", etc.)
 * @param {number} date - Date number (13, 14, etc.)
 * @param {boolean} isSelected - Is this date selected?
 * @param {boolean} isToday - Is this date today?
 * @param {function} onClick - Called when date is clicked
 */
function CalendarDateButton({
  day = "Tue",
  date = 13,
  isSelected = false,
  isToday = false,
  onClick,
}) {
  // base classes for the button
  const baseClasses = `
    flex flex-col h-[3.75rem] items-center justify-center
    rounded-lg border border-solid flex-1 min-w-[3.75rem]
    cursor-pointer transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
  `;

  // state-based classes using tailwind - no js hover needed
  const stateClasses = isSelected
    ? "bg-primary border-transparent shadow-[0_4px_12px_rgba(21,93,252,0.3)]"
    : isToday
    ? "bg-background-default border-primary hover:border-primary"
    : "bg-background-default border-border-default hover:border-primary";

  // text color classes based on state
  const dayColorClass = isSelected
    ? "text-text-onPrimary"
    : "text-text-secondary group-hover:text-primary";

  const dateColorClass = isSelected
    ? "text-text-onPrimary"
    : "text-text-primary group-hover:text-primary";

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses} group`}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-current={isToday ? "date" : undefined}
    >
      <span
        className={`font-poppins leading-6 text-sm shrink-0 font-normal transition-colors ${dayColorClass}`}
      >
        {day}
      </span>
      <span
        className={`font-poppins font-bold leading-6 text-base shrink-0 transition-colors ${dateColorClass}`}
      >
        {date}
      </span>
    </button>
  );
}

export default CalendarDateButton;
