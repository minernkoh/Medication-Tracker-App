/**
 * PatientDetailPage Component - Detailed view of a single patient
 * Shows medications, appointments, and progress for a specific patient
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PillIcon,
  CalendarCheckIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { formatDateLocale } from "../../../utils/dateUtils";
import {
  calculateSupplyStatus,
  filterMedsByStatus,
  getNowTimeInputRounded,
  normalizeMedication,
  normalizeAppointment,
  to12HourDisplay,
} from "../../../utils";
import { MedicationSection } from "../../features";
import { Card, DataTable, PieChart, SectionHeader, StatCard, Button } from "../../ui";
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
  const base = patient?.id || patient?._id || patient?.email || patient?.name || "";
  const str = String(base);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return PATIENT_COLORS[hash % PATIENT_COLORS.length];
};

// Convert a Date (or now) to a local YYYY-MM-DD string.
// Avoids UTC day shifts from Date#toISOString() in non-UTC timezones.
const toLocalIsoDay = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const { showError } = useError();
  const todayStr = toLocalIsoDay();

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adherenceRange, setAdherenceRange] = useState("weekly"); // weekly | monthly | yearly

  // Modal state: medications
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [editingSupplyMedication, setEditingSupplyMedication] = useState(null);
  const [showSupplyEditModal, setShowSupplyEditModal] = useState(false);
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
        avatarInitials: getInitials(data.name || ""),
        avatarColor: getPatientColor(data),
        adherence: data.adherence || null,
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

  const isScheduledMedication = (med) => {
    if (!med) return false;
    if (med.timeOfDay) return true;
    if (Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0) return true;
    return false;
  };

  // Separate medications by status
  const pendingMeds =
    patient?.medications?.filter((m) => m.status === "pending") || [];
  const takenMeds =
    patient?.medications?.filter((m) => m.status === "taken") || [];
  const supplyMeds = filterMedsByStatus(patient?.medications || [], "supply");

  const parseQuantity = (quantityStr = "") => {
    const num = Number(quantityStr);
    return { value: Number.isFinite(num) ? num : 0, unit: "" };
  };

  const getSupplyStatus = (medication) => {
    return calculateSupplyStatus(medication, parseQuantity);
  };

  const supplyColumns = [
    {
      key: "name",
      label: "Name",
      sortValue: (row) => row?.name || "",
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
      sortValue: (row) => Number(row?.dosage ?? 0),
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
      key: "instructions",
      label: "Instructions",
      sortValue: (row) => {
        const value = row?.instructions;
        const instructionsList = Array.isArray(value)
          ? value
          : typeof value === "string"
            ? value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        const notes = String(row?.additionalInfo || "").trim();
        return instructionsList.length > 0
          ? instructionsList.join(", ")
          : notes || "";
      },
      render: (value, row) => {
        const instructionsList = Array.isArray(value)
          ? value
          : typeof value === "string"
            ? value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

        if (instructionsList.length > 0) {
          return (
            <div className="flex flex-wrap gap-1 max-w-[240px]">
              {instructionsList.map((instruction) => (
                <span
                  key={instruction}
                  title={instruction}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-semibold bg-background-hover text-text-secondary border border-border-subtle max-w-[220px] truncate"
                >
                  {instruction}
                </span>
              ))}
            </div>
          );
        }

        const notes = String(row?.additionalInfo || "").trim();
        if (notes) {
          return (
            <span className="font-poppins text-sm text-text-primary max-w-[260px] whitespace-normal break-words">
              {notes}
            </span>
          );
        }

        return <span className="font-poppins text-sm text-text-secondary">—</span>;
      },
    },
    {
      key: "quantity",
      label: "Total Quantity",
      sortValue: (row) => Number(row?.quantity ?? 0),
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
      sortValue: (row) => getSupplyStatus(row)?.ratio ?? null,
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
      label: "Recommended Supply",
      sortValue: (row) => Number(row?.recommendSupply ?? 0),
      render: (value, row) => (
        <span className="font-poppins text-sm text-text-primary">
          {value ? `${value} ${row.unit || ""}` : "—"}
        </span>
      ),
    },
  ];

  // Today's adherence (Caregiver): scheduled medications only.
  // A medication counts as "taken" if ANY schedule slot has a log for today,
  // which is exactly what GET /patients/:id/medications?date=YYYY-MM-DD encodes
  // via `status === "taken"` for that day.
  const scheduledMedsToday = (patient?.medications || []).filter(isScheduledMedication);
  const totalScheduledToday = scheduledMedsToday.length;
  const takenScheduledToday = scheduledMedsToday.filter(
    (m) => String(m?.status || "").toLowerCase() === "taken",
  ).length;
  const pendingScheduledToday = Math.max(totalScheduledToday - takenScheduledToday, 0);

  const adherence = patient?.adherence?.[adherenceRange] || null;
  const adherenceLabels = Array.isArray(adherence?.labels) ? adherence.labels : [];
  const adherenceValues = Array.isArray(adherence?.values) ? adherence.values : [];
  const adherenceIsEmpty =
    (adherence?.expectedTotal || 0) === 0 && (adherence?.takenTotal || 0) === 0;

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
    const currentTime = to12HourDisplay(getNowTimeInputRounded(15, "nearest"));

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

  const handleEditSupplyMedication = (medication) => {
    setEditingSupplyMedication(medication);
    setShowSupplyEditModal(true);
  };

  const handleSaveEditedMedication = async (updatedMedication) => {
    try {
      if (
        updatedMedication?.takenDate &&
        updatedMedication?.status === "taken"
      ) {
        const todayStr = toLocalIsoDay();
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

  const handleSaveSupplyMedication = async (updatedMedication) => {
    try {
      await api.medications.updateForPatient(
        patientId,
        updatedMedication.id,
        updatedMedication,
      );
      setShowSupplyEditModal(false);
      setEditingSupplyMedication(null);
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

  const headerDetails = [patient.age ? `${patient.age} years old` : null]
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
                style={{ backgroundColor: patient.avatarColor }}
              >
                {patient.avatarInitials}
              </div>
              <div>
                <h1 className="font-poppins font-bold text-2xl text-text-primary">
                  {patient.name}
                </h1>
                {headerDetails && (
                  <p className="font-poppins text-base text-text-secondary mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<PillIcon size={20} weight="fill" />}
            iconColor={modeHexColor}
            label="Today"
            value={`${takenMeds.length}/${activeMedications.length}`}
            description="Medications"
            className="h-full"
          />
          <StatCard
            icon={<CalendarCheckIcon size={20} weight="fill" />}
            iconColor={colors.primary.DEFAULT}
            label="Upcoming"
            value={patient.appointments?.length || 0}
            description="Appointments"
            className="h-full"
          />
          <Card className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                  color={colors.success.DEFAULT}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="font-poppins text-xs text-text-secondary leading-tight">
                  Today
                </p>
                <p className="font-poppins text-sm font-semibold text-text-primary leading-tight">
                  Adherence
                </p>
                <p className="font-poppins text-xs text-text-secondary leading-tight">
                  {totalScheduledToday > 0
                    ? `${takenScheduledToday}/${totalScheduledToday} medications taken`
                    : "No scheduled medications"}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center pt-4">
              <PieChart
                taken={takenScheduledToday}
                notTaken={pendingScheduledToday}
                size={120}
                label="Adherence"
                showLabel={false}
              />
            </div>
          </Card>
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
                variant="secondary"
                size="sm"
                icon={<PlusIcon size={16} weight="bold" />}
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
              mode="Caregiver"
            />
            <MedicationSection
              variant="taken"
              medications={takenMeds}
              onEdit={handleEditMedication}
              onDelete={handleDeleteTakenMedication}
              showTimeGroups={true}
              compact={false}
              mode="Caregiver"
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

        {showSupplyEditModal && editingSupplyMedication && (
          <AddMedicationModal
            isOpen={showSupplyEditModal}
            onClose={() => {
              setShowSupplyEditModal(false);
              setEditingSupplyMedication(null);
            }}
            onSave={handleSaveSupplyMedication}
            medication={editingSupplyMedication}
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
          mode="Caregiver"
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
              data={supplyMeds}
              defaultSortConfig={{ key: "name", direction: "asc" }}
              onEdit={(row) => handleEditSupplyMedication(row)}
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
                variant="secondary"
                size="sm"
                icon={<PlusIcon size={16} weight="bold" />}
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
                      mode="Caregiver"
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
          message={`Are you sure you want to delete "${appointmentDeleteConfirm.appointmentTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          mode="Caregiver"
        />

        {/* Adherence chart placeholder */}
        <div className="bg-background-default border border-border-default rounded-2xl p-6 mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-poppins font-bold text-xl text-text-primary">
              Adherence
            </h2>
            <div
              className="inline-flex items-center gap-1 bg-background-subtle border border-border-default rounded-xl p-1"
              role="tablist"
              aria-label="Adherence range"
            >
              {[
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
                { key: "yearly", label: "Yearly" },
              ].map((tab) => {
                const isActive = tab.key === adherenceRange;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setAdherenceRange(tab.key)}
                    className={`h-8 px-3 rounded-lg font-poppins text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-background-default text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {adherence && !adherenceIsEmpty && adherenceValues.length > 0 ? (
            <div className="flex items-stretch justify-between h-32 gap-2 mt-4">
              {Array.from({
                length: Math.max(adherenceValues.length, adherenceLabels.length),
              }).map((_, index) => {
                const rawValue = Number(adherenceValues[index] ?? 0);
                const value = Number.isFinite(rawValue)
                  ? Math.max(0, Math.min(100, rawValue))
                  : 0;
                const label = adherenceLabels[index] || "";
                const barColor =
                  value >= 90
                    ? colors.success.DEFAULT
                    : value >= 70
                      ? colors.warning.DEFAULT
                      : colors.danger.DEFAULT;

                return (
                  <div
                    key={`${label}-${index}`}
                    className="flex-1 flex flex-col items-center gap-2 h-full"
                  >
                    {/* Fixed-height track so % bar heights render correctly */}
                    <div className="w-full flex-1 flex items-end bg-background-hover rounded-lg overflow-hidden border border-border-subtle">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${value}%`,
                          backgroundColor: barColor,
                        }}
                        aria-label={`${label} adherence ${value}%`}
                        title={`${label} • ${value}%`}
                      />
                    </div>
                    <span className="font-poppins text-xs text-text-secondary">
                      {label}
                    </span>
                  </div>
                );
              })}
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
