/**
 * PatientsPage Component - List of all patients for caregiver
 * Allows adding, editing, and viewing patient details
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CaretRightIcon,
  PillIcon,
  CalendarCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSimpleIcon,
  TrashIcon,
  PhoneIcon,
  XIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { colors } from "../../../../tailwind.config.js";
import ConfirmDialog from "../../ui/ConfirmDialog";

// Patient color palette using design tokens
const PATIENT_COLORS = [
  colors.patient.pink,
  colors.patient.blue,
  colors.patient.green,
  colors.patient.amber,
  colors.patient.purple,
];

// Mock patient data
const initialPatients = [
  {
    id: 1,
    name: "Linda Johnson",
    nickname: "Mom",
    initials: "L",
    color: colors.patient.pink,
    phone: "+1 (555) 123-4567",
    relationship: "Mother",
    medicationsTaken: 3,
    medicationsTotal: 4,
    medications: [
      "Blood Pressure Med",
      "Vitamin D",
      "Calcium",
      "Heart Medicine",
    ],
    nextAppointment: {
      title: "Cardiology Checkup",
      date: "Jan 18, 2026",
      time: "10:00 AM",
    },
    alerts: 1,
    adherenceRate: 92,
  },
  {
    id: 2,
    name: "Robert Johnson",
    nickname: "Dad",
    initials: "R",
    color: colors.patient.blue,
    phone: "+1 (555) 234-5678",
    relationship: "Father",
    medicationsTaken: 5,
    medicationsTotal: 5,
    medications: [
      "Pain Medication",
      "Blood Thinner",
      "Statin",
      "Vitamin B12",
      "Probiotic",
    ],
    nextAppointment: {
      title: "Physical Therapy",
      date: "Jan 20, 2026",
      time: "3:00 PM",
    },
    alerts: 0,
    adherenceRate: 98,
  },
  {
    id: 3,
    name: "Eleanor Smith",
    nickname: "Grandma",
    initials: "E",
    color: colors.patient.green,
    phone: "+1 (555) 345-6789",
    relationship: "Grandmother",
    medicationsTaken: 2,
    medicationsTotal: 6,
    medications: [
      "Diabetes Medication",
      "Eye Drops",
      "Vitamin D",
      "Calcium",
      "Blood Pressure Med",
      "Aspirin",
    ],
    nextAppointment: {
      title: "Eye Exam",
      date: "Jan 22, 2026",
      time: "9:00 AM",
    },
    alerts: 2,
    adherenceRate: 78,
  },
];

function PatientsPage() {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const [patients, setPatients] = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    nickname: "",
    phone: "",
    relationship: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    patientId: null,
    patientName: "",
  });

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add patient
  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;

    const patient = {
      id: Date.now(),
      name: newPatient.name,
      nickname: newPatient.nickname || newPatient.name.split(" ")[0],
      initials: newPatient.name.charAt(0).toUpperCase(),
      color: PATIENT_COLORS[Math.floor(Math.random() * PATIENT_COLORS.length)],
      phone: newPatient.phone,
      relationship: newPatient.relationship,
      medicationsTaken: 0,
      medicationsTotal: 0,
      medications: [],
      nextAppointment: null,
      alerts: 0,
      adherenceRate: 0,
    };

    setPatients([...patients, patient]);
    setNewPatient({ name: "", nickname: "", phone: "", relationship: "" });
    setShowAddModal(false);
  };

  // Handle delete patient
  const handleDeletePatient = (id) => {
    const patient = patients.find((p) => p.id === id);
    setDeleteConfirm({
      isOpen: true,
      patientId: id,
      patientName: patient?.name || "this patient",
    });
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteConfirm.patientId) {
      setPatients(patients.filter((p) => p.id !== deleteConfirm.patientId));
    }
    setDeleteConfirm({ isOpen: false, patientId: null, patientName: "" });
  };

  // Patient row component
  const PatientRow = ({ patient }) => {
    const completionPercent = patient.medicationsTotal
      ? Math.round((patient.medicationsTaken / patient.medicationsTotal) * 100)
      : 0;

    return (
      <tr
        className="border-b border-border-default hover:bg-background-hover cursor-pointer group"
        onClick={() => navigate(`/patients/${patient.id}`)}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-poppins font-bold"
              style={{ backgroundColor: patient.color }}
            >
              {patient.initials}
            </div>
            <div>
              <p className="font-poppins font-semibold text-text-primary">
                {patient.nickname} ({patient.name.split(" ")[0]})
              </p>
              <p className="font-poppins text-xs text-text-secondary">
                {patient.relationship}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <PillIcon
              size={16}
              weight="regular"
              color={colors.text.secondary}
            />
            <span className="font-poppins text-text-primary">
              {patient.medicationsTotal} medications
            </span>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${patient.adherenceRate}%`,
                  backgroundColor:
                    patient.adherenceRate >= 90
                      ? colors.success.DEFAULT
                      : patient.adherenceRate >= 70
                      ? colors.warning.DEFAULT
                      : colors.danger.DEFAULT,
                }}
              />
            </div>
            <span
              className="font-poppins text-sm font-medium"
              style={{
                color:
                  patient.adherenceRate >= 90
                    ? "#10b981"
                    : patient.adherenceRate >= 70
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              {patient.adherenceRate}%
            </span>
          </div>
        </td>
        <td className="px-5 py-4">
          {patient.nextAppointment ? (
            <div className="flex items-center gap-2">
              <CalendarCheckIcon
                size={16}
                weight="regular"
                color={colors.text.secondary}
              />
              <span className="font-poppins text-sm text-text-primary">
                {patient.nextAppointment.date}
              </span>
            </div>
          ) : (
            <span className="font-poppins text-sm text-text-secondary italic">
              No upcoming
            </span>
          )}
        </td>
        <td className="px-5 py-4">
          {patient.alerts > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-poppins text-xs font-semibold">
              <WarningCircleIcon size={12} weight="fill" />
              {patient.alerts} alert{patient.alerts > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-poppins text-xs font-semibold">
              <CheckCircleIcon size={12} weight="fill" />
              Good
            </span>
          )}
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/patients/${patient.id}`);
              }}
              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
              aria-label="Edit patient"
            >
              <PencilSimpleIcon
                size={18}
                weight="regular"
                className="text-gray-500 hover:text-blue-600"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePatient(patient.id);
              }}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Delete patient"
            >
              <TrashIcon
                size={18}
                weight="regular"
                className="text-gray-500 hover:text-red-600"
              />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-background-default w-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon size={28} weight="fill" color={modeHexColor} />
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
                My Patients
              </h1>
            </div>
            <p className="font-poppins text-text-secondary">
              Manage and monitor all your patients in one place
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-poppins font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            style={{
              backgroundColor: modeHexColor,
              boxShadow: `0 10px 25px -5px ${modeHexColor}40`,
            }}
          >
            <PlusIcon size={20} weight="bold" />
            Add Patient
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon
              size={20}
              weight="regular"
              color={colors.text.secondary}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Patients table */}
        <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default bg-background-subtle">
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Medications
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Adherence
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Next Appointment
                  </th>
                  <th className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <UsersIcon
                        size={48}
                        weight="regular"
                        color={colors.text.secondary}
                        className="mx-auto mb-3 opacity-50"
                      />
                      <p className="font-poppins text-text-secondary">
                        {searchQuery
                          ? "No patients found matching your search"
                          : "No patients added yet"}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-3 font-poppins font-semibold text-sm"
                          style={{ color: modeHexColor }}
                        >
                          Add your first patient
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient cards for mobile */}
        <div className="md:hidden mt-4 space-y-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="bg-background-default border border-border-default rounded-2xl p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-poppins font-bold"
                  style={{ backgroundColor: patient.color }}
                >
                  {patient.initials}
                </div>
                <div className="flex-1">
                  <p className="font-poppins font-semibold text-text-primary">
                    {patient.nickname}
                  </p>
                  <p className="font-poppins text-xs text-text-secondary">
                    {patient.relationship}
                  </p>
                </div>
                {patient.alerts > 0 && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                    <WarningCircleIcon size={12} weight="fill" />
                    <span className="font-poppins text-xs font-semibold">
                      {patient.alerts}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-poppins text-text-secondary">
                  {patient.medicationsTotal} medications
                </span>
                <span
                  className="font-poppins font-semibold"
                  style={{
                    color:
                      patient.adherenceRate >= 90
                        ? colors.success.DEFAULT
                        : patient.adherenceRate >= 70
                        ? colors.warning.DEFAULT
                        : colors.danger.DEFAULT,
                  }}
                >
                  {patient.adherenceRate}% adherence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal header */}
            <div
              className="p-6 pb-4"
              style={{ backgroundColor: `${modeHexColor}10` }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                <XIcon size={20} weight="bold" color={colors.text.primary} />
              </button>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: modeHexColor }}
              >
                <UsersIcon size={24} weight="fill" color={colors.text.onPrimary} />
              </div>
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Add New Patient
              </h2>
              <p className="font-poppins text-sm text-text-secondary mt-1">
                Add someone you're caring for. You'll be able to manage their medications and appointments.
              </p>
            </div>

            {/* Modal form */}
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  placeholder="e.g., Linda Johnson"
                  className="w-full px-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Nickname
                </label>
                <input
                  type="text"
                  value={newPatient.nickname}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, nickname: e.target.value })
                  }
                  placeholder="e.g., Mom"
                  className="w-full px-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Relationship
                </label>
                <input
                  type="text"
                  value={newPatient.relationship}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      relationship: e.target.value,
                    })
                  }
                  placeholder="e.g., Mother, Father, Spouse"
                  className="w-full px-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon
                    size={20}
                    weight="regular"
                    color={colors.text.secondary}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-poppins font-semibold text-white shadow-lg hover:shadow-xl transition-all mt-6"
                style={{
                  backgroundColor: modeHexColor,
                  boxShadow: `0 10px 25px -5px ${modeHexColor}40`,
                }}
              >
                Add Patient
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, patientId: null, patientName: "" })
        }
        onConfirm={confirmDelete}
        title="Remove Patient"
        message={`Are you sure you want to remove ${deleteConfirm.patientName}? This will remove all their medication and appointment data. This action cannot be undone.`}
        confirmText="Remove Patient"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default PatientsPage;
