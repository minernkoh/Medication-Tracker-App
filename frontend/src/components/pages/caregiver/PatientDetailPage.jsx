/**
 * PatientDetailPage Component - Detailed view of a single patient
 * Shows medications, appointments, and progress for a specific patient
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PillIcon,
  CalendarCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { formatDateLocale } from "../../../utils/dateUtils";
import {
  calculateSupplyStatus,
  filterMedsByStatus,
  normalizeMedication,
  normalizeAppointment,
} from "../../../utils";
import { MedicationSection } from "../../features";
import { DataTable, SectionHeader, StatCard, Button } from "../../ui";
import ActionButtons from "../../ui/ActionButtons";
import AddAppointmentModal from "../../modals/AddAppointmentModal";
import AddMedicationModal from "../../modals/AddMedicationModal";
import EditMedicationModal from "../../modals/EditMedicationModal";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { colors } from "../../../../tailwind.config.js";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";
import { getMedicationColor } from "../../../utils/medicationColors";

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

const getPatientColor = (patient) => {
  if (patient?.color) return patient.color;
  const base = patient?.id || patient?._id || "";
  const index = `${base}`.length % PATIENT_COLORS.length;
  return PATIENT_COLORS[index];
};

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const { showError } = useError();
  const todayStr = new Date().toISOString().split("T")[0];

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state: medications
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    medicationId: null,
    medicationName: "",
  });

  // Modal state: appointments
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentDeleteConfirm, setAppointmentDeleteConfirm] = useState({
    isOpen: false,
    appointmentId: null,
    appointmentTitle: "",
  });

  const loadPatient = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const [data, medsForToday] = await Promise.all([
        api.caregiver.getPatient(patientId),
        api.medications.getForPatient(patientId, todayStr),
      ]);
      const normalized = {
        ...data,
        id: data.id || data._id,
        initials:
          data.initials || getInitials(data.nickname || data.name || ""),
        color: getPatientColor(data),
        medications: (Array.isArray(medsForToday) ? medsForToday : [])
          .map(normalizeMedication)
          .filter(Boolean),
        appointments: (data.appointments || [])
          .map(normalizeAppointment)
          .filter(Boolean),
        alerts: data.alerts || [],
      };
      setPatientData(normalized);
    } catch (error) {
      showError(error.message || "Unable to load patient details");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, showError, todayStr]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const patient = patientData;

  // Separate medications by status
  const pendingMeds =
    patient?.medications?.filter((m) => m.status === "pending") || [];
  const takenMeds =
    patient?.medications?.filter((m) => m.status === "taken") || [];
  const supplyMeds = filterMedsByStatus(patient?.medications || [], "supply");

  const [supplySortConfig, setSupplySortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const parseQuantity = (quantityStr = "") => {
    const num = Number(quantityStr);
    return { value: Number.isFinite(num) ? num : 0, unit: "" };
  };

  const formatRefillDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getSupplyStatus = (medication) => {
    return calculateSupplyStatus(medication, parseQuantity);
  };

  const sortedSupplyMeds = [...supplyMeds].sort((a, b) => {
    const { key, direction } = supplySortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    switch (key) {
      case "name":
        return multiplier * (a.name || "").localeCompare(b.name || "");
      case "dosage":
        return multiplier * (a.dosage || "").localeCompare(b.dosage || "");
      case "quantity":
        return multiplier * (a.quantity || "").localeCompare(b.quantity || "");
      case "refillDate": {
        const dateA = a.refillDate ? new Date(a.refillDate).getTime() : 0;
        const dateB = b.refillDate ? new Date(b.refillDate).getTime() : 0;
        return multiplier * (dateA - dateB);
      }
      case "supplyStatus": {
        const statusA = getSupplyStatus(a);
        const statusB = getSupplyStatus(b);
        if (!statusA && !statusB) return 0;
        if (!statusA) return 1;
        if (!statusB) return -1;
        return multiplier * (statusA.percentage - statusB.percentage);
      }
      default:
        return 0;
    }
  });

  const supplyColumns = [
    {
      key: "name",
      label: "Medication",
      render: (value) => {
        const medicationColor = getMedicationColor(value);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: medicationColor.bg }}
              aria-hidden="true"
            >
              <PillIcon
                size={20}
                weight="fill"
                color={medicationColor.icon}
                aria-label={`${value} medication icon`}
              />
            </div>
            <span className="font-poppins font-semibold text-sm text-text-primary">
              {value}
            </span>
          </div>
        );
      },
    },
    {
      key: "dosage",
      label: "Dose/Frequency",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-poppins text-sm text-text-primary">
            {value ?? "—"} {row?.unit || ""}
          </span>
          <span className="font-poppins text-[10px] text-text-secondary uppercase">
            {row.frequency || "daily"}
          </span>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Total Quantity",
      render: (value, row) => (
        <span className="font-poppins text-sm font-medium text-text-primary">
          {value ?? "N/A"}{" "}
          {value !== undefined && value !== null ? row?.unit || "" : ""}
        </span>
      ),
    },
    {
      key: "supplyStatus",
      label: "Supply Status",
      render: (value, row) => {
        const status = getSupplyStatus(row);
        if (!status) {
          return (
            <span className="font-poppins text-sm text-text-secondary">
              Not calculated
            </span>
          );
        }
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-poppins font-medium ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      key: "recommendSupply",
      label: "Recommend Supply",
      render: (value, row) => {
        const status = getSupplyStatus(row);
        const needsRefill = status && status.percentage < 30;
        return (
          <span className="font-poppins text-sm text-text-primary">
            {needsRefill ? `${row.initialQuantity || 30} ${row.unit || ""}` : "—"}
          </span>
        );
      },
    },
    {
      key: "refill",
      label: "Refill?",
      render: (value, row) => {
        const status = getSupplyStatus(row);
        const needsRefill = status && status.percentage < 30;
        return (
          <span
            className={`font-poppins text-sm font-semibold ${needsRefill ? "text-red-600" : "text-emerald-600"}`}
          >
            {needsRefill ? "Yes" : "No"}
          </span>
        );
      },
    },
  ];

  // Calculate stats - only count medications with pending or taken status
  const activeMedications =
    patient?.medications?.filter(
      (m) => m.status === "pending" || m.status === "taken",
    ) || [];
  const adherenceRate =
    activeMedications.length > 0
      ? Math.round((takenMeds.length / activeMedications.length) * 100)
      : 0;
  const adherenceHistory = Array.isArray(patient?.adherenceHistory)
    ? patient.adherenceHistory
    : [];

  const handleAddMedication = async (medicationData) => {
    try {
      await api.medications.createForPatient(patientId, medicationData);
      setShowAddMedicationModal(false);
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to add medication");
    }
  };

  // Mark medication as taken (uses daily log + quantity updates)
  const handleMarkAsTaken = async (med) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    try {
      const timeSlot = med?.timeOfDay || med?.timesOfDay?.[0];
      await api.medications.markAsTaken(
        med.id,
        currentTime,
        todayStr,
        timeSlot,
      );
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to update medication status");
      loadPatient();
    }
  };

  // Handler to edit a medication
  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (
        updatedMedication?.takenDate &&
        updatedMedication?.status === "taken"
      ) {
        const todayStr = new Date().toISOString().split("T")[0];
        const targetDate = updatedMedication.takenDate;
        if (targetDate !== todayStr) {
          await api.medications.undoMarkAsTaken(updatedMedication.id, todayStr);
        }
        await api.medications.markAsTaken(
          updatedMedication.id,
          updatedMedication.takenTime,
          targetDate,
        );
      } else {
        const updated = await api.medications.updateForPatient(
          patientId,
          updatedMedication.id,
          updatedMedication,
        );
        const normalized = normalizeMedication(updated);
        setPatientData((prevData) => ({
          ...prevData,
          medications: prevData.medications.map((med) =>
            med.id === updatedMedication.id ? normalized : med,
          ),
        }));
      }
      setShowEditModal(false);
      setEditingMedication(null);
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to update medication");
    }
  };

  // Undo "taken" for today (restores quantity + removes today's log entry)
  const handleUndoTakenMedication = async (med) => {
    try {
      const timeSlot = med?.timeOfDay || med?.timesOfDay?.[0];
      await api.medications.undoMarkAsTaken(med.id, todayStr, timeSlot);
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to undo medication");
    }
  };

  const requestDeleteMedication = (medication) => {
    setDeleteConfirm({
      isOpen: true,
      medicationId: medication?.id,
      medicationName: medication?.name || "this medication",
    });
  };

  const confirmDeleteMedication = async () => {
    const medId = deleteConfirm.medicationId;
    if (!medId) return;
    try {
      await api.medications.deleteForPatient(patientId, medId);
      setDeleteConfirm({
        isOpen: false,
        medicationId: null,
        medicationName: "",
      });
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to delete medication");
    }
  };

  const openAddAppointmentModal = () => {
    setEditingAppointment(null);
    setShowAppointmentModal(true);
  };

  const openEditAppointmentModal = (appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment?.id) {
        await api.appointments.updateForPatient(
          patientId,
          editingAppointment.id,
          { ...appointmentData, id: editingAppointment.id },
        );
      } else {
        await api.appointments.createForPatient(patientId, appointmentData);
      }
      setShowAppointmentModal(false);
      setEditingAppointment(null);
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to save appointment");
    }
  };

  const requestDeleteAppointment = (appointment) => {
    setAppointmentDeleteConfirm({
      isOpen: true,
      appointmentId: appointment?.id,
      appointmentTitle: appointment?.title || "this appointment",
    });
  };

  const confirmDeleteAppointment = async () => {
    const apptId = appointmentDeleteConfirm.appointmentId;
    if (!apptId) return;
    try {
      await api.appointments.deleteForPatient(patientId, apptId);
      setAppointmentDeleteConfirm({
        isOpen: false,
        appointmentId: null,
        appointmentTitle: "",
      });
      await loadPatient();
    } catch (error) {
      showError(error.message || "Unable to delete appointment");
    }
  };

  const handleDeleteTakenMedication = (med) => {
    // In this UI, the "delete" icon on Taken cards is treated as "undo taken for today"
    handleUndoTakenMedication(med);
  };

  if (isLoading) {
    return (
      <div className="bg-background-default w-full p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-poppins text-text-secondary">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-background-default w-full p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <p className="font-poppins text-text-secondary">Patient not found.</p>
        </div>
      </div>
    );
  }

  const headerDetails = [
    patient.relationship,
    patient.age ? `${patient.age} years old` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="bg-background-default w-full p-6 md:p-10">
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
                <p className="font-poppins text-text-secondary">
                  {patient.name}
                </p>
                {headerDetails && (
                  <p className="font-poppins text-sm text-text-secondary mt-1">
                    {headerDetails}
                  </p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 md:ml-auto" />
          </div>

          {/* Alerts */}
          {patient.alerts?.length > 0 && (
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
                    <span className="font-poppins text-sm font-medium">
                      {alert.message}
                    </span>
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
              <p className="font-poppins text-sm text-text-secondary">
                {patient.notes}
              </p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
          <StatCard
            icon={<PillIcon size={20} weight="fill" />}
            iconColor={modeHexColor}
            label="Today"
            value={`${takenMeds.length}/${activeMedications.length}`}
            description="Medications"
          />
          <StatCard
            icon={<CalendarCheckIcon size={20} weight="fill" />}
            iconColor={colors.primary.DEFAULT}
            label="Upcoming"
            value={patient.appointments?.length || 0}
            description="Appointments"
          />
        </div>

        {/* Medications section */}

        <div className="bg-background-default border border-border-default rounded-2xl p-6 mb-6">
          <SectionHeader
            icon={
              <PillIcon
                size={24}
                weight="regular"
                color={colors.icon.primary}
              />
            }
            title="Medications"
            description="Manage this patient's medications"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} weight="bold" />}
                style={{ backgroundColor: modeHexColor }}
                onClick={() => setShowAddMedicationModal(true)}
              >
                Add
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
              onEdit={handleEditMedication}
              onDelete={handleDeleteTakenMedication}
              showTimeGroups={true}
              compact={false}
            />
          </div>
        </div>

        {showAddMedicationModal && (
          <AddMedicationModal
            isOpen={showAddMedicationModal}
            onClose={() => setShowAddMedicationModal(false)}
            onSave={handleAddMedication}
            mode="Caregiver"
          />
        )}

        {showEditModal && editingMedication && (
          <EditMedicationModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingMedication(null);
            }}
            onSave={handleSaveEditedMedication}
            medication={editingMedication}
            mode="Caregiver"
          />
        )}

        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() =>
            setDeleteConfirm({
              isOpen: false,
              medicationId: null,
              medicationName: "",
            })
          }
          onConfirm={confirmDeleteMedication}
          title="Delete Medication"
          message={`Are you sure you want to delete ${deleteConfirm.medicationName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        {/* Current supply */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6 mb-6">
          <SectionHeader
            icon={
              <PillIcon
                size={24}
                weight="regular"
                color={colors.icon.primary}
              />
            }
            title="Current Supply"
            description="Inventory and refills"
            action={
              <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                {supplyMeds.length} in supply
              </span>
            }
          />

          <div className="mt-4">
            <DataTable
              columns={supplyColumns}
              data={sortedSupplyMeds}
              sortConfig={supplySortConfig}
              onSort={setSupplySortConfig}
              onEdit={(row) => handleEditMedication(row)}
              onDelete={(row) => requestDeleteMedication(row)}
              emptyMessage="No medications in supply"
              emptySubMessage="Add a medication with quantity to track supply"
              EmptyIcon={PillIcon}
              mode="Caregiver"
            />
          </div>
        </div>

        {/* Appointments section */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6">
          <SectionHeader
            icon={
              <CalendarCheckIcon
                size={24}
                weight="regular"
                color={colors.icon.primary}
              />
            }
            title="Upcoming Appointments"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} weight="bold" />}
                style={{ backgroundColor: modeHexColor }}
                onClick={openAddAppointmentModal}
              >
                Add
              </Button>
            }
          />

          {patient.appointments?.length > 0 ? (
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-background-subtle rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${modeHexColor}15` }}
                    >
                      <CalendarCheckIcon
                        size={24}
                        weight="fill"
                        color={modeHexColor}
                      />
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-text-primary">
                        {apt.title}
                      </p>
                      <p className="font-poppins text-sm text-text-secondary">
                        {apt.doctorName} • {apt.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-poppins font-semibold text-text-primary">
                        {formatDateLocale(apt.date)}
                      </p>
                      <p className="font-poppins text-sm text-text-secondary">
                        {apt.time}
                      </p>
                    </div>
                    <ActionButtons
                      onEdit={() => openEditAppointmentModal(apt)}
                      onDelete={() => requestDeleteAppointment(apt)}
                      size="base"
                      editLabel="Edit appointment"
                      deleteLabel="Delete appointment"
                    />
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

        {showAppointmentModal && (
          <AddAppointmentModal
            isOpen={showAppointmentModal}
            onClose={() => {
              setShowAppointmentModal(false);
              setEditingAppointment(null);
            }}
            onSave={handleSaveAppointment}
            appointment={editingAppointment}
            mode="Caregiver"
          />
        )}

        <ConfirmDialog
          isOpen={appointmentDeleteConfirm.isOpen}
          onClose={() =>
            setAppointmentDeleteConfirm({
              isOpen: false,
              appointmentId: null,
              appointmentTitle: "",
            })
          }
          onConfirm={confirmDeleteAppointment}
          title="Delete Appointment"
          message={`Are you sure you want to delete \"${appointmentDeleteConfirm.appointmentTitle}\"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        {/* Adherence chart placeholder */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6 mt-6">
          <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">
            Weekly Adherence
          </h2>
          {adherenceHistory.length > 0 ? (
            <div className="flex items-end justify-between h-32 gap-2">
              {adherenceHistory.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${value}%`,
                      backgroundColor:
                        value >= 90
                          ? colors.success.DEFAULT
                          : value >= 70
                            ? colors.warning.DEFAULT
                            : colors.danger.DEFAULT,
                    }}
                  />
                  <span className="font-poppins text-xs text-text-secondary">
                    {["M", "T", "W", "T", "F", "S", "S"][index]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-poppins text-sm text-text-secondary">
              No adherence data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetailPage;
