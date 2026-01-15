import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { colors } from "../../utils/colors";

/**
 * AppointmentCard Component
 * Displays upcoming appointment information
 *
 * @param {string} title - Appointment title (default: "Annual Physical Check Up")
 * @param {string} date - Appointment date and time (default: "Thu, Jan 15, 2:00 PM")
 * @param {string} doctor - Doctor's name (default: "Dr Willliams")
 * @param {string} location - Appointment location (default: "Singapore General Hospital")
 * @param {function} onClick - Optional click handler (defaults to navigate to /appointments)
 */
function AppointmentCard({
  title = "Annual Physical Check Up",
  date = "Thu, Jan 15, 2:00 PM",
  doctor = "Dr Willliams",
  location = "Singapore General Hospital",
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
    <div
      className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-2 items-center p-5 rounded-2xl cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
      onClick={handleClick}
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
    </div>
  );
}

export default AppointmentCard;
