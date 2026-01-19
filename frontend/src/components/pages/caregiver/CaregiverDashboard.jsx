/**
 * CaregiverDashboard Component - Overview dashboard for caregivers
 * Shows all patients at a glance with their medication status and upcoming appointments
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PillIcon,
  CalendarCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { to12HourDisplay, timeToMinutes } from "../../../utils";
import { GradientBackground, PieChart, PageHeader } from "../../ui";
import { Calendar } from "../../features";
import { colors } from "../../../../tailwind.config.js";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";

const PATIENT_COLORS = [
  colors.patient.pink,
  colors.patient.blue,
  colors.patient.green,
  colors.patient.amber,
  colors.patient.purple,
];

const getInitials = (name = "") => {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(" ");
  return parts.length === 1
    ? parts[0].charAt(0).toUpperCase()
    : `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const getPatientColor = (patient, index) => {
  if (patient?.color) return patient.color;
  if (typeof index === "number") {
    return PATIENT_COLORS[index % PATIENT_COLORS.length];
  }
  return colors.patient.blue;
};

const normalizePatient = (patient, index) => {
  if (!patient) return null;
  const name = patient.nickname
    ? `${patient.nickname} (${patient.name})`
    : patient.name;
  return {
    ...patient,
    id: patient.id || patient._id,
    name,
    initials: patient.initials || getInitials(patient.nickname || patient.name),
    color: getPatientColor(patient, index),
  };
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
};

const CaregiverDashboard = ({ userName = "" }) => {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const { showError } = useError();
  const todayStr = selectedDate.toISOString().split("T")[0];

  const loadDashboardData = useCallback(async () => {
    try {
      const [patientsData, appointmentsData] = await Promise.all([
        api.caregiver.getPatients(),
        api.caregiver.getAppointments(),
      ]);
      setPatients(
        (Array.isArray(patientsData) ? patientsData : []).map(
          (patient, index) => normalizePatient(patient, index),
        ),
      );
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      showError(error.message || "Unable to load patients");
    }
  }, [showError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (patients.length === 0) {
      setScheduleItems([]);
      return;
    }

    const buildSchedule = async () => {
      setIsScheduleLoading(true);
      try {
        const data = await api.caregiver.getSchedule(todayStr);
        setScheduleItems(Array.isArray(data) ? data : []);
      } catch (error) {
        showError(error.message || "Unable to load schedule");
      } finally {
        setIsScheduleLoading(false);
      }
    };

    buildSchedule();
  }, [patients.length, showError, todayStr]);

  // Calculate totals
  const totalPatients = patients.length;
  
  // Use scheduleItems for more reactive adherence stats
  const totalMedicationsDate = scheduleItems.length;
  const totalMedicationsTakenDate = scheduleItems.filter(i => i.status === "taken").length;
  
  const totalLowSupply = patients.reduce((sum, p) => sum + (p.alerts || 0), 0);
  
  const upcomingAppointments = appointments.filter((appt) => {
    const status = String(appt.status || "").toLowerCase();
    // Only count active/upcoming ones
    if (status === "completed" || status === "cancelled" || status === "missed") {
      return false;
    }
    
    const date = new Date(appt.date);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }).length;

  const timeSortValue = (time) => {
    const key = String(time || "").toLowerCase();
    if (key === "morning") return 8 * 60;
    if (key === "afternoon") return 13 * 60;
    if (key === "night") return 20 * 60;
    if (/^\d{2}:\d{2}$/.test(key)) return timeToMinutes(key);
    return Number.MAX_SAFE_INTEGER;
  };

  const formatScheduleTime = (time) => {
    const key = String(time || "").toLowerCase();
    if (key === "morning" || key === "afternoon" || key === "night") {
      return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    }
    if (/^\d{2}:\d{2}$/.test(key)) return to12HourDisplay(key);
    return "Unscheduled";
  };

  const filteredScheduleItems = scheduleItems
    .filter(
      (item) => scheduleFilter === "all" || item.patientId === scheduleFilter,
    )
    .sort((a, b) => timeSortValue(a.time) - timeSortValue(b.time));

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Patient card component
  const PatientCard = ({ patient }) => {
    const pStats = scheduleItems.filter(i => i.patientId === patient.id);
    const total = pStats.length;
    const taken = pStats.filter(i => i.status === "taken").length;
    const completionPercent = total > 0 ? Math.round((taken / total) * 100) : 0;

    return (
      <div
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="bg-background-default border border-border-default rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-secondary/30 transition-all duration-200 group"
      >
        {/* Patient header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-poppins font-bold text-lg"
              style={{ backgroundColor: patient.color }}
            >
              {patient.initials}
            </div>
            <div>
              <h3 className="font-poppins font-bold text-text-primary">
                {patient.name}
              </h3>
              <p className="font-poppins text-xs text-text-secondary">
                {total > 0
                  ? `${taken}/${total} medications`
                  : "No medications scheduled"}
              </p>
            </div>
          </div>
          {patient.alerts > 0 && (
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
              <WarningCircleIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-semibold">
                {patient.alerts}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-poppins text-xs text-text-secondary">
              Adherence Progress
            </span>
            <span
              className="font-poppins text-xs font-semibold"
              style={{
                color:
                  completionPercent === 100
                    ? colors.success.DEFAULT
                    : modeHexColor,
              }}
            >
              {total > 0 ? `${completionPercent}%` : "—"}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionPercent}%`,
                backgroundColor:
                  completionPercent === 100
                    ? colors.success.DEFAULT
                    : modeHexColor,
              }}
            />
          </div>
        </div>

        {/* Quick info */}
        <div className="flex gap-3">
          {patient.nextMedication && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg flex-1">
              <ClockIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-medium">
                Next: {patient.nextMedication}
              </span>
            </div>
          )}
          {!patient.nextMedication &&
            patient.medicationsTaken === patient.medicationsTotal && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg flex-1">
                <CheckCircleIcon size={14} weight="fill" />
                <span className="font-poppins text-xs font-medium">
                  All done today!
                </span>
              </div>
            )}
        </div>

        {/* Upcoming appointment */}
        {patient.nextAppointment && (
          <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheckIcon
                size={16}
                weight="regular"
                color={colors.text.secondary}
              />
              <span className="font-poppins text-xs text-text-secondary">
                {patient.nextAppointment.title} • {patient.nextAppointment.date}
              </span>
            </div>
            <CaretRightIcon
              size={16}
              color={colors.text.secondary}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background-default w-full overflow-x-hidden relative">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
        <div className="w-full max-w-[67.5rem] mx-auto flex flex-col gap-6">
          {/* Header */}
          <PageHeader
            title={`Good ${getTimeGreeting()}, ${userName}!`}
            description="Here's an overview of your patients"
          />

          {/* Calendar section */}
          <Calendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's adherence */}
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="bg-background-default border border-border-default rounded-2xl p-4 text-left hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
              aria-label="View adherence by patient"
            >
              <div className="flex items-center justify-center gap-4">
                <PieChart
                  taken={totalMedicationsTakenDate}
                  notTaken={Math.max(
                    totalMedicationsDate - totalMedicationsTakenDate,
                    0,
                  )}
                  size={120}
                />
              </div>
            </button>

            {/* Low supply */}
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="bg-background-default border border-border-default rounded-2xl p-4 text-left hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
              aria-label="View low supply alerts by patient"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-50">
                <WarningCircleIcon
                  size={20}
                  weight="fill"
                  color={colors.danger.DEFAULT}
                />
              </div>
              <p className="font-poppins font-bold text-2xl text-text-primary">
                {totalLowSupply}
              </p>
              <p className="font-poppins text-sm text-text-secondary">
                Low supply alerts
              </p>
            </button>

            {/* Upcoming appointments */}
            <button
              type="button"
              onClick={() => navigate("/appointments")}
              className="bg-background-default border border-border-default rounded-2xl p-4 text-left hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
              aria-label="View upcoming appointments"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <CalendarCheckIcon
                  size={20}
                  weight="fill"
                  color={colors.primary.DEFAULT}
                />
              </div>
              <p className="font-poppins font-bold text-2xl text-text-primary">
                {upcomingAppointments}
              </p>
              <p className="font-poppins text-sm text-text-secondary">
                Upcoming appointments
              </p>
            </button>
          </div>

          {/* Patients section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Your Patients
              </h2>
              <p className="font-poppins text-sm text-text-secondary mt-1">
                {totalPatients} patient{totalPatients === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => navigate("/patients")}
              className="font-poppins text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: modeHexColor }}
            >
              View All
              <CaretRightIcon size={16} weight="bold" />
            </button>
          </div>

          {/* Patient cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          {/* Today's schedule section */}
          <div>
            <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">
              Medication Schedule
            </h2>
            <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ClockIcon size={18} />
                  <span className="font-poppins text-sm">
                    {filteredScheduleItems.length} items
                  </span>
                </div>
                <select
                  value={scheduleFilter}
                  onChange={(e) => setScheduleFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-default text-sm font-poppins text-text-primary"
                >
                  <option value="all">All patients</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {isScheduleLoading ? (
                <div className="px-5 py-8 text-center">
                  <p className="font-poppins text-text-secondary">
                    Loading schedule…
                  </p>
                </div>
              ) : filteredScheduleItems.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <ClockIcon
                    size={28}
                    className="mx-auto mb-2 text-text-secondary"
                  />
                  <p className="font-poppins text-text-secondary">
                    No medication schedule available yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  {filteredScheduleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="font-poppins font-semibold text-text-primary">
                          {item.medicationName}
                        </p>
                        <p className="font-poppins text-xs text-text-secondary">
                          {item.patientName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-poppins text-sm font-semibold text-text-primary">
                          {formatScheduleTime(item.time)}
                        </p>
                        <p className="font-poppins text-xs text-text-secondary capitalize">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverDashboard;
