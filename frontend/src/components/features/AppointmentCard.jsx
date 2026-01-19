import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { colors } from "../../../tailwind.config.js";

/**
 * AppointmentCard Component
 * Displays upcoming appointment information - accessible and keyboard navigable
 *
 * @param {string} title - Appointment title
 * @param {string} date - Appointment date and time
 * @param {string} doctor - Doctor's name
 * @param {string} location - Appointment location
 * @param {function} onClick - Optional click handler (defaults to navigate to /appointments)
 * @param {boolean} isReadOnly - When true, hides scheduling-focused empty text
 */
function AppointmentCard({
  title = "",
  date = "",
  doctor = "",
  location = "",
  onClick,
  isReadOnly = false,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/appointments");
    }
  };

  const hasAppointment = title && date && title !== "No upcoming appointments";
  const isEmpty = !hasAppointment;
  const showAddAppointment = isEmpty && !isReadOnly;

  const ariaLabel = hasAppointment
    ? `View appointment: ${title} on ${date}`
    : "View appointments";

  const handleAddAppointment = (e) => {
    e?.stopPropagation?.();
    navigate("/appointments", { state: { openAddModal: true } });
  };

  // When empty + editable, we render a non-button wrapper so we can safely include
  // a nested "Add appointment" button (nested buttons are invalid HTML).
  if (showAddAppointment) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="rounded-2xl p-5 bg-background-default border border-border-default cursor-pointer hover:border-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex flex-[1_0_0] flex-col gap-2 items-start group text-left w-full"
        aria-label={ariaLabel}
      >
        <div className="flex justify-between items-center w-full">
          <p className="font-poppins font-bold leading-6 text-base text-text-primary">
            Upcoming Appointment
          </p>
          <CaretRightIcon
            size={20}
            weight="regular"
            className="text-text-secondary group-hover:text-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 items-start shrink-0 w-full">
          <EmptyState
            icon={
              <CalendarBlankIcon
                weight="regular"
                className="text-icon-secondary"
              />
            }
            title="No upcoming appointments"
            description="Schedule one to stay on track"
            size="sm"
            className="mt-3 py-4 px-0 w-full"
            action={
              <button
                type="button"
                onClick={handleAddAppointment}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-sm mt-2 bg-primary"
                aria-label="Schedule Appointment"
              >
                <PlusIcon size={16} weight="bold" />
                <span>Schedule Appointment</span>
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <Card
      onClick={handleClick}
      className="flex flex-[1_0_0] flex-col gap-2 items-start group text-left w-full"
      aria-label={ariaLabel}
    >
      <div className="flex justify-between items-center w-full">
        <p className="font-poppins font-bold leading-6 text-base text-text-primary">
          Upcoming Appointment
        </p>
        <CaretRightIcon
          size={20}
          weight="regular"
          className="text-text-secondary group-hover:text-primary transition-colors"
        />
      </div>
      <div className="flex flex-col gap-2 items-start shrink-0 w-full">
        {isEmpty ? (
          <EmptyState
            icon={
              <CalendarBlankIcon
                weight="regular"
                className="text-icon-secondary"
              />
            }
            title="No upcoming appointments"
            description={isReadOnly ? undefined : "Schedule one to stay on track"}
            size="sm"
            className="mt-3 py-4 px-0 w-full"
          />
        ) : (
          <>
            <p className="font-poppins font-bold leading-none text-xl text-text-primary w-full">
              {title}
            </p>
            {date && (
              <div className="flex gap-2 items-center shrink-0 w-full">
                <div className="flex-shrink-0 w-4 h-4">
                  <CalendarBlankIcon
                    size={16}
                    weight="regular"
                    color={colors.icon.secondary}
                  />
                </div>
                <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                  {date}
                </p>
              </div>
            )}
            {doctor && (
              <div className="flex gap-2 items-center shrink-0 w-full">
                <div className="flex-shrink-0 w-4 h-4">
                  <StethoscopeIcon
                    size={16}
                    weight="regular"
                    color={colors.icon.secondary}
                  />
                </div>
                <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                  {doctor}
                </p>
              </div>
            )}
            {location && (
              <div className="flex gap-2 items-center shrink-0 w-full">
                <div className="flex-shrink-0 w-4 h-4">
                  <MapPinIcon
                    size={16}
                    weight="regular"
                    color={colors.icon.secondary}
                  />
                </div>
                <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                  {location}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export default AppointmentCard;
