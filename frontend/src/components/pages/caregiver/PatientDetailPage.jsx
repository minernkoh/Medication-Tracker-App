/**
 * PatientDetailPage Component - Detailed view of a single patient
 * Shows medications, appointments, and progress for a specific patient
 */
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PillIcon,
  CalendarCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  PhoneIcon,
  HeartIcon,
  TrendUpIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { colors, getModeColors } from "../../../utils/colors";
import { MedicationSection } from "../../ui";

// Mock patient data (in real app, would fetch based on ID)
const mockPatientData = {
  1: {
    id: 1,
    name: "Linda Johnson",
    nickname: "Mom",
    initials: "L",
    color: "#da7488",
    phone: "+1 (555) 123-4567",
    relationship: "Mother",
    age: 68,
    bloodType: "A+",
    emergencyContact: "+1 (555) 987-6543",
    notes: "Allergic to penicillin. Prefers morning medications with breakfast.",
    medications: [
      { id: 1, name: "Blood Pressure Med", dosage: "10mg", timeOfDay: "Morning", taken: true, takenTime: "8:00 AM" },
      { id: 2, name: "Vitamin D", dosage: "1000 IU", timeOfDay: "Morning", taken: true, takenTime: "8:00 AM" },
      { id: 3, name: "Calcium", dosage: "500mg", timeOfDay: "Afternoon", taken: true, takenTime: "1:00 PM" },
      { id: 4, name: "Heart Medicine", dosage: "5mg", timeOfDay: "Night", taken: false },
    ],
    appointments: [
      { id: 1, title: "Cardiology Checkup", doctor: "Dr. Williams", location: "Heart Center", date: "Jan 18, 2026", time: "10:00 AM", status: "upcoming" },
      { id: 2, title: "Blood Work", doctor: "Quest Diagnostics", location: "Lab Center", date: "Jan 25, 2026", time: "9:00 AM", status: "upcoming" },
    ],
    adherenceHistory: [85, 90, 88, 92, 95, 91, 92],
    alerts: [{ id: 1, message: "Heart Medicine due at 8:00 PM", type: "reminder" }],
  },
  2: {
    id: 2,
    name: "Robert Johnson",
    nickname: "Dad",
    initials: "R",
    color: "#155dfc",
    phone: "+1 (555) 234-5678",
    relationship: "Father",
    age: 71,
    bloodType: "O+",
    emergencyContact: "+1 (555) 876-5432",
    notes: "Has difficulty swallowing large pills. Prefers liquid medications when available.",
    medications: [
      { id: 1, name: "Pain Medication", dosage: "200mg", timeOfDay: "Morning", taken: true, takenTime: "7:30 AM" },
      { id: 2, name: "Blood Thinner", dosage: "5mg", timeOfDay: "Morning", taken: true, takenTime: "7:30 AM" },
      { id: 3, name: "Statin", dosage: "20mg", timeOfDay: "Night", taken: true, takenTime: "9:00 PM" },
      { id: 4, name: "Vitamin B12", dosage: "1000mcg", timeOfDay: "Morning", taken: true, takenTime: "7:30 AM" },
      { id: 5, name: "Probiotic", dosage: "1 capsule", timeOfDay: "Morning", taken: true, takenTime: "7:30 AM" },
    ],
    appointments: [
      { id: 1, title: "Physical Therapy", doctor: "PT Center", location: "Rehab Clinic", date: "Jan 20, 2026", time: "3:00 PM", status: "upcoming" },
    ],
    adherenceHistory: [95, 98, 100, 97, 98, 100, 98],
    alerts: [],
  },
  3: {
    id: 3,
    name: "Eleanor Smith",
    nickname: "Grandma",
    initials: "E",
    color: "#10b981",
    phone: "+1 (555) 345-6789",
    relationship: "Grandmother",
    age: 82,
    bloodType: "B-",
    emergencyContact: "+1 (555) 765-4321",
    notes: "Needs reminders for afternoon medications. Vision impairment - large print labels.",
    medications: [
      { id: 1, name: "Diabetes Medication", dosage: "500mg", timeOfDay: "Morning", taken: true, takenTime: "8:30 AM" },
      { id: 2, name: "Eye Drops", dosage: "2 drops", timeOfDay: "Morning", taken: true, takenTime: "8:30 AM" },
      { id: 3, name: "Vitamin D", dosage: "2000 IU", timeOfDay: "Afternoon", taken: false },
      { id: 4, name: "Calcium", dosage: "600mg", timeOfDay: "Afternoon", taken: false },
      { id: 5, name: "Blood Pressure Med", dosage: "25mg", timeOfDay: "Night", taken: false },
      { id: 6, name: "Aspirin", dosage: "81mg", timeOfDay: "Night", taken: false },
    ],
    appointments: [
      { id: 1, title: "Eye Exam", doctor: "Dr. Martinez", location: "Vision Center", date: "Jan 22, 2026", time: "9:00 AM", status: "upcoming" },
      { id: 2, title: "Diabetes Checkup", doctor: "Dr. Lee", location: "Endocrine Clinic", date: "Feb 5, 2026", time: "11:00 AM", status: "upcoming" },
    ],
    adherenceHistory: [70, 75, 72, 78, 80, 76, 78],
    alerts: [
      { id: 1, message: "Afternoon medications missed", type: "warning" },
      { id: 2, message: "Low medication adherence this week", type: "alert" },
    ],
  },
};

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const modeColors = getModeColors("Caregiver");

  // Get patient data (would be fetched in real app)
  const patient = mockPatientData[patientId] || mockPatientData[1];

  // Separate medications by status
  const pendingMeds = patient.medications.filter((m) => !m.taken);
  const takenMeds = patient.medications.filter((m) => m.taken);

  // Calculate stats
  const adherenceRate = Math.round(
    (takenMeds.length / patient.medications.length) * 100
  );
  const avgAdherence = Math.round(
    patient.adherenceHistory.reduce((a, b) => a + b, 0) / patient.adherenceHistory.length
  );

  // Handle mark as taken
  const handleMarkAsTaken = (medId) => {
    // In real app, would update state/backend
    console.log("Mark as taken:", medId);
  };

  return (
    <div className="bg-background-default w-full min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 font-poppins font-medium text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeftIcon size={20} weight="bold" />
          Back to Patients
        </button>

        {/* Patient header */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-poppins font-bold text-3xl"
                style={{ backgroundColor: patient.color }}
              >
                {patient.initials}
              </div>
              <div>
                <h1 className="font-poppins font-bold text-2xl text-text-primary">
                  {patient.nickname}
                </h1>
                <p className="font-poppins text-text-secondary">{patient.name}</p>
                <p className="font-poppins text-sm text-text-secondary mt-1">
                  {patient.relationship} • {patient.age} years old
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 md:ml-auto">
              <a
                href={`tel:${patient.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default hover:bg-background-hover font-poppins font-medium text-sm transition-colors"
              >
                <PhoneIcon size={18} weight="regular" color={colors.text.primary} />
                Call
              </a>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-poppins font-semibold text-sm text-white"
                style={{ backgroundColor: modeColors.DEFAULT }}
              >
                <PencilSimpleIcon size={18} weight="regular" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Alerts */}
          {patient.alerts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border-default">
              <h3 className="font-poppins font-semibold text-sm text-text-primary mb-3">
                Alerts & Reminders
              </h3>
              <div className="space-y-2">
                {patient.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      alert.type === "warning"
                        ? "bg-amber-50 text-amber-700"
                        : alert.type === "alert"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <WarningCircleIcon size={18} weight="fill" />
                    <span className="font-poppins text-sm font-medium">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient notes */}
          {patient.notes && (
            <div className="mt-6 pt-6 border-t border-border-default">
              <h3 className="font-poppins font-semibold text-sm text-text-primary mb-2">
                Notes
              </h3>
              <p className="font-poppins text-sm text-text-secondary">{patient.notes}</p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PillIcon size={20} weight="fill" color={modeColors.DEFAULT} />
              <span className="font-poppins text-xs text-text-secondary">Today</span>
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {takenMeds.length}/{patient.medications.length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Medications</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendUpIcon size={20} weight="fill" color="#10b981" />
              <span className="font-poppins text-xs text-text-secondary">Weekly</span>
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">{avgAdherence}%</p>
            <p className="font-poppins text-sm text-text-secondary">Avg Adherence</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheckIcon size={20} weight="fill" color="#155dfc" />
              <span className="font-poppins text-xs text-text-secondary">Upcoming</span>
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">
              {patient.appointments.length}
            </p>
            <p className="font-poppins text-sm text-text-secondary">Appointments</p>
          </div>

          <div className="bg-background-default border border-border-default rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HeartIcon size={20} weight="fill" color="#ef4444" />
              <span className="font-poppins text-xs text-text-secondary">Blood Type</span>
            </div>
            <p className="font-poppins font-bold text-2xl text-text-primary">{patient.bloodType}</p>
            <p className="font-poppins text-sm text-text-secondary">Type</p>
          </div>
        </div>

        {/* Medications section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MedicationSection
            variant="pending"
            medications={pendingMeds}
            onMarkAsTaken={handleMarkAsTaken}
            showTimeGroups={true}
            compact={false}
          />
          <MedicationSection
            variant="taken"
            medications={takenMeds}
            showTimeGroups={true}
            compact={false}
          />
        </div>

        {/* Appointments section */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarCheckIcon size={24} weight="regular" color={colors.icon.primary} />
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Upcoming Appointments
              </h2>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-poppins font-semibold text-sm text-white"
              style={{ backgroundColor: modeColors.DEFAULT }}
            >
              <PlusIcon size={16} weight="bold" />
              Add
            </button>
          </div>

          {patient.appointments.length > 0 ? (
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-background-subtle rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${modeColors.DEFAULT}15` }}
                    >
                      <CalendarCheckIcon size={24} weight="fill" color={modeColors.DEFAULT} />
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-text-primary">{apt.title}</p>
                      <p className="font-poppins text-sm text-text-secondary">
                        {apt.doctor} • {apt.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-poppins font-semibold text-text-primary">{apt.date}</p>
                    <p className="font-poppins text-sm text-text-secondary">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-poppins text-text-secondary text-center py-8">
              No upcoming appointments
            </p>
          )}
        </div>

        {/* Adherence chart placeholder */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6 mt-6">
          <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">
            Weekly Adherence
          </h2>
          <div className="flex items-end justify-between h-32 gap-2">
            {patient.adherenceHistory.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${value}%`,
                    backgroundColor:
                      value >= 90 ? "#10b981" : value >= 70 ? "#f59e0b" : "#ef4444",
                  }}
                />
                <span className="font-poppins text-xs text-text-secondary">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailPage;
