import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
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
 */
function AppointmentCard({
  title = "",
  date = "",
  doctor = "",
  location = "",
  onClick,
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

  return (
    <Card
      onClick={handleClick}
      className="flex flex-[1_0_0] flex-col gap-2 items-start group text-left w-full"
      aria-label={
        hasAppointment
          ? `View appointment: ${title} on ${date}`
          : "View appointments"
      }
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
            description="Schedule one to stay on track"
            size="sm"
            className="py-4 px-0 w-full"
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
