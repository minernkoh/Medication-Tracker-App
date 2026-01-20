/**
 * PatientDetailPage Component - Detailed view of a single patient
 * Shows medications, appointments, and progress for a specific patient
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PillIcon,
  CalendarCheckIcon,
  PlusIcon,
  WarningCircleIcon,
  StethoscopeIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { formatDateLocale } from "../../../utils/dateUtils";
import {
  calculateSupplyStatus,
  filterMedsByStatus,
  formatDateNumeric,
  formatTime,
  getNowTimeInputRounded,
  getAppointmentDisplayStatus,
  getAppointmentStatusPillClass,
  getAppointmentStatusSortRank,
  normalizeMedication,
  normalizeAppointment,
  toTimeInput,
  to12HourDisplay,
} from "../../../utils";
import { Calendar, MedicationSection } from "../../features";
import {
  DataTable,
  TodayAdherencePieChart,
  SectionHeader,
  Button,
  SelectMenu,
} from "../../ui";
import AddAppointmentModal from "../../modals/AddAppointmentModal";
import AddMedicationModal from "../../modals/AddMedicationModal";
import EditMedicationModal from "../../modals/EditMedicationModal";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";
import { getMedicationColor } from "../../../utils/medicationColors";
import {
  getPatientAvatarColor,
  getPatientInitials,
} from "../../../utils/patientUtils";
import { getStartOfWeek, MONTHS } from "../../../utils";
import { limitConcurrency } from "../../../utils/requestUtils";

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
  const { showError } = useError();

  // Calendar date selection (same behavior as Dashboard)
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleWeekStart, setVisibleWeekStart] = useState(() =>
    getStartOfWeek(new Date()),
  );
  const selectedDateStr = toLocalIsoDay(selectedDate);

  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adherenceRange, setAdherenceRange] = useState("weekly"); // weekly | monthly | yearly
  const [weekAdherence, setWeekAdherence] = useState({});

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
        api.medications.getForPatient(patientId, selectedDateStr),
      ]);
      const normalized = {
        ...data,
        id: data.id || data._id,
        avatarInitials: getPatientInitials(data.name || ""),
        avatarColor: getPatientAvatarColor(data),
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
  }, [patientId, selectedDateStr, showError]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const patient = patientData;

  const isSelectedDateToday = useCallback(() => {
    const todayLocal = new Date();
    return (
      selectedDate.getDate() === todayLocal.getDate() &&
      selectedDate.getMonth() === todayLocal.getMonth() &&
      selectedDate.getFullYear() === todayLocal.getFullYear()
    );
  }, [selectedDate]);

  const formatSelectedDateForLabel = useCallback(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[selectedDate.getDay()];
    const monthName = MONTHS[selectedDate.getMonth()].slice(0, 3);
    const date = selectedDate.getDate();
    return `${dayName}, ${monthName} ${date}`;
  }, [selectedDate]);

  const dateLabel = isSelectedDateToday() ? null : formatSelectedDateForLabel();

  const calendarAppointments = useMemo(() => {
    const list = Array.isArray(patient?.appointments)
      ? patient.appointments
      : [];
    return list.filter((appt) => {
      const status = String(appt?.status || "").toLowerCase();
      return (
        status !== "completed" && status !== "cancelled" && status !== "missed"
      );
    });
  }, [patient?.appointments]);

  const isScheduledMedication = (med) => {
    if (!med) return false;
    if (med.timeOfDay) return true;
    if (Array.isArray(med.timesOfDay) && med.timesOfDay.length > 0) return true;
    return false;
  };

  const formatSlotLabel = (slot) => {
    const normalized = toTimeInput(slot);
    return normalized ? to12HourDisplay(normalized) : String(slot || "");
  };

  const formatTakenTimeForSlot = (med, slot) => {
    const takenAt = med?.takenTimesBySlot?.[slot];
    if (takenAt) {
      const date = new Date(takenAt);
      if (!Number.isNaN(date.getTime())) {
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        return to12HourDisplay(`${hh}:${mm}`);
      }
    }
    return formatSlotLabel(slot);
  };

  const splitMedicationsBySlot = (meds = []) => {
    const pending = [];
    const taken = [];

    meds.forEach((med) => {
      const scheduledSlots = Array.isArray(med?.scheduledSlots)
        ? med.scheduledSlots
        : Array.isArray(med?.timesOfDay) && med.timesOfDay.length > 0
          ? med.timesOfDay
          : med?.timeOfDay
            ? [med.timeOfDay]
            : [];

      const takenSlotsSet = new Set(
        Array.isArray(med?.takenSlots) ? med.takenSlots : [],
      );

      const pendingSlots = Array.isArray(med?.pendingSlots)
        ? med.pendingSlots
        : scheduledSlots.filter((slot) => !takenSlotsSet.has(slot));

      if (!scheduledSlots.length) {
        if (med.status === "taken") {
          taken.push(med);
        } else {
          pending.push(med);
        }
        return;
      }

      const buildSlotEntry = (slot, status) => ({
        ...med,
        // Keep a stable reference to the real medication id (Mongo ObjectId string).
        // `id` below is intentionally made unique per slot for React list keys.
        medicationId: med.id,
        id: `${med.id}-${slot}-${status}`,
        status,
        timeOfDay: slot,
        timesOfDay: [slot],
        takenTime:
          status === "taken"
            ? formatTakenTimeForSlot(med, slot)
            : med.takenTime,
        slot,
        sourceMedication: med,
      });

      pendingSlots.forEach((slot) => {
        pending.push(buildSlotEntry(slot, "pending"));
      });

      scheduledSlots.forEach((slot) => {
        if (takenSlotsSet.has(slot)) {
          taken.push(buildSlotEntry(slot, "taken"));
        }
      });
    });

    return { pending, taken };
  };

  // Separate medications by status (slot-level)
  const splitMeds = splitMedicationsBySlot(patient?.medications || []);
  const pendingMeds = splitMeds.pending;
  const takenMeds = splitMeds.taken;
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

        return (
          <span className="font-poppins text-sm text-text-secondary">—</span>
        );
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
      key: "recommendSupply",
      label: "Recommended Supply",
      sortValue: (row) => Number(row?.recommendSupply ?? 0),
      render: (value, row) => (
        <span className="font-poppins text-sm text-text-primary">
          {value ? `${value} ${row.unit || ""}` : "—"}
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
  ];

  const appointmentColumns = [
    {
      key: "date",
      label: "Date & Time",
      sortValue: (row) => {
        const dateStr = row?.date;
        if (!dateStr) return null;
        const timeStr = toTimeInput(row?.time || "");
        const dt = timeStr
          ? new Date(`${dateStr}T${timeStr}`)
          : new Date(dateStr);
        return Number.isNaN(dt.getTime()) ? null : dt;
      },
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-poppins text-sm text-text-primary">
            {formatDateNumeric(value) || "—"}
          </span>
          <span className="font-poppins text-xs text-text-secondary mt-0.5">
            {formatTime(row?.time) || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Appointment",
      sortValue: (row) => row?.title || "",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-poppins font-semibold text-sm text-text-primary">
            {value || "—"}
          </span>
          {row?.notes ? (
            <span className="font-poppins text-xs text-text-secondary mt-0.5 italic max-w-[240px] truncate">
              {row.notes}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "doctorName",
      label: "Doctor",
      sortValue: (row) => row?.doctorName || "",
      render: (value) => (
        <div className="flex items-center gap-2">
          <StethoscopeIcon
            size={16}
            weight="regular"
            className="text-icon-secondary"
          />
          <span className="font-poppins text-sm text-text-primary">
            {value || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortValue: (row) => row?.location || "",
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPinIcon
            size={16}
            weight="regular"
            className="text-icon-secondary"
          />
          <span className="font-poppins text-sm text-text-primary max-w-[220px] truncate">
            {value || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortValue: (row) => getAppointmentStatusSortRank(row),
      render: (_value, row) => (
        <SelectMenu
          value={row?.status || "Scheduled"}
          onChange={(next) => handleUpdateAppointmentStatus(row, next)}
          options={[
            { value: "Scheduled", label: "Scheduled" },
            { value: "Completed", label: "Completed" },
            { value: "Missed", label: "Missed" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
          variant="pill"
          mode="Caregiver"
          aria-label="Appointment status"
          fullWidth={false}
          buttonClassName={getAppointmentStatusPillClass(row)}
        />
      ),
    },
  ];

  // Today's adherence (Caregiver): scheduled medications only.
  // A medication counts as "taken" if ANY schedule slot has a log for today,
  // which is exactly what GET /patients/:id/medications?date=YYYY-MM-DD encodes
  // via `status === "taken"` for that day.
  const scheduledMedsToday = (patient?.medications || []).filter(
    isScheduledMedication,
  );
  const totalScheduledToday = scheduledMedsToday.length;
  const takenScheduledToday = scheduledMedsToday.filter(
    (m) => String(m?.status || "").toLowerCase() === "taken",
  ).length;
  const pendingScheduledToday = Math.max(
    totalScheduledToday - takenScheduledToday,
    0,
  );

  const scrollToSection = (id) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { upcomingAppointmentsCount, upcomingAppointmentsPreview } = (() => {
    const list = Array.isArray(patient?.appointments)
      ? patient.appointments
      : [];
    const now = new Date();
    const parsed = list
      .map((apt) => {
        const dateStr = apt?.date;
        if (!dateStr) return null;
        const time24 = toTimeInput(apt?.time || "");
        const dt = time24
          ? new Date(`${dateStr}T${time24}`)
          : new Date(dateStr);
        if (Number.isNaN(dt.getTime())) return null;
        return {
          ...apt,
          _dateTime: dt,
          _dateStr: dateStr,
          _displayTime: time24 ? to12HourDisplay(time24) : "",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a._dateTime - b._dateTime);

    const upcoming = parsed.filter((apt) => apt._dateTime >= now);
    return {
      upcomingAppointmentsCount: upcoming.length,
      upcomingAppointmentsPreview: upcoming.slice(0, 3),
    };
  })();

  const { lowSupplyCount, lowSupplyPreview } = (() => {
    const list = Array.isArray(supplyMeds) ? supplyMeds : [];
    const flagged = list
      .map((m) => ({ med: m, status: getSupplyStatus(m) }))
      .filter(
        ({ status }) =>
          status && (status.label === "Low" || status.label === "Empty"),
      )
      .sort((a, b) => (a.status?.ratio ?? 999) - (b.status?.ratio ?? 999));
    return {
      lowSupplyCount: flagged.length,
      lowSupplyPreview: flagged.slice(0, 3),
    };
  })();

  const adherence = patient?.adherence?.[adherenceRange] || null;
  const adherenceLabels = Array.isArray(adherence?.labels)
    ? adherence.labels
    : [];
  const adherenceValues = Array.isArray(adherence?.values)
    ? adherence.values
    : [];
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
      const medicationId =
        med?.sourceMedication?.id || med?.medicationId || med?.id;
      const timeSlot =
        med?.slot ||
        med?.timeOfDay ||
        (Array.isArray(med?.timesOfDay) && med.timesOfDay.length
          ? med.timesOfDay[0]
          : null);

      // In Caregiver patient view, each card represents a single schedule slot.
      // Mark only that slot as taken (not all daily slots).
      await api.medications.markAsTaken(
        medicationId,
        currentTime,
        selectedDateStr,
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
        const viewDateStr = selectedDateStr;
        const targetDate = updatedMedication.takenDate;
        const medicationId =
          updatedMedication?.sourceMedication?.id ||
          updatedMedication?.medicationId ||
          updatedMedication?.id;
        const timeSlot =
          updatedMedication?.slot ||
          updatedMedication?.timeOfDay ||
          updatedMedication?.timesOfDay?.[0] ||
          null;
        if (targetDate !== viewDateStr) {
          await api.medications.undoMarkAsTaken(
            medicationId,
            viewDateStr,
            timeSlot,
          );
        }
        await api.medications.markAsTaken(
          medicationId,
          updatedMedication.takenTime,
          targetDate,
          timeSlot,
        );
      } else {
        const updated = await api.medications.updateForPatient(
          patientId,
          updatedMedication?.sourceMedication?.id ||
            updatedMedication?.medicationId ||
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
      const medicationId =
        med?.sourceMedication?.id || med?.medicationId || med?.id;
      const timeSlot =
        med?.slot ||
        med?.timeOfDay ||
        (Array.isArray(med?.timesOfDay) && med.timesOfDay.length
          ? med.timesOfDay[0]
          : null);
      await api.medications.undoMarkAsTaken(
        medicationId,
        selectedDateStr,
        timeSlot,
      );
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

  const handleUpdateAppointmentStatus = async (appointment, newStatus) => {
    try {
      if (!appointment?.id) return;
      await api.appointments.updateForPatient(patientId, appointment.id, {
        status: newStatus,
      });
      setPatientData((prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev.appointments) ? prev.appointments : [];
        return {
          ...prev,
          appointments: list.map((apt) =>
            apt.id === appointment.id ? { ...apt, status: newStatus } : apt,
          ),
        };
      });
    } catch (error) {
      showError(error.message || "Unable to update appointment status");
      loadPatient();
    }
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

  // Calendar: compute adherence across the visible week (per-medication, caregiver semantics)
  useEffect(() => {
    if (!patientId || !visibleWeekStart) return;
    let isActive = true;

    const buildWeekAdherence = async () => {
      const days = Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(visibleWeekStart);
        d.setDate(d.getDate() + idx);
        return toLocalIsoDay(d);
      });

      const results = await limitConcurrency(
        days.map(async (dateStr) => {
          try {
            const meds = await api.medications.getForPatient(
              patientId,
              dateStr,
            );
            return [dateStr, Array.isArray(meds) ? meds : []];
          } catch {
            return [dateStr, []];
          }
        }),
        3,
      );

      const map = {};
      for (const [dateStr, meds] of results) {
        const list = Array.isArray(meds) ? meds : [];
        const scheduled = list.filter(
          (m) =>
            Boolean(m?.timeOfDay) ||
            (Array.isArray(m?.timesOfDay) && m.timesOfDay.length > 0),
        );
        const total = scheduled.length;
        const taken = scheduled.filter(
          (m) => String(m?.status || "").toLowerCase() === "taken",
        ).length;
        map[dateStr] = total > 0 ? Math.round((taken / total) * 100) : 0;
      }

      if (!isActive) return;
      setWeekAdherence(map);
    };

    buildWeekAdherence();
    return () => {
      isActive = false;
    };
  }, [patientId, visibleWeekStart]);

  // Only show the full-page loading state on the initial fetch.
  // During background refreshes (e.g., marking a med taken/undo), keep the page mounted
  // to avoid resetting the scroll position to the top.
  if (isLoading && !patient) {
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

        {/* Calendar (date selector) */}
        <Calendar
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
          onWeekChange={setVisibleWeekStart}
          appointments={calendarAppointments}
          adherence={weekAdherence}
          mode="Caregiver"
        />

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-start">
          {/* Today's adherence */}
          <button
            type="button"
            onClick={() => scrollToSection("patient-medications")}
            className="bg-background-default border border-border-default rounded-2xl p-5 text-left ring-inset hover:bg-background-hover hover:border-secondary hover:ring-2 hover:ring-secondary hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 h-full flex flex-col"
            aria-label="View today's adherence"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                    className="text-success"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                  {dateLabel ? `Adherence · ${dateLabel}` : "Today's Adherence"}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center pt-4">
              <TodayAdherencePieChart
                taken={takenScheduledToday}
                notTaken={pendingScheduledToday}
              />
            </div>
          </button>

          {/* Low Supply Alerts */}
          <button
            type="button"
            onClick={() => scrollToSection("patient-supply")}
            className="bg-background-default border border-border-default rounded-2xl p-5 text-left ring-inset hover:bg-background-hover hover:border-secondary hover:ring-2 hover:ring-secondary hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 h-full flex flex-col"
            aria-label="View low supply alerts"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
                <WarningCircleIcon
                  size={20}
                  weight="fill"
                    className="text-danger"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                  Low Supply Alerts
                </p>
                <span className="sr-only">
                  {lowSupplyCount} low supply alert
                  {lowSupplyCount === 1 ? "" : "s"} total
                </span>
              </div>
            </div>

            <div className="pt-4 flex-1">
              {lowSupplyPreview.length > 0 ? (
                <ul className="space-y-2">
                  {lowSupplyPreview.map(({ med, status }) => {
                    const qtyNum = Number(med?.quantity);
                    const qtyLabel = Number.isFinite(qtyNum)
                      ? `${qtyNum} left`
                      : status?.label || "Low";
                    return (
                      <li
                        key={med?.id || med?._id || med?.name}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-poppins text-sm font-semibold text-text-primary truncate">
                            {med?.name || "Medication"}
                          </p>
                          <p className="font-poppins text-xs text-text-secondary truncate">
                            {status?.label
                              ? `${status.label} supply`
                              : "Low supply"}
                          </p>
                        </div>
                        <span className="font-poppins text-xs font-semibold text-red-600 tabular-nums whitespace-nowrap">
                          {qtyLabel}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="font-poppins text-sm text-text-secondary">
                  No low supply alerts.
                </p>
              )}
            </div>
          </button>

          {/* Next Appointment */}
          <button
            type="button"
            onClick={() => scrollToSection("patient-appointments")}
            className="bg-background-default border border-border-default rounded-2xl p-5 text-left ring-inset hover:bg-background-hover hover:border-secondary hover:ring-2 hover:ring-secondary hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 h-full flex flex-col"
            aria-label="View upcoming appointments"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CalendarCheckIcon
                  size={20}
                  weight="fill"
                    className="text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                  Upcoming Appointments
                </p>
                <span className="sr-only">
                  {upcomingAppointmentsCount} upcoming appointment
                  {upcomingAppointmentsCount === 1 ? "" : "s"} total
                </span>
              </div>
            </div>

            <div className="pt-4 flex-1">
              {upcomingAppointmentsPreview.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingAppointmentsPreview.map((appt, idx) => {
                    const key =
                      appt?.id ||
                      appt?._id ||
                      `${appt?.title || "appt"}-${appt?._dateStr || "date"}-${idx}`;
                    const containerClassName =
                      idx === 0
                        ? "bg-blue-50/50 border border-blue-100 rounded-xl p-3"
                        : "bg-background-default border border-border-subtle rounded-xl p-3";
                    return (
                      <li key={key} className={containerClassName}>
                        <p className="font-poppins text-base font-semibold text-text-primary truncate">
                          {appt?.title || "Appointment"}
                        </p>
                        <p className="font-poppins text-sm text-text-secondary truncate">
                          {appt?.doctorName || "Doctor"}{" "}
                          {appt?.location ? `• ${appt.location}` : ""}
                        </p>
                        <p className="font-poppins text-sm font-semibold text-blue-700 mt-1">
                          {formatDateLocale(appt?._dateStr) || "—"}
                          {appt?._displayTime ? ` • ${appt._displayTime}` : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="font-poppins text-base text-text-secondary">
                  No upcoming appointments.
                </p>
              )}
            </div>
          </button>
        </div>

        {/* Medications section */}

        <div id="patient-medications" className="scroll-mt-24" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MedicationSection
            variant="pending"
            medications={pendingMeds}
            onMarkAsTaken={handleMarkAsTaken}
            showTimeGroups={true}
            compact={false}
            dateLabel={dateLabel}
            mode="Caregiver"
          />
          <MedicationSection
            variant="taken"
            medications={takenMeds}
            onEdit={handleEditMedication}
            onDelete={handleDeleteTakenMedication}
            showTimeGroups={true}
            compact={false}
            dateLabel={dateLabel}
            mode="Caregiver"
          />
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
        <div
          id="patient-supply"
          className="bg-background-default border border-border-default rounded-2xl p-6 mb-6"
        >
          <SectionHeader
            icon={
              <PillIcon
                size={24}
                weight="regular"
                    className="text-icon-primary"
              />
            }
            title="Current Supply"
            description="Inventory and refills"
            action={
              <div className="flex items-center gap-3">
                <span className="font-poppins font-semibold text-sm text-text-secondary bg-background-hover px-3 py-1 rounded-full">
                  {supplyMeds.length} in supply
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<PlusIcon size={16} weight="bold" />}
                  onClick={() => setShowAddMedicationModal(true)}
                >
                  Add
                </Button>
              </div>
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
        <div
          id="patient-appointments"
          className="bg-background-default border border-border-default rounded-2xl p-6"
        >
          <SectionHeader
            icon={
              <CalendarCheckIcon
                size={24}
                weight="regular"
                    className="text-icon-primary"
              />
            }
            title="Appointments"
            description="Manage this patient's appointments"
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

          <div className="mt-4">
            <DataTable
              columns={appointmentColumns}
              data={
                Array.isArray(patient.appointments) ? patient.appointments : []
              }
              defaultSortConfig={{ key: "date", direction: "asc" }}
              onEdit={(row) => openEditAppointmentModal(row)}
              onDelete={(row) => requestDeleteAppointment(row)}
              emptyMessage="No appointments"
              emptySubMessage="Add an appointment to track this patient's schedule"
              emptyAction={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<PlusIcon size={16} weight="bold" />}
                  onClick={openAddAppointmentModal}
                >
                  Add appointment
                </Button>
              }
              EmptyIcon={CalendarCheckIcon}
              mode="Caregiver"
              rowClassName={(row) => {
                const status = getAppointmentDisplayStatus(row);
                const isMissed = status === "Missed";
                const isToday = status === "Today";
                return `${isMissed ? "opacity-60" : ""} ${isToday ? "bg-amber-50/30" : ""}`;
              }}
            />
          </div>
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
                length: Math.max(
                  adherenceValues.length,
                  adherenceLabels.length,
                ),
              }).map((_, index) => {
                const rawValue = Number(adherenceValues[index] ?? 0);
                const value = Number.isFinite(rawValue)
                  ? Math.max(0, Math.min(100, rawValue))
                  : 0;
                const label = adherenceLabels[index] || "";
                const barClass =
                  value >= 90 ? "bg-success" : value >= 70 ? "bg-warning" : "bg-danger";

                return (
                  <div
                    key={`${label}-${index}`}
                    className="flex-1 flex flex-col items-center gap-2 h-full"
                  >
                    {/* Fixed-height track so % bar heights render correctly */}
                    <div className="w-full flex-1 flex items-end bg-background-hover rounded-lg overflow-hidden border border-border-subtle">
                      <div
                        className={`w-full rounded-t-lg transition-all ${barClass}`}
                        style={{
                          height: `${value}%`,
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
