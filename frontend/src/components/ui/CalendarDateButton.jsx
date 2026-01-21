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
  mode = "Personal",
}) {
  const isCaregiver = mode === "Caregiver";

  // base classes for the button
  const baseClasses = `
    flex flex-col h-[3.75rem] items-center justify-center box-border
    rounded-lg border border-solid flex-1 min-w-[3.75rem]
    cursor-pointer transition-colors transition-shadow duration-200
    focus:outline-none focus-visible:ring-2 ${
      isCaregiver
        ? "focus-visible:ring-secondary/35"
        : "focus-visible:ring-primary/35"
    } focus-visible:ring-offset-2
    relative
  `;

  // state-based classes using tailwind - no js hover needed
  const stateClasses = isSelected
    ? isCaregiver
      ? "bg-secondary border-transparent shadow-glow-secondary-sm"
      : "bg-primary border-transparent shadow-glow-primary-sm"
    : hasFullAdherence
      ? "bg-background-default border-border-default ring-2 ring-inset ring-success/60"
      : isToday
        ? `bg-background-default ${
            isCaregiver
              ? "border-secondary hover:ring-2 hover:ring-inset hover:ring-secondary/35"
              : "border-primary hover:ring-2 hover:ring-inset hover:ring-primary/35"
          }`
        : `bg-background-default border-border-default ${
            isCaregiver
              ? "hover:border-secondary hover:ring-2 hover:ring-inset hover:ring-secondary/35"
              : "hover:border-primary hover:ring-2 hover:ring-inset hover:ring-primary/35"
          }`;

  // text color classes based on state
  const dayColorClass = isSelected
    ? "text-text-onPrimary"
    : hasFullAdherence
      ? "text-text-secondary group-hover:text-success"
      : `text-text-secondary ${
          isCaregiver
            ? "group-hover:text-secondary"
            : "group-hover:text-primary"
        }`;

  const dateColorClass = isSelected
    ? "text-text-onPrimary"
    : hasFullAdherence
      ? "text-text-primary group-hover:text-success"
      : `text-text-primary ${
          isCaregiver
            ? "group-hover:text-secondary"
            : "group-hover:text-primary"
        }`;

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
        <div
          className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ${isSelected ? "ring-1 ring-white" : ""}`}
        />
      )}
    </button>
  );
}

export default CalendarDateButton;
