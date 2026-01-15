/**
 * Dashboard Component - Main page showing calendar, medications, and appointments
 *
 * @param {string} userName - User's name (default: "Sarah")
 * @param {string} mode - "Personal" or "Caregiver" (default: "Personal")
 */
import React, { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { colors } from "../utils/colors";
import Sidebar from "./Sidebar";
import CalendarDate from "./buttons/CalendarDate";
import MedicineDue from "./buttons/MedicineDue";
import AppointmentCard from "./AppointmentCard";

function Dashboard({ userName = "Sarah", mode = "Personal" }) {
  // State: tracks selected date and menu item
  const [selectedDate, setSelectedDate] = useState(13);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calendar dates for the week
  const calendarDates = [
    { day: "Mon", date: 12 },
    { day: "Tue", date: 13 },
    { day: "Wed", date: 14 },
    { day: "Thu", date: 15 },
    { day: "Fri", date: 16 },
    { day: "Sat", date: 17 },
    { day: "Sun", date: 18 },
  ];

  return (
    <div className="bg-background-default w-full min-h-screen overflow-x-hidden flex">
      {/* Gradient background decoration */}
      <div className="hidden md:block absolute h-[1371px] left-[69px] top-[-176px] w-[1413px] pointer-events-none z-0">
        <div className="absolute inset-[-36.47%_-35.39%]">
          <div
            className="w-full h-full opacity-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(21, 93, 252, 0.1) 0%, rgba(218, 116, 136, 0.1) 100%)",
            }}
          />
        </div>
      </div>

      {/* Sidebar navigation - sticky on desktop, fixed on mobile */}
      <Sidebar
        userName="Sarah Johnson"
        userEmail="sarahjohnson@gmail.com"
        mode={mode}
        selectedMenu={selectedMenu}
        onMenuClick={setSelectedMenu}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-text-onPrimary rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        Menu
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area - positioned at top, starts after sidebar */}
      <div className="relative flex flex-col gap-[24px] items-start pt-10 px-4 md:px-0 w-full flex-1 z-10">
        <div className="w-full max-w-[1080px] mx-auto">
          {/* Header */}
          <p className="font-poppins font-bold leading-none text-2xl md:text-[32px] text-text-primary w-full">
            Good Morning, {userName}!
          </p>

          {/* Calendar section */}
          <div className="bg-background-default border border-border-default flex flex-col gap-2 items-center p-4 rounded-2xl shrink-0 w-full">
            <p className="font-poppins font-bold leading-6 text-base text-text-primary text-center w-full">
              Jan 2026
            </p>

            {/* Calendar dates - .map() creates a CalendarDate for each date */}
            <div className="flex gap-1 md:gap-2 h-[60px] items-center shrink-0 w-full overflow-x-auto pb-2">
              <button className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity">
                <CaretLeftIcon
                  size={20}
                  weight="regular"
                  color={colors.icon.primary}
                />
              </button>

              {calendarDates.map((item) => (
                <CalendarDate
                  key={item.date}
                  day={item.day}
                  date={item.date}
                  isSelected={selectedDate === item.date}
                  onClick={() => setSelectedDate(item.date)}
                />
              ))}

              <button className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity">
                <CaretRightIcon
                  size={20}
                  weight="regular"
                  color={colors.icon.primary}
                />
              </button>
            </div>
          </div>

          {/* Stats and appointment cards */}
          <div className="flex flex-col md:flex-row gap-[24px] items-stretch w-full">
            {/* Today's Progress card */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col items-center p-5 rounded-2xl">
              <p className="font-poppins font-bold leading-6 text-base text-text-primary w-full">
                Today's Progress
              </p>
            </div>

            {/* Upcoming Appointment card */}
            <AppointmentCard />
          </div>

          {/* Medications section */}
          <div className="flex flex-col md:flex-row gap-[24px] items-stretch w-full">
            {/* Pending medications column */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-2 items-start overflow-y-auto p-4 md:p-5 rounded-2xl min-h-[300px] max-h-[600px]">
              <p className="font-poppins font-bold leading-6 text-base text-text-primary w-full shrink-0">
                Pending
              </p>

              {/* Morning medications */}
              <p className="font-poppins font-bold leading-6 text-sm text-text-primary w-full shrink-0 mt-2">
                Morning
              </p>
              <MedicineDue
                type="Due"
                medicationName="Paracetamol"
                dosage="2 pills"
              />
              <MedicineDue
                type="Due"
                medicationName="MedicineName1"
                dosage="10ml"
                additionalInfo="Before Meal"
              />

              {/* Afternoon medications */}
              <p className="font-poppins font-bold leading-6 text-sm text-text-primary w-full shrink-0 mt-2">
                Afternoon
              </p>
              <MedicineDue
                type="Due"
                medicationName="MedicineName2"
                dosage="1 pill"
                additionalInfo="After Meal"
                pillColor="#ffd5d5"
              />

              {/* Night medications */}
              <p className="font-poppins font-bold leading-6 text-sm text-text-primary w-full shrink-0 mt-2">
                Night
              </p>
              <MedicineDue
                type="Due"
                medicationName="MedicineName3"
                dosage="1 pill"
                additionalInfo="After Meal"
                pillColor="#d9ffaf"
              />
            </div>

            {/* Taken medications column */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-2 items-start overflow-y-auto p-4 md:p-5 rounded-2xl min-h-[300px] max-h-[600px]">
              <p className="font-poppins font-bold leading-6 text-base text-text-primary w-full shrink-0">
                Taken
              </p>

              {/* Medications grouped by time taken */}
              <p className="font-poppins font-bold leading-6 text-sm text-text-primary w-full shrink-0 mt-2">
                9:00 AM
              </p>
              <MedicineDue
                type="Taken"
                medicationName="Paracetamol"
                dosage="2 pills"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
