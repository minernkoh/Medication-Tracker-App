/**
 * AppointmentsPage Component - Full appointments management for Personal mode
 * Shows all appointments for the year in a table format
 *
 * @param {string} userName - User's name
 * @param {string} mode - "Personal" or "Caregiver"
 * @param {function} onMenuClick - Navigation callback
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  ClockIcon,
  PencilSimpleIcon,
  TrashIcon,
  NoteBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CalendarCheckIcon,
  CaretUpIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import {
  getModeHexColor,
  formatDate,
  formatTime,
  textStyles,
} from "../../../utils";
import { PageHeader, GradientBackground, Button } from "../../ui";
import AddAppointmentModal from "../../modals/AddAppointmentModal";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { colors } from "../../../../tailwind.config.js";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";

const normalizeDateInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

const normalizeAppointment = (appointment) => {
  if (!appointment) return null;
  return {
    ...appointment,
    id: appointment.id || appointment._id,
    date: normalizeDateInput(appointment.date),
  };
};

function AppointmentsPage({ userName = "", mode = "Personal" }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    appointmentId: null,
    appointmentTitle: "",
  });

  const [appointments, setAppointments] = useState([]);
  const { showError } = useError();

  const loadAppointments = useCallback(async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(
        (Array.isArray(data) ? data : []).map(normalizeAppointment).filter(Boolean)
      );
    } catch (error) {
      showError(error.message || "Unable to load appointments");
    }
  }, [showError]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const primaryColor = getModeHexColor(mode);

  // Filter appointments by selected year
  const yearAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate.getFullYear() === selectedYear;
  });

  // Sort appointments based on sortConfig
  const sortedAppointments = [...yearAppointments].sort((a, b) => {
    const { key, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    if (key === "date") {
      return multiplier * (new Date(a.date) - new Date(b.date));
    }
    if (key === "status") {
      const statusOrder = { today: 0, upcoming: 1, past: 2 };
      return (
        multiplier *
        (statusOrder[getStatus(a.date)] - statusOrder[getStatus(b.date)])
      );
    }
    if (key === "title") {
      return multiplier * a.title.localeCompare(b.title);
    }
    if (key === "doctorName") {
      return multiplier * a.doctorName.localeCompare(b.doctorName);
    }
    if (key === "location") {
      return multiplier * a.location.localeCompare(b.location);
    }
    return 0;
  });

  // Handle sort column click
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

  // Today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get appointment status
  const getStatus = (dateStr) => {
    const aptDate = new Date(dateStr);
    aptDate.setHours(0, 0, 0, 0);

    if (aptDate.getTime() === today.getTime()) return "today";
    if (aptDate < today) return "past";
    return "upcoming";
  };

  // Count stats
  const upcomingCount = sortedAppointments.filter(
    (apt) => getStatus(apt.date) === "upcoming"
  ).length;
  const completedCount = sortedAppointments.filter(
    (apt) => getStatus(apt.date) === "past"
  ).length;
  const todayCount = sortedAppointments.filter(
    (apt) => getStatus(apt.date) === "today"
  ).length;

  // Handle add appointment
  const handleAddAppointment = async (newAppointment) => {
    try {
      const created = await api.appointments.create(newAppointment);
      const normalized = normalizeAppointment(created);
      setAppointments((prev) => [...prev, normalized].filter(Boolean));
      setIsModalOpen(false);
    } catch (error) {
      showError(error.message || "Unable to add appointment");
    }
  };

  // Handle edit appointment
  const handleEditAppointment = async (updatedAppointment) => {
    try {
      const updated = await api.appointments.update(
        updatedAppointment.id,
        updatedAppointment
      );
      const normalized = normalizeAppointment(updated);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === updatedAppointment.id ? normalized : apt))
      );
      setEditingAppointment(null);
      setIsModalOpen(false);
    } catch (error) {
      showError(error.message || "Unable to update appointment");
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = (id) => {
    const appointment = appointments.find((apt) => apt.id === id);
    setDeleteConfirm({
      isOpen: true,
      appointmentId: id,
      appointmentTitle: appointment?.title || "this appointment",
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.appointmentId) {
      try {
        await api.appointments.delete(deleteConfirm.appointmentId);
        setAppointments((prev) =>
          prev.filter((apt) => apt.id !== deleteConfirm.appointmentId)
        );
      } catch (error) {
        showError(error.message || "Unable to delete appointment");
      }
    }
    setDeleteConfirm({
      isOpen: false,
      appointmentId: null,
      appointmentTitle: "",
    });
  };

  // Open modal for editing
  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  // Navigate years
  const goToPreviousYear = () => setSelectedYear(selectedYear - 1);
  const goToNextYear = () => setSelectedYear(selectedYear + 1);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      today: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Today",
      },
      upcoming: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        label: "Upcoming",
      },
      past: {
        bg: "bg-gray-100",
        text: "text-gray-500",
        label: "Completed",
      },
    };

    const style = styles[status];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-poppins font-medium ${style.bg} ${style.text}`}
      >
        {status === "past" && <CheckCircleIcon size={12} weight="fill" />}
        {style.label}
      </span>
    );
  };

  return (
    <div className="bg-background-default w-full overflow-x-hidden">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
        <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-6">
          {/* Header */}
          <PageHeader
            title="Appointments"
            description={`${sortedAppointments.length} appointment${
              sortedAppointments.length !== 1 ? "s" : ""
            } in ${selectedYear}`}
            action={
              <Button
                variant="primary"
                onClick={openAddModal}
                icon={<PlusIcon size={18} weight="bold" />}
                style={{ backgroundColor: primaryColor }}
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

          {/* Appointments table */}
          <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden shadow-sm">
            {sortedAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-default bg-background-subtle">
                      <th
                        onClick={() => handleSort("status")}
                        className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIndicator columnKey="status" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("date")}
                        className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      >
                        <div className="flex items-center">
                          Date & Time
                          <SortIndicator columnKey="date" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("title")}
                        className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      >
                        <div className="flex items-center">
                          Appointment
                          <SortIndicator columnKey="title" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("doctorName")}
                        className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      >
                        <div className="flex items-center">
                          Doctor
                          <SortIndicator columnKey="doctorName" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("location")}
                        className={`px-5 py-4 text-left ${textStyles.label.small} text-text-secondary uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors group select-none`}
                      >
                        <div className="flex items-center">
                          Location
                          <SortIndicator columnKey="location" />
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
                      const status = getStatus(apt.date);
                      const isPast = status === "past";
                      const isToday = status === "today";

                      return (
                        <tr
                          key={apt.id}
                          className={`border-b border-border-default transition-colors hover:bg-background-hover ${
                            isPast ? "opacity-50" : ""
                          } ${isToday ? "bg-amber-50/30" : ""}`}
                        >
                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span
                                className={`${textStyles.body.small} text-text-primary`}
                              >
                                {formatDate(apt.date)}
                              </span>
                              <span
                                className={`${textStyles.caption.small} mt-0.5`}
                              >
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
                            <div className="flex items-center gap-2">
                              <StethoscopeIcon
                                size={16}
                                weight="regular"
                                color={colors.icon.secondary}
                              />
                              <span className="font-poppins text-sm text-text-primary">
                                {apt.doctorName}
                              </span>
                            </div>
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
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(apt)}
                                className="p-2 rounded-lg hover:bg-blue-50 transition-colors group/edit relative"
                                aria-label="Edit appointment"
                                title="Edit appointment"
                              >
                                <PencilSimpleIcon
                                  size={18}
                                  weight="regular"
                                  className="text-icon-primary group-hover/edit:text-blue-500 transition-colors"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors group/delete relative"
                                aria-label="Delete appointment"
                                title="Delete appointment"
                              >
                                <TrashIcon
                                  size={18}
                                  weight="regular"
                                  className="text-icon-primary group-hover/delete:text-red-500 transition-colors"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <CalendarBlankIcon
                    size={32}
                    weight="light"
                    color={primaryColor}
                  />
                </div>
                <p className={`${textStyles.body.medium} text-text-primary`}>
                  No appointments in {selectedYear}
                </p>
                <p
                  className={`${textStyles.body.small} text-text-secondary mt-1 max-w-xs`}
                >
                  Schedule your medical appointments to keep track of your
                  healthcare
                </p>
                <button
                  onClick={openAddModal}
                  className={`mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl ${textStyles.label.medium} text-white transition-all hover:opacity-90`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <PlusIcon size={18} weight="bold" />
                  <span>Schedule Appointment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Appointment Modal */}
      {isModalOpen && (
        <AddAppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={
            editingAppointment ? handleEditAppointment : handleAddAppointment
          }
          appointment={editingAppointment}
          mode={mode}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            appointmentId: null,
            appointmentTitle: "",
          })
        }
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete "${deleteConfirm.appointmentTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default AppointmentsPage;
