/**
 * DashboardPage Component - Main page showing calendar, medications, and appointments
 *
 * @param {string} userName - User's name
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
import { AppointmentCard, MedicationSection, Calendar } from "../../features";
import EditMedicationModal from "../../modals/EditMedicationModal";
import { useMedications } from "../../../contexts/MedicationsContext";
import { useError } from "../../../contexts/ErrorContext";
import { colors } from "../../../../tailwind.config.js";
import { api } from "../../../api";
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
  normalizeAppointment,
  filterMedsByStatus,
} from "../../../utils";

function DashboardPage({ userName = "", mode = "Personal", onMenuClick }) {
  const navigate = useNavigate();
  const {
    medications,
    markMedicationAsTaken,
    deleteMedication,
    updateMedication,
    resetMedicationStatus,
    refreshMedications,
    isReadOnlyPatient,
  } = useMedications();
  const { showError } = useError();
  const [appointments, setAppointments] = useState([]);

  // State: tracks selected date, menu item, and date picker
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(today),
  );

  // Modal state for editing taken-time entries
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Remove local medications state - using context instead

  useEffect(() => {
    let isMounted = true;
    const loadAppointments = async () => {
      try {
        const data = await api.appointments.getAll();
        if (!isMounted) return;
        setAppointments(
          (Array.isArray(data) ? data : [])
            .map(normalizeAppointment)
            .filter(Boolean),
        );
      } catch (error) {
        if (isMounted) {
          showError(error.message || "Unable to load appointments");
        }
      }
    };
    loadAppointments();
    return () => {
      isMounted = false;
    };
  }, [showError]);

  // Refresh medications when selected date changes
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    refreshMedications(dateStr);
  }, [selectedDate, refreshMedications]);

  const upcomingAppointment = useMemo(() => {
    const now = new Date();
    const parsed = appointments
      .map((apt) => ({
        ...apt,
        dateTime: apt.time
          ? new Date(`${apt.date}T${apt.time}`)
          : new Date(apt.date),
      }))
      .filter((apt) => !Number.isNaN(apt.dateTime.getTime()))
      .sort((a, b) => a.dateTime - b.dateTime);

    const next = parsed.find((apt) => apt.dateTime >= now);
    return next || parsed[parsed.length - 1] || null;
  }, [appointments]);

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const isSelectedDateToday = () => {
    const todayLocal = new Date();
    return (
      selectedDate.getDate() === todayLocal.getDate() &&
      selectedDate.getMonth() === todayLocal.getMonth() &&
      selectedDate.getFullYear() === todayLocal.getFullYear()
    );
  };

  // Format selected date for display
  const formatSelectedDateForLabel = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[selectedDate.getDay()];
    const monthName = MONTHS[selectedDate.getMonth()].slice(0, 3);
    const date = selectedDate.getDate();
    return `${dayName}, ${monthName} ${date}`;
  };

  const dateLabel = isSelectedDateToday() ? null : formatSelectedDateForLabel();

  // Calculate medication stats for today
  const getMedicationStats = () => {
    const taken = filterMedsByStatus(medications, "taken").length;
    // Include medications with status "pending" OR "supply" that have a scheduled time
    const notTaken = medications.filter((med) => {
      const isPending = med.status === "pending";
      const isSupplyWithSchedule =
        med.status === "supply" &&
        (med.timeOfDay || (med.timesOfDay && med.timesOfDay.length > 0));
      return isPending || isSupplyWithSchedule;
    }).length;
    const total = taken + notTaken;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, notTaken, total, percentage };
  };

  // Remove the local handler functions - using context handlers instead
  // The context handlers (handleMarkAsTaken, handleDeleteMedication) manage quantity sync
  const handleEditMedication = (medication) => {
    if (isReadOnlyPatient) return;
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (isReadOnlyPatient) return;
      await updateMedication(updatedMedication.id, {
        takenTime: updatedMedication.takenTime,
      });
      setShowEditModal(false);
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

  // Get medications by status - transform to match MedicationSection format
  // Include medications with status "pending" OR "supply" that have a scheduled time
  const pendingMedications = medications
    .filter((med) => {
      const isPending = med.status === "pending";
      const isSupplyWithSchedule =
        med.status === "supply" &&
        (med.timeOfDay || (med.timesOfDay && med.timesOfDay.length > 0));
      return isPending || isSupplyWithSchedule;
    })
    .sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));

  const takenMedications = filterMedsByStatus(medications, "taken");

  const stats = getMedicationStats();
  const hasMedications = medications.length > 0;

  const appointmentCardProps = upcomingAppointment
    ? {
        title: upcomingAppointment.title,
        date: `${formatDate(upcomingAppointment.date)}, ${formatTime(
          upcomingAppointment.time,
        )}`,
        doctor: upcomingAppointment.doctorName,
        location: upcomingAppointment.location,
      }
    : {
        title: "No upcoming appointments",
        date: "Schedule one to stay on track",
        doctor: "",
        location: "",
      };

  // Handle navigation to MedicationPage
  const handleAddMedication = () => {
    if (isReadOnlyPatient) return;
    navigate("/medications");
  };

  return (
    <div className="bg-background-default w-full relative">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area - positioned at top, starts after sidebar */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
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
          />

          {/* Calendar section */}
          <Calendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            appointments={appointments}
            adherence={{
              [selectedDate.toISOString().split("T")[0]]: stats.percentage,
            }}
          />

          {/* Stats and appointment cards */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
            {/* Today's Progress card */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-5 p-6 rounded-2xl">
              <div className="flex items-center justify-between w-full">
                <p className={`${textStyles.heading.small} text-text-primary`}>
                  {dateLabel ? `Progress · ${dateLabel}` : "Today's Progress"}
                </p>
                {stats.total > 0 && (
                  <span
                    className={`${textStyles.label.small} text-text-secondary bg-background-hover px-3 py-1 rounded-full`}
                  >
                    {stats.percentage}% complete
                  </span>
                )}
              </div>

              {/* Pie chart and stats */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 w-full">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                  <PieChart
                    taken={stats.taken}
                    notTaken={stats.notTaken}
                    size={140}
                  />
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-4 items-start flex-1 sm:max-w-[200px]">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-4 h-4 rounded-full bg-success flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary leading-none`}
                      >
                        {stats.taken}
                      </p>
                      <p
                        className={`${textStyles.body.small} text-text-secondary mt-0.5`}
                      >
                        Taken
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "rgba(100,100,100,0.1)" }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary leading-none`}
                      >
                        {stats.notTaken}
                      </p>
                      <p
                        className={`${textStyles.body.small} text-text-secondary mt-0.5`}
                      >
                        Pending
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full pt-3 border-t border-border-subtle">
                    <div className="w-4 h-4 flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p
                        className={`${textStyles.heading.medium} text-text-primary leading-none`}
                      >
                        {stats.total}
                      </p>
                      <p
                        className={`${textStyles.body.small} text-text-secondary mt-0.5`}
                      >
                        Total Medications
                      </p>
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
              <div className="flex-1 h-[24rem] max-h-[24rem] flex flex-col min-h-0">
                <MedicationSection
                  variant="pending"
                  medications={pendingMedications}
                  onMarkAsTaken={
                    isReadOnlyPatient
                      ? undefined
                      : (med) =>
                          markMedicationAsTaken(
                            med,
                            null,
                            selectedDate.toISOString().split("T")[0],
                          )
                  }
                  showTimeGroups={true}
                  compact={true}
                  dateLabel={dateLabel}
                  onAddMedication={
                    isReadOnlyPatient ? undefined : handleAddMedication
                  }
                  onCardClick={
                    isReadOnlyPatient ? undefined : handleAddMedication
                  }
                />
              </div>

              {/* Taken medications column */}
              <div className="flex-1 h-[24rem] max-h-[24rem] flex flex-col min-h-0">
                <MedicationSection
                  variant="taken"
                  medications={takenMedications}
                  onEdit={isReadOnlyPatient ? undefined : handleEditMedication}
                  onDelete={
                    isReadOnlyPatient
                      ? undefined
                      : (med) =>
                          resetMedicationStatus(
                            med,
                            selectedDate.toISOString().split("T")[0],
                          )
                  }
                  showTimeGroups={true}
                  compact={true}
                  dateLabel={dateLabel}
                  onCardClick={
                    isReadOnlyPatient ? undefined : handleAddMedication
                  }
                />
              </div>
            </div>
          ) : (
            /* Empty State - Prominent CTA when no medications */
            <div className="w-full">
              <div className="bg-background-default border border-border-default rounded-2xl">
                <EmptyState
                  icon={
                    <PillIcon
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
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90 active:scale-95 shadow-sm bg-primary`}
                      >
                        <PlusIcon size={20} weight="bold" />
                        <span>Add Your First Medication</span>
                        <ArrowRightIcon size={20} weight="bold" />
                      </button>
                      <p
                        className={`${textStyles.caption.small} max-w-md text-text-secondary`}
                      >
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
