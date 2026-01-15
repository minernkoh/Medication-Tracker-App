import React from "react";
import {
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { colors } from "../utils/colors";

/**
 * AppointmentCard Component
 * Displays upcoming appointment information
 *
 * @param {string} title - Appointment title (default: "Annual Physical Check Up")
 * @param {string} date - Appointment date and time (default: "Thu, Jan 15, 2:00 PM")
 * @param {string} doctor - Doctor's name (default: "Dr Willliams")
 * @param {string} location - Appointment location (default: "Singapore General Hospital")
 */
function AppointmentCard({
  title = "Annual Physical Check Up",
  date = "Thu, Jan 15, 2:00 PM",
  doctor = "Dr Willliams",
  location = "Singapore General Hospital",
}) {
  return (
    <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-2 items-center p-5 rounded-2xl">
      <p className="font-poppins font-bold leading-6 text-base text-text-primary w-full">
        Upcoming Appointment
      </p>
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
