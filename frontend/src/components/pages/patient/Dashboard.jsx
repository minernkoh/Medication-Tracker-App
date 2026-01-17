/**
 * DashboardPage Component - Main page showing calendar, medications, and appointments
 *
 * @param {string} userName - User's name (default: "Sarah")
 * @param {string} mode - "Personal" or "Caregiver" (default: "Personal")
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  CalendarIcon,
  PlusIcon,
  PillIcon,
  ArrowRightIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDateButton,
  PieChart,
  EmptyState,
  PageHeader,
  GradientBackground,
  Button,
} from "../../ui";
import { AppointmentCard, MedicationSection } from "../../features";
import EditMedicationModal from "../../modals/EditMedicationModal";
import { useMedications } from "../../../contexts/MedicationsContext";
import { colors } from "../../../../tailwind.config.js";
import {
  hexToRgba,
  MONTHS,
  DAYS,
  getDaysInMonth,
  getStartOfWeek,
  formatMonthYear,
  formatShortMonthYear,
  formatDate,
  formatTime,
  timeToMinutes,
  textStyles,
} from "../../../utils";

function DashboardPage({ userName = "Sarah", mode = "Personal", onMenuClick }) {
  const navigate = useNavigate();
  const {
    medications,
    setMedications,
    handleMarkAsTaken,
    handleDeleteMedication,
  } = useMedications();

  // State: tracks selected date, menu item, and date picker
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 13)); // Jan 13, 2026
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date(2026, 0, 13))
  );

  // Modal state for editing taken-time entries
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Remove local medications state - using context instead

  // Sample appointments shared with AppointmentsPage to keep Upcoming card consistent
  const appointments = useMemo(
    () => [
      {
        id: 1,
        title: "Annual Physical Check Up",
        doctorName: "Dr Williams",
        location: "Singapore General Hospital",
        date: "2026-01-15",
        time: "14:00",
        notes: "Bring previous test results",
      },
      {
        id: 2,
        title: "Dental Cleaning",
        doctorName: "Dr Chen",
        location: "Smile Dental Clinic",
        date: "2026-01-22",
        time: "10:30",
        notes: "",
      },
      {
        id: 3,
        title: "Eye Examination",
        doctorName: "Dr Tan",
        location: "Vision Care Center",
        date: "2026-02-05",
        time: "09:00",
        notes: "Prescription glasses renewal",
      },
      {
        id: 4,
        title: "Follow-up Consultation",
        doctorName: "Dr Williams",
        location: "Singapore General Hospital",
        date: "2026-02-18",
        time: "15:30",
        notes: "",
      },
      {
        id: 5,
        title: "Blood Test",
        doctorName: "Dr Lee",
        location: "HealthFirst Lab",
        date: "2026-04-10",
        time: "08:00",
        notes: "Fasting required",
      },
      {
        id: 6,
        title: "Vaccination",
        doctorName: "Dr Williams",
        location: "Singapore General Hospital",
        date: "2026-06-20",
        time: "11:00",
        notes: "",
      },
    ],
    []
  );

  const upcomingAppointment = useMemo(() => {
    const now = new Date();
    const parsed = appointments
      .map((apt) => ({
        ...apt,
        dateTime: new Date(`${apt.date}T${apt.time}`),
      }))
      .sort((a, b) => a.dateTime - b.dateTime);

    const next = parsed.find((apt) => apt.dateTime >= now);
    return next || parsed[parsed.length - 1] || null;
  }, [appointments]);

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

  // Remove the local handler functions - using context handlers instead
  // The context handlers (handleMarkAsTaken, handleDeleteMedication) manage quantity sync
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

  // Get medications by status - transform to match MedicationSection format
  const pendingMedications = medications
    .filter((med) => !med.taken)
    .sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));

  const takenMedications = medications.filter((med) => med.taken);

  const stats = getMedicationStats();
  const hasMedications = medications.length > 0;

  const appointmentCardProps = upcomingAppointment
    ? {
        title: upcomingAppointment.title,
        date: `${formatDate(upcomingAppointment.date)}, ${formatTime(
          upcomingAppointment.time
        )}`,
        doctor: upcomingAppointment.doctorName,
        location: upcomingAppointment.location,
      }
    : {};

  // Handle navigation to MedicationPage
  const handleAddMedication = () => {
    navigate("/medications");
  };

  return (
    <div className="bg-background-default w-full relative">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area - positioned at top, starts after sidebar */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-6">
        <div className="w-full max-w-[67.5rem] mx-auto flex flex-col gap-6">
          {/* Header */}
          <PageHeader
            title={
              <p
                className={`${textStyles.heading["2xl"]} md:${textStyles.heading["3xl"]} leading-none text-text-primary`}
              >
                Good Morning, {userName}!
              </p>
            }
          >
            {!hasMedications && (
              <div
                className="relative group"
                title="Add your medications to track daily doses, manage supply, and stay on schedule. Click 'Add Medication' to get started."
              >
                <InfoIcon
                  size={20}
                  weight="regular"
                  className="cursor-help text-icon-secondary"
                />
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-64">
                  <div className="bg-text-primary text-text-onPrimary rounded-lg p-3 shadow-lg text-xs font-poppins">
                    <p className="font-semibold mb-1">Getting Started</p>
                    <p>
                      Add your medications to track daily doses, manage supply,
                      and stay on schedule. Click "Add Medication" to get
                      started.
                    </p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary"></div>
                  </div>
                </div>
              </div>
            )}
          </PageHeader>

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
                />
                <p
                  className={`${textStyles.heading.small} text-text-primary text-center`}
                >
                  {getDisplayMonthYear()}
                </p>
                {isDatePickerOpen ? (
                  <CaretUpIcon
                    size={16}
                    weight="bold"
                    className="text-primary"
                  />
                ) : (
                  <CaretDownIcon
                    size={16}
                    weight="regular"
                    className="text-text-secondary group-hover:text-primary"
                  />
                )}
              </button>

              {/* Date Picker Dropdown - using fixed positioning to escape overflow clipping */}
              {isDatePickerOpen && (
                <div
                  className="fixed left-1/2 -translate-x-1/2 border border-border-default rounded-2xl shadow-2xl z-[100] p-4 min-w-[20rem] bg-background-default"
                  style={{
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
                      <CaretLeftIcon
                        size={20}
                        weight="bold"
                        className="text-text-primary"
                      />
                    </button>
                    <div className="flex items-center gap-2">
                      {/* Month selector */}
                      <select
                        value={pickerMonth}
                        onChange={(e) =>
                          setPickerMonth(parseInt(e.target.value))
                        }
                        className={`${textStyles.heading.small} bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-center border-none outline-none text-text-primary`}
                        style={{ WebkitAppearance: "none" }}
                      >
                        {MONTHS.map((month, idx) => (
                          <option
                            key={month}
                            value={idx}
                            className="text-text-primary"
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
                        className={`${textStyles.heading.small} bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-center border-none outline-none text-text-primary`}
                        style={{ WebkitAppearance: "none" }}
                      >
                        {Array.from({ length: 20 }, (_, i) => 2020 + i).map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                              className="text-text-primary"
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
                      <CaretRightIcon
                        size={20}
                        weight="bold"
                        className="text-text-primary"
                      />
                    </button>
                  </div>

                  {/* Days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <div
                        key={day}
                        className={`${textStyles.caption.small} text-center py-1 font-medium`}
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
                                ? "font-bold shadow-md bg-primary text-text-onPrimary"
                                : isToday(cell)
                                ? "font-semibold ring-1 ring-primary/30 bg-primary-light text-primary"
                                : !cell.isCurrentMonth
                                ? "text-text-secondary/40 hover:bg-gray-100"
                                : "text-text-primary hover:bg-gray-100"
                            }
                          `}
                          style={
                            !cell.isCurrentMonth
                              ? { color: hexToRgba(colors.text.secondary, 0.4) }
                              : isToday(cell)
                              ? {
                                  borderColor: hexToRgba(
                                    colors.primary.DEFAULT,
                                    0.3
                                  ),
                                }
                              : undefined
                          }
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
                      className={`${textStyles.label.medium} px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 text-primary`}
                    >
                      Go to Today
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar dates - .map() creates a CalendarDateButton for each date */}
            <div className="flex gap-1 md:gap-2 h-[3.75rem] items-center shrink-0 w-full overflow-x-auto pb-2">
              <button
                onClick={goToPreviousWeek}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all duration-150"
              >
                <CaretLeftIcon
                  size={20}
                  weight="regular"
                  className="text-icon-primary"
                />
              </button>

              {calendarDates.map((item, idx) => {
                const itemIsToday =
                  item.fullDate.getDate() === today.getDate() &&
                  item.fullDate.getMonth() === today.getMonth() &&
                  item.fullDate.getFullYear() === today.getFullYear();
                return (
                  <CalendarDateButton
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
                  className="text-icon-primary"
                />
              </button>
            </div>
          </div>

          {/* Stats and appointment cards */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
            {/* Today's Progress card */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-4 p-5 rounded-2xl">
              <p
                className={`${textStyles.heading.small} text-text-primary w-full`}
              >
                {dateLabel ? `Progress · ${dateLabel}` : "Today's Progress"}
              </p>

              {/* Pie chart and stats */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                {/* Pie Chart */}
                <PieChart
                  taken={stats.taken}
                  notTaken={stats.notTaken}
                  size={140}
                />

                {/* Stats */}
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <div className="flex flex-col">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary`}
                      >
                        {stats.taken}
                      </p>
                      <p className={textStyles.body.small}>Taken</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "rgba(100,100,100,0.1)" }}
                    />
                    <div className="flex flex-col">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary`}
                      >
                        {stats.notTaken}
                      </p>
                      <p className={textStyles.body.small}>Pending</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
                    <div className="flex flex-col">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary`}
                      >
                        {stats.total}
                      </p>
                      <p className={textStyles.body.small}>Total Medications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointment card */}
            <AppointmentCard {...appointmentCardProps} />
          </div>

          {/* Medications section */}
          {hasMedications ? (
            <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
              {/* Pending medications column */}
              <div className="flex-1 min-h-[18.75rem]">
                <MedicationSection
                  variant="pending"
                  medications={pendingMedications}
                  onMarkAsTaken={handleMarkAsTaken}
                  showTimeGroups={true}
                  compact={true}
                  dateLabel={dateLabel}
                  onAddMedication={handleAddMedication}
                  onCardClick={handleAddMedication}
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
                  onCardClick={handleAddMedication}
                />
              </div>
            </div>
          ) : (
            /* Empty State - Prominent CTA when no medications */
            <div className="w-full">
              <div className="bg-background-default border-2 border-dashed border-border-default rounded-2xl p-8 md:p-12">
                <EmptyState
                  icon={
                    <PillIcon
                      size={80}
                      weight="regular"
                      className="text-icon-secondary"
                    />
                  }
                  title="No medications yet"
                  description="Start tracking your health journey by adding your first medication. You'll be able to track doses, manage supply, and stay on schedule."
                  size="lg"
                  action={
                    <div className="flex flex-col items-center gap-4">
                      <button
                        onClick={handleAddMedication}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90 active:scale-95 shadow-lg hover:shadow-xl bg-primary`}
                      >
                        <PlusIcon size={20} weight="bold" />
                        <span>Add Your First Medication</span>
                        <ArrowRightIcon size={20} weight="bold" />
                      </button>
                      <p className={`${textStyles.caption.small} max-w-md`}>
                        💡 <strong>Tip:</strong> You can also access the full
                        medication management page from the sidebar menu
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          )}
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

export default DashboardPage;
