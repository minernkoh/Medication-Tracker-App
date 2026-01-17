/**
 * CaregiverDashboard Component - Overview dashboard for caregivers
 * Shows all patients at a glance with their medication status and upcoming appointments
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  PillIcon,
  CalendarCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CaretRightIcon,
  HeartIcon,
  BellIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { GradientBackground } from "../../ui";
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

function CaregiverDashboard({ userName = "" }) {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const [patients, setPatients] = useState([]);
  const { showError } = useError();

  const loadPatients = useCallback(async () => {
    try {
      const data = await api.caregiver.getPatients();
      setPatients(
        (Array.isArray(data) ? data : []).map((patient, index) =>
          normalizePatient(patient, index)
        )
      );
    } catch (error) {
      showError(error.message || "Unable to load patients");
    }
  }, [showError]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Calculate totals
  const totalPatients = patients.length;
  const totalMedicationsToday = patients.reduce(
    (sum, p) => sum + (p.medicationsTotal || 0),
    0
  );
  const totalMedicationsTaken = patients.reduce(
    (sum, p) => sum + (p.medicationsTaken || 0),
    0
  );
  const totalAlerts = patients.reduce((sum, p) => sum + (p.alerts || 0), 0);
  const upcomingAppointments = patients.filter((p) => p.nextAppointment).length;

  // Patient card component
  const PatientCard = ({ patient }) => {
    const total = patient.medicationsTotal || 0;
    const taken = patient.medicationsTaken || 0;
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
              <h3 className="font-poppins font-bold text-text-primary">{patient.name}</h3>
              <p className="font-poppins text-xs text-text-secondary">
                {taken}/{total} medications today
              </p>
            </div>
          </div>
          {patient.alerts > 0 && (
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
              <WarningCircleIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-semibold">{patient.alerts}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-poppins text-xs text-text-secondary">Today's Progress</span>
            <span
              className="font-poppins text-xs font-semibold"
              style={{ color: completionPercent === 100 ? colors.success.DEFAULT : modeHexColor }}
            >
              {completionPercent}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionPercent}%`,
                backgroundColor: completionPercent === 100 ? colors.success.DEFAULT : modeHexColor,
              }}
            />
          </div>
        </div>

        {/* Quick info */}
        <div className="flex gap-3">
          {patient.nextMedication && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg flex-1">
              <ClockIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-medium">Next: {patient.nextMedication}</span>
            </div>
          )}
          {!patient.nextMedication && patient.medicationsTaken === patient.medicationsTotal && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg flex-1">
              <CheckCircleIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-medium">All done today!</span>
            </div>
          )}
        </div>

        {/* Upcoming appointment */}
        {patient.nextAppointment && (
          <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheckIcon size={16} weight="regular" color={colors.text.secondary} />
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
          <div className="flex items-center gap-3 mb-8">
            <HeartIcon size={32} weight="fill" color={modeHexColor} />
            <div>
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
                Good Morning, {userName}!
              </h1>
              <p className="font-poppins text-sm text-text-secondary mt-2">
                Here's an overview of your patients for today
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${modeHexColor}15` }}
            >
              <UsersIcon size={20} weight="fill" color={modeHexColor} />
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">{totalPatients}</p>
            <p className="font-poppins text-sm text-text-secondary">Patients</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <PillIcon size={20} weight="fill" color={colors.success.DEFAULT} />
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {totalMedicationsTaken}/{totalMedicationsToday}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Medications Today</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <CalendarCheckIcon size={20} weight="fill" color={colors.primary.DEFAULT} />
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">{upcomingAppointments}</p>
            <p className="font-poppins text-sm text-text-secondary">Upcoming Appointments</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                totalAlerts > 0 ? "bg-red-50" : "bg-emerald-50"
              }`}
            >
              {totalAlerts > 0 ? (
                <BellIcon size={20} weight="fill" color={colors.danger.DEFAULT} />
              ) : (
                <CheckCircleIcon size={20} weight="fill" color={colors.success.DEFAULT} />
              )}
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">{totalAlerts}</p>
            <p className="font-poppins text-sm text-text-secondary">
              {totalAlerts > 0 ? "Alerts" : "No Alerts"}
            </p>
          </div>
        </div>

          {/* Patients section */}
          <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-bold text-xl text-text-primary">Your Patients</h2>
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
              Today's Medication Schedule
            </h2>
            <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
              <div className="px-5 py-8 text-center">
                <ClockIcon size={28} className="mx-auto mb-2 text-text-secondary" />
                <p className="font-poppins text-text-secondary">
                  No medication schedule available yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverDashboard;
