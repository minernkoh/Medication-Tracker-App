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
  PencilSimpleIcon,
  TrashIcon,
  PhoneIcon,
  HeartIcon,
  TrendUpIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { formatDateLocale } from "../../../utils/dateUtils";
import { normalizeMedication, normalizeAppointment } from "../../../utils";
import { MedicationSection } from "../../features";
import { SectionHeader, StatCard, Button } from "../../ui";
import EditMedicationModal from "../../modals/EditMedicationModal";
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

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add state for edit modal control
  const [editingMedication, setEditingMedication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadPatient = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const data = await api.caregiver.getPatient(patientId);
      const normalized = {
        ...data,
        id: data.id || data._id,
        initials: data.initials || getInitials(data.nickname || data.name || ""),
        color: getPatientColor(data),
        medications: (data.medications || [])
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
  }, [patientId, showError]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const patient = patientData;

  // Separate medications by status
  const pendingMeds = patient?.medications?.filter((m) => m.status === "pending") || [];
  const takenMeds = patient?.medications?.filter((m) => m.status === "taken") || [];

  // Calculate stats - only count medications with pending or taken status
  const activeMedications = patient?.medications?.filter(
    (m) => m.status === "pending" || m.status === "taken"
  ) || [];
  const adherenceRate =
    activeMedications.length > 0
      ? Math.round((takenMeds.length / activeMedications.length) * 100)
      : 0;
  const adherenceHistory = Array.isArray(patient?.adherenceHistory)
    ? patient.adherenceHistory
    : [];
  const avgAdherence =
    adherenceHistory.length > 0
      ? Math.round(
          adherenceHistory.reduce((a, b) => a + b, 0) / adherenceHistory.length
        )
      : patient?.adherenceRate || 0;

  // Handler to mark medication as taken
  const handleMarkAsTaken = async (medId) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setPatientData((prevData) => ({
      ...prevData,
      medications: prevData.medications.map((med) =>
        med.id === medId
          ? { ...med, taken: true, status: "taken", takenTime: currentTime }
          : med
      ),
    }));

    try {
      await api.medications.updateForPatient(patientId, medId, {
        taken: true,
        status: "taken",
        takenTime: currentTime,
      });
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
      const updated = await api.medications.updateForPatient(
        patientId,
        updatedMedication.id,
        updatedMedication
      );
      const normalized = normalizeMedication(updated);
      setPatientData((prevData) => ({
        ...prevData,
        medications: prevData.medications.map((med) =>
          med.id === updatedMedication.id ? normalized : med
        ),
      }));
      setShowEditModal(false);
      setEditingMedication(null);
    } catch (error) {
      showError(error.message || "Unable to update medication");
    }
  };

  // When user clicks delete on "taken today" section, move medication back to pending
  // This restores the medication to its pending state instead of permanently deleting it
  const handleDeleteMedication = async (medId) => {
    try {
      await api.medications.deleteForPatient(patientId, medId);
      setPatientData((prevData) => ({
        ...prevData,
        medications: prevData.medications.filter((med) => med.id !== medId),
      }));
    } catch (error) {
      showError(error.message || "Unable to delete medication");
    }
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
            <div className="flex gap-3 md:ml-auto">
              <a
                href={patient.phone ? `tel:${patient.phone}` : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default font-poppins font-medium text-sm transition-colors ${
                  patient.phone
                    ? "hover:bg-background-hover"
                    : "opacity-50 cursor-not-allowed"
                }`}
                aria-disabled={!patient.phone}
              >
                <PhoneIcon
                  size={18}
                  weight="regular"
                  color={colors.text.primary}
                />
                Call
              </a>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-poppins font-semibold text-sm text-white"
                style={{ backgroundColor: modeHexColor }}
              >
                <PencilSimpleIcon size={18} weight="regular" />
                Edit Profile
              </button>
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<PillIcon size={20} weight="fill" />}
            iconColor={modeHexColor}
            label="Today"
            value={`${takenMeds.length}/${activeMedications.length}`}
            description="Medications"
          />
          <StatCard
            icon={<TrendUpIcon size={20} weight="fill" />}
            iconColor={colors.success.DEFAULT}
            label="Weekly"
            value={`${avgAdherence}%`}
            description="Avg Adherence"
          />
          <StatCard
            icon={<CalendarCheckIcon size={20} weight="fill" />}
            iconColor={colors.primary.DEFAULT}
            label="Upcoming"
            value={patient.appointments?.length || 0}
            description="Appointments"
          />
          <StatCard
            icon={<HeartIcon size={20} weight="fill" />}
            iconColor={colors.danger.DEFAULT}
            label="Blood Type"
            value={patient.bloodType || "—"}
            description="Type"
          />
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
            onEdit={handleEditMedication}
            onDelete={handleDeleteMedication}
            showTimeGroups={true}
            compact={false}
          />
        </div>

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
                        {apt.doctor} • {apt.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-poppins font-semibold text-text-primary">
                      {formatDateLocale(apt.date)}
                    </p>
                    <p className="font-poppins text-sm text-text-secondary">
                      {apt.time}
                    </p>
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
