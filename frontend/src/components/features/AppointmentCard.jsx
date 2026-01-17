import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import Card from "../ui/Card";
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

  return (
    <Card
      onClick={handleClick}
      className="flex flex-[1_0_0] flex-col gap-2 items-start group text-left w-full"
      aria-label={
        title && date
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
        <p className="font-poppins font-bold leading-none text-xl text-text-primary w-full">
          {title}
        </p>
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
      </div>
    </Card>
  );
}

export default AppointmentCard;
