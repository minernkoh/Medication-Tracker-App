/**
 * DashboardPage Component - Main page showing calendar, medications, and appointments
 *
 * @param {string} userName - User's name
 * @param {string} mode - "Personal" or "Caregiver" (default: "Personal")
 */

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, PillIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import {
  TodayAdherencePieChart,
  EmptyState,
  PageHeader,
  GradientBackground,
} from "../../ui";
import { AppointmentCard, MedicationSection, Calendar } from "../../features";
import EditMedicationModal from "../../modals/EditMedicationModal";
import { useMedications } from "../../../contexts/MedicationsContext";
import { useError } from "../../../contexts/ErrorContext";
import { api } from "../../../api";
import { limitConcurrency } from "../../../utils/requestUtils";
import {
  MONTHS,
  getStartOfWeek,
  formatDate,
  formatTime,
  timeToMinutes,
  toLocalIsoDay,
  textStyles,
  normalizeAppointment,
  splitMedicationsBySlot,
} from "../../../utils";

function DashboardPage({ userName = "", mode = "Personal" }) {
  const navigate = useNavigate();
  const {
    medications,
    markMedicationAsTaken,
    updateMedication,
    resetMedicationStatus,
    refreshMedications,
    isReadOnlyPatient,
  } = useMedications();
  const { showError } = useError();
  const [appointments, setAppointments] = useState([]);
  const [weekAdherence, setWeekAdherence] = useState({});

  // State: tracks selected date, menu item, and date picker
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleWeekStart, setVisibleWeekStart] = useState(
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
    const dateStr = toLocalIsoDay(selectedDate);
    refreshMedications(dateStr);
  }, [selectedDate, refreshMedications]);

  // Compute adherence across the visible week (calendar indicators)
  useEffect(() => {
    if (!visibleWeekStart) return;
    let isActive = true;

    const buildWeekAdherence = async () => {
      const days = Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(visibleWeekStart);
        d.setDate(d.getDate() + idx);
        return toLocalIsoDay(d);
      });

      const results = await limitConcurrency(
        days.map(async (dateStr) => {
          try {
            const meds = await api.medications.getForDate(dateStr);
            return [dateStr, Array.isArray(meds) ? meds : []];
          } catch {
            return [dateStr, []];
          }
        }),
        3, // Max 3 concurrent requests
      );

      const map = {};
      for (const [dateStr, meds] of results) {
        const split = splitMedicationsBySlot(meds);
        const taken = split.taken.length;
        const notTaken = split.pending.length;
        const total = taken + notTaken;
        map[dateStr] = total > 0 ? Math.round((taken / total) * 100) : 0;
      }

      if (!isActive) return;
      setWeekAdherence(map);
    };

    buildWeekAdherence();
    return () => {
      isActive = false;
    };
  }, [visibleWeekStart]);

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

  const calendarAppointments = useMemo(() => {
    // Calendar dots should only indicate scheduled appointments
    return appointments.filter((apt) => {
      const status = String(apt?.status || "Scheduled");
      return status === "Scheduled";
    });
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

  // Slot-level medication split for the selected day
  const splitMeds = useMemo(
    () => splitMedicationsBySlot(medications),
    [medications],
  );

  const pendingMedications = useMemo(() => {
    return [...(splitMeds.pending || [])].sort(
      (a, b) => timeToMinutes(a?.timeOfDay) - timeToMinutes(b?.timeOfDay),
    );
  }, [splitMeds.pending]);

  const takenMedications = splitMeds.taken || [];

  // Calculate medication stats for selected day (dose/slot level)
  const getMedicationStats = () => {
    const taken = takenMedications.length;
    const notTaken = pendingMedications.length;
    const total = taken + notTaken;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, notTaken, total, percentage };
  };

  // Remove the local handler functions - using context handlers instead
  // The context handlers (handleMarkAsTaken, handleDeleteMedication) manage quantity sync
  const handleEditMedication = (medication) => {
    if (isReadOnlyPatient) return;
    setEditingMedication(medication);
    const realMed = medication.sourceMedication || medication;
    const medWithContext = {
      ...realMed,
      slot: medication.slot || realMed.slot,
      takenDate: toLocalIsoDay(selectedDate),
      takenTime: medication.takenTime || realMed.takenTime,
    };
    setEditingMedication(medWithContext);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (isReadOnlyPatient) return;
      await updateMedication(updatedMedication.id, {
        takenTime: updatedMedication.takenTime,
      });

      if (updatedMedication?.takenDate && updatedMedication?.status === "taken") {
        const targetDate = updatedMedication.takenDate;
        const viewDate = toLocalIsoDay(selectedDate);
        const timeSlot =
          updatedMedication.slot ||
          updatedMedication.timeOfDay ||
          updatedMedication.timesOfDay?.[0];

        if (targetDate !== viewDate) {
          await resetMedicationStatus(updatedMedication.id, viewDate, timeSlot);
        }
        await markMedicationAsTaken(
          updatedMedication.id,
          updatedMedication.takenTime,
          targetDate,
          timeSlot,
        );
      } else {
        await updateMedication(updatedMedication.id, updatedMedication);
      }

      setShowEditModal(false);
      setEditingMedication(null);
    } catch {
      // Errors are surfaced via global error handler
    }
  };

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
            appointments={calendarAppointments}
            onWeekChange={setVisibleWeekStart}
            adherence={weekAdherence}
          />

          {/* Stats and appointment cards */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 items-start w-full">
            {/* Today's Progress card */}
            <div className="bg-background-default border border-border-default flex flex-[1_0_0] flex-col gap-5 p-6 rounded-2xl h-full self-stretch">
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
              <div className="flex-1 flex items-center justify-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                  {/* Pie Chart */}
                  <div className="flex-shrink-0">
                    <TodayAdherencePieChart
                      taken={stats.taken}
                      notTaken={stats.notTaken}
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
                          Total Doses
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointment card */}
            <AppointmentCard
              {...appointmentCardProps}
              isReadOnly={isReadOnlyPatient}
            />
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
                            med?.sourceMedication || med,
                            null,
                            toLocalIsoDay(selectedDate),
                            med?.slot || null,
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
                            med?.sourceMedication || med,
                            toLocalIsoDay(selectedDate),
                            med?.slot || null,
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
                  description={
                    isReadOnlyPatient
                      ? "No medications have been added for you yet. Once your caregiver adds them, they’ll show up here."
                      : "Start tracking your health journey by adding your first medication. You'll be able to track doses, manage supply, and stay on schedule."
                  }
                  size="lg"
                  action={
                    isReadOnlyPatient ? null : (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={handleAddMedication}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90 active:scale-95 shadow-sm bg-primary`}
                        >
                          <PlusIcon size={20} weight="bold" />
                          <span>Add Your First Medication</span>
                        </button>
                        <p
                          className={`${textStyles.caption.small} max-w-md text-text-secondary`}
                        >
                          💡 <strong>Tip:</strong> You can also access the full
                          medication management page from the sidebar menu
                        </p>
                      </div>
                    )
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
