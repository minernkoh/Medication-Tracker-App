/**
 * Dashboard Component - Main page showing calendar, medications, and appointments
 *
 * @param {string} userName - User's name (default: "Sarah")
 * @param {string} mode - "Personal" or "Caregiver" (default: "Personal")
 */

import React, { useState, useRef, useEffect } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../utils/colors";
import { useNavigate } from "react-router-dom";
import {
  CalendarDate,
  AppointmentCard,
  PieChart,
  MedicationSection,
} from "../../ui";
import EditMedicationModal from "../../modals/EditMedicationModal";

// Helper functions for calendar
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
};

const formatMonthYear = (month, year) => `${MONTHS[month]} ${year}`;

const formatShortMonthYear = (month, year) =>
  `${MONTHS[month].slice(0, 3)} ${year}`;

function Dashboard({ userName = "Sarah", mode = "Personal", onMenuClick }) {
  // State: tracks selected date, menu item, and date picker
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 13)); // Jan 13, 2026
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date(2026, 0, 13))
  );

  // Modal state for editing taken-time entries
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // State: track medication status (taken/not taken)
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Paracetamol",
      dosage: "2 pills",
      // FIXED: Changed from 'time' string to 'timeOfDay' in 24-hour format for consistency
      timeOfDay: "08:00",
      // FIXED: Added quantity field to sync with EditMedicationModal
      quantity: "50 pills",
      taken: true,
      takenTime: "9:00 AM",
      additionalInfo: "For headache",
    },
    {
      id: 2,
      name: "MedicineName1",
      dosage: "10ml",
      // FIXED: Changed from 'time' string to 'timeOfDay' in 24-hour format for consistency
      timeOfDay: "08:00",
      // FIXED: Added quantity field to sync with EditMedicationModal
      quantity: "100ml",
      additionalInfo: "Before Meal",
      taken: false,
    },
    {
      id: 3,
      name: "MedicineName2",
      dosage: "1 pill",
      // FIXED: Changed from 'time' string to 'timeOfDay' in 24-hour format for consistency
      timeOfDay: "13:00",
      // FIXED: Added quantity field to sync with EditMedicationModal
      quantity: "30 pills",
      additionalInfo: "After Meal",
      pillColor: "#ffd5d5",
      taken: false,
    },
    {
      id: 4,
      name: "MedicineName3",
      dosage: "1 pill",
      // FIXED: Changed from 'time' string to 'timeOfDay' in 24-hour format for consistency
      timeOfDay: "20:00",
      // FIXED: Added quantity field to sync with EditMedicationModal
      quantity: "45 pills",
      additionalInfo: "After Meal",
      pillColor: "#d9ffaf",
      taken: false,
    },
  ]);

  // Helper: convert HH:MM to minutes for sorting
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
      return Number.MAX_SAFE_INTEGER;
    const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER;
    return h * 60 + m;
  };

  // Handle menu navigation - use parent callback if provided (optional, React Router handles navigation)
  const handleMenuClick = (menu) => {
    if (onMenuClick) {
      onMenuClick(menu);
    }
  };
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(0); // January
  const [pickerYear, setPickerYear] = useState(2026);

  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate calendar week dates
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push({
        day: DAYS[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }
    return dates;
  };

  const calendarDates = getWeekDates();

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Handle date selection from week view
  const handleDateClick = (item) => {
    setSelectedDate(item.fullDate);
  };

  // Check if a date is selected
  const isDateSelected = (item) => {
    return (
      selectedDate.getDate() === item.date &&
      selectedDate.getMonth() === item.month &&
      selectedDate.getFullYear() === item.year
    );
  };

  // Date picker navigation
  const goToPrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  // Generate calendar grid for date picker
  const getCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
    const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0

    const grid = [];
    let dayCount = 1;

    // Previous month's trailing days
    const prevMonth = pickerMonth === 0 ? 11 : pickerMonth - 1;
    const prevYear = pickerMonth === 0 ? pickerYear - 1 : pickerYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const cellIndex = i * 7 + j;
        if (cellIndex < adjustedFirstDay) {
          // Previous month
          week.push({
            day: daysInPrevMonth - adjustedFirstDay + cellIndex + 1,
            isCurrentMonth: false,
            month: prevMonth,
            year: prevYear,
          });
        } else if (dayCount <= daysInMonth) {
          week.push({
            day: dayCount,
            isCurrentMonth: true,
            month: pickerMonth,
            year: pickerYear,
          });
          dayCount++;
        } else {
          // Next month
          const nextMonth = pickerMonth === 11 ? 0 : pickerMonth + 1;
          const nextYear = pickerMonth === 11 ? pickerYear + 1 : pickerYear;
          week.push({
            day: dayCount - daysInMonth,
            isCurrentMonth: false,
            month: nextMonth,
            year: nextYear,
          });
          dayCount++;
        }
      }
      grid.push(week);
      if (dayCount > daysInMonth && i >= 3) break;
    }
    return grid;
  };

  // Handle date selection from picker
  const handlePickerDateSelect = (cell) => {
    const newDate = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(newDate);
    setCurrentWeekStart(getStartOfWeek(newDate));
    setIsDatePickerOpen(false);
  };

  // Check if a picker cell is selected
  const isPickerDateSelected = (cell) => {
    return (
      selectedDate.getDate() === cell.day &&
      selectedDate.getMonth() === cell.month &&
      selectedDate.getFullYear() === cell.year
    );
  };

  // Check if a picker cell is today
  const isToday = (cell) => {
    return (
      today.getDate() === cell.day &&
      today.getMonth() === cell.month &&
      today.getFullYear() === cell.year
    );
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(today);
    setCurrentWeekStart(getStartOfWeek(today));
    setPickerMonth(today.getMonth());
    setPickerYear(today.getFullYear());
    setIsDatePickerOpen(false);
  };

  // Get display month/year for header (based on week being viewed)
  const getDisplayMonthYear = () => {
    const midWeek = new Date(currentWeekStart);
    midWeek.setDate(currentWeekStart.getDate() + 3);
    return formatShortMonthYear(midWeek.getMonth(), midWeek.getFullYear());
  };

  // Check if selected date is today
  const isSelectedDateToday = () => {
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Format selected date for display (e.g., "Mon, Jan 13")
  const formatSelectedDate = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[selectedDate.getDay()];
    const monthName = MONTHS[selectedDate.getMonth()].slice(0, 3);
    const date = selectedDate.getDate();
    return `${dayName}, ${monthName} ${date}`;
  };

  // Get the date label for titles (null if today, formatted date otherwise)
  const getDateLabel = () => {
    return isSelectedDateToday() ? null : formatSelectedDate();
  };

  const dateLabel = getDateLabel();

  // Calculate medication stats for today
  const getMedicationStats = () => {
    const taken = medications.filter((med) => med.taken).length;
    const notTaken = medications.filter((med) => !med.taken).length;
    const total = medications.length;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, notTaken, total, percentage };
  };

  // Handle marking medication as taken
  const handleMarkAsTaken = (medicationId) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId ? { ...med, taken: true } : med
      )
    );
  };

  // Handle editing taken-time only for taken medications
  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = (updatedMedication) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === updatedMedication.id
          ? { ...med, takenTime: updatedMedication.takenTime }
          : med
      )
    );
    setShowEditModal(false);
    setEditingMedication(null);
  };

  // FIXED: Handle deleting a medication from taken section
  // Moves medication back to pending status instead of permanently deleting
  // When user clicks delete on "Taken Today" section, this restores it to "Pending Today"
  const handleDeleteMedication = (medicationId) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId ? { ...med, taken: false } : med
      )
    );
  };

  // Get medications by status - transform to match MedicationSection format
  const pendingMedications = medications
    .filter((med) => !med.taken)
    .sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));

  const takenMedications = medications.filter((med) => med.taken);

  const stats = getMedicationStats();

  return (
    <div className="bg-background-default w-full min-h-screen overflow-x-hidden flex">
      {/* Gradient background decoration */}
      <div className="hidden md:block absolute h-[85.6875rem] left-[4.3125rem] top-[-11rem] w-[88.3125rem] pointer-events-none z-0">
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

      {/* Main content area - positioned at top, starts after sidebar */}
      <div className="relative flex flex-col gap-lg items-start pt-10 px-4 md:px-0 w-full flex-1 z-10">
        <div className="w-full max-w-[67.5rem] mx-auto">
          {/* Header */}
          <p className="font-poppins font-bold leading-none text-2xl md:text-3xl text-text-primary w-full">
            Good Morning, {userName}!
          </p>

          {/* Calendar section */}
          <div className="bg-background-default border border-border-default flex flex-col gap-2 items-center p-4 rounded-2xl shrink-0 w-full relative overflow-visible">
            {/* Month/Year selector button */}
            <div className="relative w-full" ref={datePickerRef}>
              <button
                onClick={() => {
                  setPickerMonth(selectedDate.getMonth());
                  setPickerYear(selectedDate.getFullYear());
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="flex items-center justify-center gap-2 w-full group hover:bg-background-hover rounded-lg py-1 px-2 transition-all duration-200"
              >
                <CalendarIcon
                  size={18}
                  weight="regular"
                  className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  color={colors.primary.DEFAULT}
                />
                <p className="font-poppins font-bold leading-6 text-base text-text-primary text-center">
                  {getDisplayMonthYear()}
                </p>
                {isDatePickerOpen ? (
                  <CaretUpIcon
                    size={16}
                    weight="bold"
                    color={colors.primary.DEFAULT}
                  />
                ) : (
                  <CaretDownIcon
                    size={16}
                    weight="regular"
                    color={colors.text.secondary}
                    className="group-hover:text-primary"
                  />
                )}
              </button>

              {/* Date Picker Dropdown - using fixed positioning to escape overflow clipping */}
              {isDatePickerOpen && (
                <div
                  className="fixed left-1/2 -translate-x-1/2 border border-border-default rounded-2xl shadow-2xl z-[100] p-4 min-w-[20rem]"
                  style={{
                    backgroundColor: "#ffffff",
                    top: datePickerRef.current
                      ? datePickerRef.current.getBoundingClientRect().bottom + 8
                      : "auto",
                  }}
                >
                  {/* Picker Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <CaretLeftIcon size={20} weight="bold" color="#181818" />
                    </button>
                    <div className="flex items-center gap-2">
                      {/* Month selector */}
                      <select
                        value={pickerMonth}
                        onChange={(e) =>
                          setPickerMonth(parseInt(e.target.value))
                        }
                        className="font-poppins font-bold text-base bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-center border-none outline-none"
                        style={{ WebkitAppearance: "none", color: "#181818" }}
                      >
                        {MONTHS.map((month, idx) => (
                          <option
                            key={month}
                            value={idx}
                            style={{ color: "#181818" }}
                          >
                            {month}
                          </option>
                        ))}
                      </select>
                      {/* Year selector */}
                      <select
                        value={pickerYear}
                        onChange={(e) =>
                          setPickerYear(parseInt(e.target.value))
                        }
                        className="font-poppins font-bold text-base bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-center border-none outline-none"
                        style={{ WebkitAppearance: "none", color: "#181818" }}
                      >
                        {Array.from({ length: 20 }, (_, i) => 2020 + i).map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                              style={{ color: "#181818" }}
                            >
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <CaretRightIcon size={20} weight="bold" color="#181818" />
                    </button>
                  </div>

                  {/* Days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <div
                        key={day}
                        className="font-poppins text-xs text-center py-1 font-medium"
                        style={{ color: "#646464" }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarGrid()
                      .flat()
                      .map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePickerDateSelect(cell)}
                          className={`
                            w-9 h-9 rounded-lg font-poppins text-sm transition-all duration-150
                            flex items-center justify-center
                            ${
                              isPickerDateSelected(cell)
                                ? "font-bold shadow-md"
                                : isToday(cell)
                                ? "font-semibold ring-1"
                                : "hover:bg-gray-100"
                            }
                          `}
                          style={{
                            color: isPickerDateSelected(cell)
                              ? "#ffffff"
                              : isToday(cell)
                              ? "#155dfc"
                              : !cell.isCurrentMonth
                              ? "#64646466"
                              : "#181818",
                            backgroundColor: isPickerDateSelected(cell)
                              ? "#155dfc"
                              : isToday(cell)
                              ? "#e8f0fe"
                              : "transparent",
                            borderColor: isToday(cell)
                              ? "rgba(21, 93, 252, 0.3)"
                              : "transparent",
                          }}
                        >
                          {cell.day}
                        </button>
                      ))}
                  </div>

                  {/* Footer with Today button */}
                  <div
                    className="mt-4 pt-3 flex justify-center"
                    style={{ borderTop: "1px solid rgba(100,100,100,0.2)" }}
                  >
                    <button
                      onClick={goToToday}
                      className="font-poppins text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150"
                      style={{ color: "#155dfc" }}
                    >
                      Go to Today
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar dates - .map() creates a CalendarDate for each date */}
            <div className="flex gap-1 md:gap-2 h-[3.75rem] items-center shrink-0 w-full overflow-x-auto pb-2">
              <button
                onClick={goToPreviousWeek}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all duration-150"
              >
                <CaretLeftIcon
                  size={20}
                  weight="regular"
                  color={colors.icon.primary}
                />
              </button>

              {calendarDates.map((item, idx) => {
                const itemIsToday =
                  item.fullDate.getDate() === today.getDate() &&
                  item.fullDate.getMonth() === today.getMonth() &&
                  item.fullDate.getFullYear() === today.getFullYear();
                return (
                  <CalendarDate
                    key={`${item.fullDate.toISOString()}-${idx}`}
                    day={item.day}
                    date={item.date}
                    isSelected={isDateSelected(item)}
                    isToday={itemIsToday}
                    onClick={() => handleDateClick(item)}
                  />
                );
              })}

              <button
                onClick={goToNextWeek}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all duration-150"
              >
                <CaretRightIcon
                  size={20}
                  weight="regular"
                  color={colors.icon.primary}
                />
              </button>
            </div>
          </div>

          {/* Stats and appointment cards */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch w-full mt-6">
            {/* Today's Progress card */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-4 p-5 rounded-2xl">
              <p className="font-poppins font-bold leading-6 text-base text-text-primary w-full">
                {dateLabel ? `Progress · ${dateLabel}` : "Today's Progress"}
              </p>

              {/* Pie chart and stats */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
                {/* Pie Chart */}
                <PieChart
                  taken={stats.taken}
                  notTaken={stats.notTaken}
                  size={140}
                />

                {/* Stats */}
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    />
                    <div className="flex flex-col">
                      <p className="font-poppins font-bold text-lg text-text-primary">
                        {stats.taken}
                      </p>
                      <p className="font-poppins text-sm text-text-secondary">
                        Taken
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.border.subtle }}
                    />
                    <div className="flex flex-col">
                      <p className="font-poppins font-bold text-lg text-text-primary">
                        {stats.notTaken}
                      </p>
                      <p className="font-poppins text-sm text-text-secondary">
                        Pending
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 pt-2"
                    style={{ borderTop: `1px solid ${colors.border.subtle}` }}
                  >
                    <div className="flex flex-col">
                      <p className="font-poppins font-bold text-lg text-text-primary">
                        {stats.total}
                      </p>
                      <p className="font-poppins text-sm text-text-secondary">
                        Total Medications
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointment card */}
            <AppointmentCard />
          </div>

          {/* Medications section */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch w-full mt-6">
            {/* Pending medications column */}
            <div className="flex-1 min-h-[18.75rem]">
              <MedicationSection
                variant="pending"
                medications={pendingMedications}
                onMarkAsTaken={handleMarkAsTaken}
                showTimeGroups={true}
                compact={true}
                dateLabel={dateLabel}
              />
            </div>

            {/* Taken medications column */}
            <div className="flex-1 min-h-[18.75rem]">
              <MedicationSection
                variant="taken"
                medications={takenMedications}
                onEdit={handleEditMedication}
                onDelete={handleDeleteMedication}
                showTimeGroups={true}
                compact={true}
                dateLabel={dateLabel}
              />
            </div>
          </div>
        </div>
      </div>

      {showEditModal && editingMedication && (
        <EditMedicationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMedication(null);
          }}
          onSave={handleSaveEditedMedication}
          medication={editingMedication}
          mode={mode}
        />
      )}
    </div>
  );
}

export default Dashboard;
