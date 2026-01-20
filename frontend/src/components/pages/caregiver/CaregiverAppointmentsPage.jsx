/**
 * CaregiverAppointmentsPage Component - View all appointments across all patients
 * Shows a consolidated view of all patient appointments
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheckIcon,
  PlusIcon,
  CaretUpIcon,
  CaretDownIcon,
  MapPinIcon,
  ClockIcon,
  StethoscopeIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { formatDateLocale } from "../../../utils";
import { Button, GradientBackground, PageHeader } from "../../ui";
import ActionButtons from "../../ui/ActionButtons";
import ConfirmDialog from "../../ui/ConfirmDialog";
import AddAppointmentModal from "../../modals/AddAppointmentModal";
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
  const seed =
    patient?.id || patient?._id || patient?.email || patient?.name || index || "";
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return PATIENT_COLORS[hash % PATIENT_COLORS.length];
};

const deriveStatus = (apt) => {
  const base = apt?.status || "Scheduled";
  if (base !== "Scheduled") return base;

  const dateStr = apt?.date;
  if (!dateStr || typeof dateStr !== "string") return base;

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return base;

  const apptDate = new Date(year, month - 1, day);
  if (apt?.time) {
    const [hours, minutes] = String(apt.time).split(":");
    apptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  }

  const now = new Date();
  // Display-only auto-resolution: Missed if > 1 hour past scheduled time
  if (now - apptDate > 60 * 60 * 1000) return "Missed";
  return "Scheduled";
};

const normalizeAppointment = (appointment, index) => {
  if (!appointment) return null;
  const patient =
    appointment.patient && typeof appointment.patient === "object"
      ? appointment.patient
      : { name: "Patient", _id: appointment.patient };
  const patientName = patient.name;
  const normalizedDate = normalizeDateInput(appointment.date);
  return {
    id: appointment.id || appointment._id,
    patientId: patient.id || patient._id,
    patientName,
    patientInitials: getInitials(patientName),
    patientColor: getPatientColor(patient, index),
    title: appointment.title,
    doctor: appointment.doctorName,
    location: appointment.location,
    date: normalizedDate,
    time: appointment.time,
    status: appointment.status || "Scheduled",
    notes: appointment.notes,
  };
};

function CaregiverAppointmentsPage() {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [caregiverPatients, setCaregiverPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    appointmentId: null,
    appointmentTitle: "",
    patientId: null,
  });
  const { showError } = useError();

  const loadPatients = useCallback(async () => {
    try {
      const data = await api.caregiver.getPatients();
      setCaregiverPatients(
        (Array.isArray(data) ? data : [])
          .map((p) => ({
            id: p.id || p._id,
            name: p.name,
          }))
          .filter((p) => p.id && p.name),
      );
    } catch (error) {
      showError(error.message || "Unable to load patients");
    }
  }, [showError]);

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
    loadPatients();
  }, [loadAppointments, loadPatients]);

  // Get unique patients for filter
  const patients = useMemo(
    () => [...new Set(appointments.map((apt) => apt.patientName).filter(Boolean))],
    [appointments]
  );

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesPatient = filterPatient === "all" || apt.patientName === filterPatient;
    const matchesStatus = filterStatus === "all" || deriveStatus(apt) === filterStatus;
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
    if (key === "location") {
      return multiplier * (a.location || "").localeCompare(b.location || "");
    }
    if (key === "status") {
      const statusOrder = {
        Scheduled: 0,
        Completed: 1,
        Missed: 2,
        Cancelled: 3,
      };
      const statusA = deriveStatus(a);
      const statusB = deriveStatus(b);
      return (
        multiplier *
        ((statusOrder[statusA] ?? 99) - (statusOrder[statusB] ?? 99))
      );
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

  const openAddModal = () => {
    setEditingAppointment(null);
    setSelectedPatientId("");
    setIsModalOpen(true);
  };

  const openEditModal = (apt) => {
    setEditingAppointment(apt);
    setSelectedPatientId(apt.patientId || "");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (apt, newStatus) => {
    try {
      if (!apt?.id || !apt?.patientId) return;
      await api.appointments.updateForPatient(apt.patientId, apt.id, {
        status: newStatus,
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apt.id ? { ...a, status: newStatus } : a)),
      );
    } catch (error) {
      showError(error.message || "Unable to update status");
    }
  };

  const handleSave = async (appointmentData) => {
    try {
      if (!selectedPatientId) {
        showError("Please select a patient");
        return;
      }

      if (editingAppointment?.id) {
        await api.appointments.updateForPatient(
          selectedPatientId,
          editingAppointment.id,
          { ...appointmentData, id: editingAppointment.id },
        );
      } else {
        await api.appointments.createForPatient(selectedPatientId, appointmentData);
      }

      setIsModalOpen(false);
      setEditingAppointment(null);
      setSelectedPatientId("");
      await loadAppointments();
    } catch (error) {
      showError(error.message || "Unable to save appointment");
    }
  };

  const requestDelete = (apt) => {
    setDeleteConfirm({
      isOpen: true,
      appointmentId: apt?.id,
      appointmentTitle: apt?.title || "this appointment",
      patientId: apt?.patientId,
    });
  };

  const confirmDelete = async () => {
    try {
      if (!deleteConfirm.appointmentId || !deleteConfirm.patientId) return;
      await api.appointments.deleteForPatient(
        deleteConfirm.patientId,
        deleteConfirm.appointmentId,
      );
      setDeleteConfirm({
        isOpen: false,
        appointmentId: null,
        appointmentTitle: "",
        patientId: null,
      });
      await loadAppointments();
    } catch (error) {
      showError(error.message || "Unable to delete appointment");
    }
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
              <Button
                variant="secondary"
                size="lg"
                icon={<PlusIcon size={20} weight="bold" />}
                onClick={openAddModal}
              >
                Add Appointment
              </Button>
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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Cancelled">Cancelled</option>
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
                  <th
                    className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("location")}
                  >
                    Location
                    <SortIndicator columnKey="location" />
                  </th>
                  <th
                    className="px-5 py-4 text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <SortIndicator columnKey="status" />
                  </th>
                  <th className="px-5 py-4 text-right font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                    Actions
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
                      <select
                        value={deriveStatus(apt)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(apt, e.target.value);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-poppins text-xs font-semibold focus:outline-none transition-colors border-none cursor-pointer ${
                          deriveStatus(apt) === "Scheduled"
                            ? "bg-blue-50 text-blue-600"
                            : deriveStatus(apt) === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : deriveStatus(apt) === "Cancelled"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-50 text-red-600"
                        }`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Missed">Missed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <ActionButtons
                          onEdit={() => openEditModal(apt)}
                          onDelete={() => requestDelete(apt)}
                          size="base"
                          editLabel="Edit appointment"
                          deleteLabel="Delete appointment"
                          mode="Caregiver"
                        />
                      </div>
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

          {isModalOpen && (
            <AddAppointmentModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditingAppointment(null);
              }}
              onSave={handleSave}
              appointment={editingAppointment}
              mode="Caregiver"
              patients={caregiverPatients}
              patientId={selectedPatientId}
              onPatientIdChange={setSelectedPatientId}
            />
          )}

          <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            onClose={() =>
              setDeleteConfirm({
                isOpen: false,
                appointmentId: null,
                appointmentTitle: "",
                patientId: null,
              })
            }
            onConfirm={confirmDelete}
            title="Delete Appointment"
            message={`Are you sure you want to delete "${deleteConfirm.appointmentTitle}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            mode="Caregiver"
          />
        </div>
      </div>
    </div>
  );
}

export default CaregiverAppointmentsPage;
