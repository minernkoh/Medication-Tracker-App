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
    flex flex-col h-[3.75rem] items-center justify-center
    rounded-lg border border-solid flex-1 min-w-[3.75rem]
    cursor-pointer transition-all duration-200
    focus:outline-none focus-visible:ring-2 ${
      isCaregiver ? "focus-visible:ring-secondary/35" : "focus-visible:ring-primary/35"
    } focus-visible:ring-offset-2
    relative
    after:content-[''] after:absolute after:block after:inset-[1px] after:rounded-lg after:pointer-events-none
    after:border-2 after:opacity-0 after:transition-opacity after:duration-200
  `;

  // state-based classes using tailwind - no js hover needed
  const stateClasses = isSelected
    ? isCaregiver
      ? "bg-secondary border-transparent shadow-glow-secondary-sm"
      : "bg-primary border-transparent shadow-glow-primary-sm"
    : hasFullAdherence
    ? "bg-background-default border-transparent after:opacity-100 after:border-success"
    : isToday
    ? `bg-background-default ${
        isCaregiver
          ? "border-secondary hover:border-transparent after:border-secondary hover:after:opacity-100"
          : "border-primary hover:border-transparent after:border-primary hover:after:opacity-100"
      }`
    : `bg-background-default border-border-default ${
        isCaregiver
          ? "hover:border-transparent after:border-secondary hover:after:opacity-100"
          : "hover:border-transparent after:border-primary hover:after:opacity-100"
      }`;

  // text color classes based on state
  const dayColorClass = isSelected
    ? "text-text-onPrimary"
    : hasFullAdherence
      ? "text-text-secondary group-hover:text-success"
      : `text-text-secondary ${
          isCaregiver ? "group-hover:text-secondary" : "group-hover:text-primary"
        }`;

  const dateColorClass = isSelected
    ? "text-text-onPrimary"
    : hasFullAdherence
      ? "text-text-primary group-hover:text-success"
      : `text-text-primary ${
          isCaregiver ? "group-hover:text-secondary" : "group-hover:text-primary"
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
        <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ${isSelected ? 'ring-1 ring-white' : ''}`} />
      )}
    </button>
  );
}

export default CalendarDateButton;
