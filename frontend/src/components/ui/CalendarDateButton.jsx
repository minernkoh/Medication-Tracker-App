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
  hasAppointment = false,
  hasFullAdherence = false,
  onClick,
}) {
  // base classes for the button
  const baseClasses = `
    flex flex-col h-[3.75rem] items-center justify-center
    rounded-lg border border-solid flex-1 min-w-[3.75rem]
    cursor-pointer transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    relative
  `;

  // state-based classes using tailwind - no js hover needed
  const stateClasses = isSelected
    ? "bg-primary border-transparent shadow-[0_4px_12px_rgba(21,93,252,0.3)]"
    : hasFullAdherence
    ? "bg-success border-transparent hover:brightness-95"
    : isToday
    ? "bg-background-default border-primary hover:border-primary"
    : "bg-background-default border-border-default hover:border-primary";

  // text color classes based on state
  const dayColorClass = isSelected || hasFullAdherence
    ? "text-text-onPrimary"
    : "text-text-secondary group-hover:text-primary";

  const dateColorClass = isSelected || hasFullAdherence
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
        className={`font-poppins leading-4 text-[10px] uppercase shrink-0 font-medium transition-colors ${dayColorClass}`}
      >
        {day}
      </span>
      <span
        className={`font-poppins font-bold leading-6 text-base shrink-0 transition-colors ${dateColorClass}`}
      >
        {date}
      </span>
      
      {/* Appointment indicator */}
      {hasAppointment && !hasFullAdherence && (
        <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ${isSelected ? 'ring-1 ring-white' : ''}`} />
      )}
    </button>
  );
}

export default CalendarDateButton;
