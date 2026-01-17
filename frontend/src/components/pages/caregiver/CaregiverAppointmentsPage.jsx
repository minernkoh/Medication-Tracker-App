/**
 * CaregiverAppointmentsPage Component - View all appointments across all patients
 * Shows a consolidated view of all patient appointments
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheckIcon,
  PlusIcon,
  CaretUpIcon,
  CaretDownIcon,
  MapPinIcon,
  ClockIcon,
  StethoscopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { getModeHexColor, formatDateLocale } from "../../../utils";
import { GradientBackground, PageHeader } from "../../ui";
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

const normalizeDateInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

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
  return PATIENT_COLORS[index % PATIENT_COLORS.length];
};

const getStatus = (dateStr, timeStr) => {
  if (!dateStr) return "upcoming";
  const dateTime = timeStr
    ? new Date(`${dateStr}T${timeStr}`)
    : new Date(dateStr);
  if (Number.isNaN(dateTime.getTime())) return "upcoming";
  return dateTime < new Date() ? "completed" : "upcoming";
};

const normalizeAppointment = (appointment, index) => {
  if (!appointment) return null;
  const patient =
    appointment.patient && typeof appointment.patient === "object"
      ? appointment.patient
      : { name: "Patient", _id: appointment.patient };
  const patientName = patient.nickname
    ? `${patient.nickname} (${patient.name})`
    : patient.name;
  const normalizedDate = normalizeDateInput(appointment.date);
  return {
    id: appointment.id || appointment._id,
    patientId: patient.id || patient._id,
    patientName,
    patientInitials: patient.initials || getInitials(patientName),
    patientColor: getPatientColor(patient, index),
    title: appointment.title,
    doctor: appointment.doctorName,
    location: appointment.location,
    date: normalizedDate,
    time: appointment.time,
    status: appointment.status || getStatus(normalizedDate, appointment.time),
    notes: appointment.notes,
  };
};

function CaregiverAppointmentsPage() {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const { showError } = useError();

  const loadAppointments = useCallback(async () => {
    try {
      const data = await api.caregiver.getAppointments();
      setAppointments(
        (Array.isArray(data) ? data : [])
          .map((apt, index) => normalizeAppointment(apt, index))
          .filter(Boolean)
      );
    } catch (error) {
      showError(error.message || "Unable to load caregiver appointments");
    }
  }, [showError]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Get unique patients for filter
  const patients = useMemo(
    () => [...new Set(appointments.map((apt) => apt.patientName).filter(Boolean))],
    [appointments]
  );

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesPatient = filterPatient === "all" || apt.patientName === filterPatient;
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesPatient && matchesStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const { key, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    if (key === "date") {
      return multiplier * (new Date(a.date) - new Date(b.date));
    }
    if (key === "patient") {
      return multiplier * a.patientName.localeCompare(b.patientName);
    }
    if (key === "title") {
      return multiplier * a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <CaretUpIcon size={14} weight="bold" className="ml-1 inline" />
    ) : (
      <CaretDownIcon size={14} weight="bold" className="ml-1 inline" />
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
            title="All Appointments"
            description="Manage appointments for all your patients"
            action={
              <button
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-poppins font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: modeHexColor,
                  boxShadow: `0 10px 25px -5px ${modeHexColor}40`,
                }}
              >
                <PlusIcon size={20} weight="bold" />
                Add Appointment
              </button>
            }
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <FunnelIcon size={18} weight="regular" color={colors.text.secondary} />
            <span className="font-poppins text-sm text-text-secondary">Filter:</span>
          </div>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-default bg-white font-poppins text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            <option value="all">All Patients</option>
            {patients.map((patient) => (
              <option key={patient} value={patient}>
                {patient}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border-default bg-white font-poppins text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

          {/* Appointments table */}
          <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default bg-background-subtle">
                  <th
                    className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("patient")}
                  >
                    Patient
                    <SortIndicator columnKey="patient" />
                  </th>
                  <th
                    className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("title")}
                  >
                    Appointment
                    <SortIndicator columnKey="title" />
                  </th>
                  <th
                    className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("date")}
                  >
                    Date & Time
                    <SortIndicator columnKey="date" />
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Location
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-border-default hover:bg-background-hover cursor-pointer"
                    onClick={() => navigate(`/patients/${apt.patientId}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-poppins font-bold"
                          style={{ backgroundColor: apt.patientColor }}
                        >
                          {apt.patientInitials}
                        </div>
                        <span className="font-poppins font-medium text-text-primary">
                          {apt.patientName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-poppins font-medium text-text-primary">{apt.title}</p>
                        <p className="font-poppins text-xs text-text-secondary flex items-center gap-1">
                          <StethoscopeIcon size={12} />
                          {apt.doctor}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-poppins font-medium text-text-primary">
                          {formatDateLocale(apt.date)}
                        </p>
                        <p className="font-poppins text-xs text-text-secondary flex items-center gap-1">
                          <ClockIcon size={12} />
                          {apt.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-poppins text-sm text-text-primary flex items-center gap-1">
                        <MapPinIcon size={14} color={colors.text.secondary} />
                        {apt.location}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {apt.status === "upcoming" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-poppins text-xs font-semibold">
                          <ClockIcon size={12} weight="fill" />
                          Upcoming
                        </span>
                      )}
                      {apt.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-poppins text-xs font-semibold">
                          <CheckCircleIcon size={12} weight="fill" />
                          Completed
                        </span>
                      )}
                      {apt.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-poppins text-xs font-semibold">
                          <XCircleIcon size={12} weight="fill" />
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedAppointments.length === 0 && (
            <div className="px-5 py-12 text-center">
              <CalendarCheckIcon
                size={48}
                weight="regular"
                color={colors.text.secondary}
                className="mx-auto mb-3 opacity-50"
              />
              <p className="font-poppins text-text-secondary">
                No appointments found matching your filters
              </p>
            </div>
          )}
        </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-background-default border border-border-default rounded-2xl p-4 text-center">
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {appointments.filter((a) => a.status === "upcoming").length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Upcoming</p>
          </div>
          <div className="bg-background-default border border-border-default rounded-2xl p-4 text-center">
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Completed</p>
          </div>
          <div className="bg-background-default border border-border-default rounded-2xl p-4 text-center">
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {patients.length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Patients</p>
          </div>
          <div className="bg-background-default border border-border-default rounded-2xl p-4 text-center">
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {appointments.filter(
                (a) =>
                  a.status === "upcoming" &&
                  new Date(a.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">This Week            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverAppointmentsPage;
