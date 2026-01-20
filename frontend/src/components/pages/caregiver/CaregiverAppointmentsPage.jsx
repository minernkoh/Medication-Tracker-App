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
  CaretLeftIcon,
  CaretRightIcon,
  MapPinIcon,
  StethoscopeIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import {
  formatDateNumeric,
  formatTime,
  getModeHexColor,
  textStyles,
} from "../../../utils";
import { Button, GradientBackground, PageHeader, SelectMenu } from "../../ui";
import ActionButtons from "../../ui/ActionButtons";
import ConfirmDialog from "../../ui/ConfirmDialog";
import AddAppointmentModal from "../../modals/AddAppointmentModal";
import { colors } from "../../../../tailwind.config.js";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";
import {
  getPatientAvatarColor,
  getPatientInitials,
} from "../../../utils/patientUtils";

const normalizeDateInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()))
    return typeof value === "string" ? value : "";
  return parsed.toISOString().split("T")[0];
};

const getPatientColor = (patient, index) => getPatientAvatarColor(patient, index);

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
    patientInitials: getPatientInitials(patientName),
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
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });
  const primaryColor = getModeHexColor("Caregiver");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [caregiverPatients, setCaregiverPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
          .filter(Boolean),
      );
    } catch (error) {
      showError(error.message || "Unable to load caregiver appointments");
    }
  }, [showError]);

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, [loadAppointments, loadPatients]);

  // Get appointment status with display-only auto-resolution (match Personal)
  const getStatus = (apt) => {
    if (apt?.status && apt.status !== "Scheduled") return apt.status;

    // Use local date and time for comparisons
    const dateStr = apt?.date;
    if (!dateStr || typeof dateStr !== "string") return "Scheduled";

    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "Scheduled";

    const aptDate = new Date(year, month - 1, day);
    if (apt?.time) {
      const [hours, minutes] = String(apt.time).split(":");
      aptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }

    const now = new Date();
    if (now - aptDate > 3600000) return "Missed";

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(year, month - 1, day);

    if (compareDate.getTime() === todayDate.getTime()) return "Today";
    if (compareDate > todayDate) return "Scheduled";
    return "Missed";
  };

  // Get unique patients for filter (prefer loaded caregiver patients)
  const patients = useMemo(() => {
    const names =
      caregiverPatients?.length > 0
        ? caregiverPatients.map((p) => p.name).filter(Boolean)
        : appointments.map((apt) => apt.patientName).filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [appointments, caregiverPatients]);

  // Filter appointments by selected year (match Personal)
  const yearAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate.getFullYear() === selectedYear;
  });

  // Filter appointments
  const filteredAppointments = yearAppointments.filter((apt) => {
    const matchesPatient =
      filterPatient === "all" || apt.patientName === filterPatient;
    const matchesStatus =
      filterStatus === "all" || getStatus(apt) === filterStatus;
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
    if (key === "doctor") {
      return multiplier * (a.doctor || "").localeCompare(b.doctor || "");
    }
    if (key === "location") {
      return multiplier * (a.location || "").localeCompare(b.location || "");
    }
    if (key === "status") {
      const statusOrder = {
        Today: 0,
        Scheduled: 1,
        Completed: 2,
        Missed: 3,
        Cancelled: 4,
      };
      return (
        multiplier *
        ((statusOrder[getStatus(a)] ?? 99) - (statusOrder[getStatus(b)] ?? 99))
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
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
          <CaretUpIcon size={12} weight="bold" />
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <CaretUpIcon
        size={12}
        weight="bold"
        className="ml-1"
        color={primaryColor}
      />
    ) : (
      <CaretDownIcon
        size={12}
        weight="bold"
        className="ml-1"
        color={primaryColor}
      />
    );
  };

  // Count stats (match Personal)
  const upcomingCount = sortedAppointments.filter(
    (apt) => getStatus(apt) === "Scheduled",
  ).length;
  const completedCount = sortedAppointments.filter(
    (apt) => (apt.status || getStatus(apt)) === "Completed",
  ).length;
  const todayCount = sortedAppointments.filter(
    (apt) => getStatus(apt) === "Today",
  ).length;

  // Navigate years
  const goToPreviousYear = () => setSelectedYear((y) => y - 1);
  const goToNextYear = () => setSelectedYear((y) => y + 1);

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
        await api.appointments.createForPatient(
          selectedPatientId,
          appointmentData,
        );
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
            description={`${sortedAppointments.length} appointment${
              sortedAppointments.length !== 1 ? "s" : ""
            } in ${selectedYear}`}
            action={
              <Button
                variant="secondary"
                size="lg"
                icon={<PlusIcon size={20} weight="bold" />}
                onClick={openAddModal}
              >
                New Appointment
              </Button>
            }
          />

          {/* Year navigation & Stats */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Year selector */}
            <div className="bg-background-default border border-border-default flex items-center justify-between px-4 py-3 rounded-xl flex-1 sm:flex-none sm:min-w-[200px]">
              <button
                onClick={goToPreviousYear}
                className="p-1.5 rounded-lg hover:bg-background-hover transition-colors"
                aria-label="Previous year"
              >
                <CaretLeftIcon
                  size={20}
                  weight="bold"
                  color={colors.icon.primary}
                />
              </button>

              <div className="flex items-center gap-2">
                <CalendarCheckIcon
                  size={20}
                  weight="fill"
                  color={primaryColor}
                />
                <span
                  className={`${textStyles.heading.medium} text-text-primary`}
                >
                  {selectedYear}
                </span>
              </div>

              <button
                onClick={goToNextYear}
                className="p-1.5 rounded-lg hover:bg-background-hover transition-colors"
                aria-label="Next year"
              >
                <CaretRightIcon
                  size={20}
                  weight="bold"
                  color={colors.icon.primary}
                />
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 flex-1">
              <div className="bg-background-default border border-border-default rounded-xl px-4 py-3 flex-1">
                <p
                  className={`${textStyles.caption.small} uppercase tracking-wide`}
                >
                  Upcoming
                </p>
                <p
                  className={textStyles.heading.xl}
                  style={{ color: primaryColor }}
                >
                  {upcomingCount + todayCount}
                </p>
              </div>
              <div className="bg-background-default border border-border-default rounded-xl px-4 py-3 flex-1">
                <p
                  className={`${textStyles.caption.small} uppercase tracking-wide`}
                >
                  Completed
                </p>
                <p className={`${textStyles.heading.xl} text-text-primary`}>
                  {completedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FunnelIcon
                size={18}
                weight="regular"
                color={colors.text.secondary}
              />
              <span className="font-poppins text-sm text-text-secondary">
                Filter:
              </span>
            </div>
            <SelectMenu
              value={filterPatient}
              onChange={(next) => setFilterPatient(next)}
              options={[
                { value: "all", label: "All Patients" },
                ...patients.map((patient) => ({ value: patient, label: patient })),
              ]}
              mode="Caregiver"
              aria-label="Filter by patient"
              buttonClassName="px-4 py-2 rounded-xl text-sm"
            />
            <SelectMenu
              value={filterStatus}
              onChange={(next) => setFilterStatus(next)}
              options={[
                { value: "all", label: "All Status" },
                { value: "Today", label: "Today" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Completed", label: "Completed" },
                { value: "Missed", label: "Missed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
              mode="Caregiver"
              aria-label="Filter by status"
              buttonClassName="px-4 py-2 rounded-xl text-sm"
            />
          </div>

          {/* Appointments table */}
          <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default bg-background-subtle">
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("patient")}
                    >
                      <div className="flex items-center">
                        Patient
                        <SortIndicator columnKey="patient" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date & Time
                        <SortIndicator columnKey="date" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center">
                        Appointment
                        <SortIndicator columnKey="title" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("doctor")}
                    >
                      <div className="flex items-center">
                        Doctor
                        <SortIndicator columnKey="doctor" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center">
                        Location
                        <SortIndicator columnKey="location" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIndicator columnKey="status" />
                      </div>
                    </th>
                    <th
                      className={`px-5 py-4 text-right ${textStyles.label.small} text-text-secondary uppercase tracking-wide`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAppointments.map((apt) => {
                    const currentStatus = getStatus(apt);
                    const isMissed = currentStatus === "Missed";
                    const isToday = currentStatus === "Today";
                    const selectValue = apt.status || "Scheduled";

                    const statusClasses =
                      selectValue === "Scheduled" || isToday
                        ? "bg-blue-50 text-blue-600"
                        : selectValue === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectValue === "Cancelled"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-50 text-red-600";

                    // Make the "status pill" hug the currently selected label instead of
                    // reserving width for the longest option (common native <select> behavior).
                    const statusWidthCh = Math.max(
                      10,
                      String(selectValue).length + 4,
                    );

                    return (
                      <tr
                        key={apt.id}
                        className={`border-b border-border-default transition-colors hover:bg-background-hover cursor-pointer ${
                          isMissed ? "opacity-60" : ""
                        } ${isToday ? "bg-amber-50/30" : ""}`}
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
                          <div className="flex flex-col">
                            <span
                              className={`${textStyles.body.small} text-text-primary`}
                            >
                              {formatDateNumeric(apt.date)}
                            </span>
                            <span className={`${textStyles.caption.small} mt-0.5`}>
                              {formatTime(apt.time)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span
                              className={`${textStyles.label.medium} text-text-primary`}
                            >
                              {apt.title}
                            </span>
                            {apt.notes && (
                              <span
                                className={`${textStyles.caption.small} mt-0.5 italic max-w-[200px] truncate`}
                              >
                                {apt.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-poppins text-sm text-text-primary flex items-center gap-2">
                            <StethoscopeIcon
                              size={16}
                              weight="regular"
                              color={colors.icon.secondary}
                            />
                            {apt.doctor}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <MapPinIcon
                              size={16}
                              weight="regular"
                              color={colors.icon.secondary}
                            />
                            <span className="font-poppins text-sm text-text-primary max-w-[180px] truncate">
                              {apt.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: `${statusWidthCh}ch` }}
                          >
                            <SelectMenu
                              value={selectValue}
                              onChange={(next) => handleUpdateStatus(apt, next)}
                              options={[
                                { value: "Scheduled", label: "Scheduled" },
                                { value: "Completed", label: "Completed" },
                                { value: "Missed", label: "Missed" },
                                { value: "Cancelled", label: "Cancelled" },
                              ]}
                              mode="Caregiver"
                              aria-label="Appointment status"
                              buttonClassName={`w-full px-3 py-1.5 rounded-lg font-poppins text-xs font-semibold border-none cursor-pointer ${statusClasses}`}
                            />
                          </div>
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
                    );
                  })}
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
