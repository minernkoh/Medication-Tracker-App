/**
 * CaregiverDashboard Component - Overview dashboard for caregivers
 * Shows all patients at a glance with their medication status and upcoming appointments
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import {
  getStartOfWeek,
  formatDateNumeric,
  normalizeDateInput,
  toLocalIsoDay,
  TIME_BUCKET_TO_24H,
  to12HourDisplay,
  timeToMinutes,
} from "../../../utils";
import {
  DataTable,
  GradientBackground,
  TodayAdherencePieChart,
  PageHeader,
  Card,
  SelectMenu,
} from "../../ui";
import { Calendar } from "../../features";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";
import { limitConcurrency } from "../../../utils/requestUtils";
import {
  getPatientAvatarColor,
  getPatientInitials,
} from "../../../utils/patientUtils";

const normalizePatient = (patient, index) => {
  if (!patient) return null;
  const name = patient.name;
  const id = patient.id || patient._id;
  return {
    ...patient,
    id,
    name,
    avatarInitials: getPatientInitials(patient.name || ""),
    avatarColor: getPatientAvatarColor({ ...patient, id }, index),
  };
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
};

// "Today's adherence" (Caregiver) is defined per-medication:
// a medication counts as taken for the day if ANY of its scheduled time-slots is taken.
const getPerMedicationAdherence = (items = []) => {
  const expected = new Set();
  const taken = new Set();

  const list = Array.isArray(items) ? items : [];
  for (const item of list) {
    const medId = item?.medicationId;
    if (!medId) continue;
    const key = String(medId);
    expected.add(key);
    if (String(item?.status || "").toLowerCase() === "taken") {
      taken.add(key);
    }
  }

  const expectedTotal = expected.size;
  const takenTotal = taken.size;
  const percent =
    expectedTotal > 0 ? Math.round((takenTotal / expectedTotal) * 100) : 0;

  return { expectedTotal, takenTotal, percent };
};

const CaregiverDashboard = ({ userName = "" }) => {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleWeekStart, setVisibleWeekStart] = useState(() =>
    getStartOfWeek(new Date()),
  );
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [weekAdherence, setWeekAdherence] = useState({});
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("all"); // all | pending | taken
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const { showError } = useError();
  const todayStr = toLocalIsoDay(selectedDate);

  const loadDashboardData = useCallback(async () => {
    try {
      const [patientsData, appointmentsData] = await Promise.all([
        api.caregiver.getPatients(),
        api.caregiver.getAppointments(),
      ]);
      setPatients(
        (Array.isArray(patientsData) ? patientsData : [])
          .map((patient, index) => normalizePatient(patient, index))
          .filter(Boolean)
          .filter((p) => Boolean(p?.id)),
      );
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      showError(error.message || "Unable to load patients");
    }
  }, [showError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (patients.length === 0) {
      setScheduleItems([]);
      return;
    }

    const buildSchedule = async () => {
      setIsScheduleLoading(true);
      try {
        const data = await api.caregiver.getSchedule(todayStr);
        setScheduleItems(Array.isArray(data) ? data : []);
      } catch (error) {
        showError(error.message || "Unable to load schedule");
      } finally {
        setIsScheduleLoading(false);
      }
    };

    buildSchedule();
  }, [patients.length, showError, todayStr]);

  // Calendar: compute adherence across the visible week (combined schedule)
  useEffect(() => {
    if (!visibleWeekStart) return;
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
            const items = await api.caregiver.getSchedule(dateStr);
            return [dateStr, Array.isArray(items) ? items : []];
          } catch {
            return [dateStr, []];
          }
        }),
        3, // Max 3 concurrent requests
      );

      const map = {};
      for (const [dateStr, items] of results) {
        const { percent } = getPerMedicationAdherence(items);
        map[dateStr] = percent;
      }

      if (!isActive) return;
      setWeekAdherence(map);
    };

    buildWeekAdherence();
    return () => {
      isActive = false;
    };
  }, [visibleWeekStart]);

  const calendarAppointments = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    return list
      .map((appt) => ({
        ...appt,
        date: normalizeDateInput(appt?.date),
      }))
      .filter((appt) => {
        const status = String(appt?.status || "").toLowerCase();
        return (
          status !== "completed" &&
          status !== "cancelled" &&
          status !== "missed"
        );
      })
      .filter((appt) => Boolean(appt?.date));
  }, [appointments]);

  // Calculate totals
  const totalPatients = patients.length;

  // Use scheduleItems for more reactive adherence stats
  const {
    expectedTotal: totalMedicationsDate,
    takenTotal: totalMedicationsTakenDate,
  } = useMemo(() => getPerMedicationAdherence(scheduleItems), [scheduleItems]);

  const totalLowSupply = patients.reduce((sum, p) => sum + (p.alerts || 0), 0);

  const lowSupplyPreviewItems = useMemo(() => {
    const items = [];
    for (const p of patients) {
      const meds = Array.isArray(p?.lowSupplyMedications)
        ? p.lowSupplyMedications
        : [];
      for (const med of meds) {
        items.push({
          patientId: p.id || p._id,
          patientName: p.name,
          medicationId: med?.id || med?._id,
          medicationName: med?.name,
          quantity: med?.quantity,
          unit: med?.unit,
        });
      }
    }

    items.sort((a, b) => {
      const aq = Number(a.quantity);
      const bq = Number(b.quantity);
      const aVal = Number.isFinite(aq) ? aq : Number.POSITIVE_INFINITY;
      const bVal = Number.isFinite(bq) ? bq : Number.POSITIVE_INFINITY;
      return aVal - bVal;
    });

    return items.slice(0, 5);
  }, [patients]);

  const appointmentDateTimeLocal = useCallback((appt) => {
    const dateStr = normalizeDateInput(appt?.date);
    if (!dateStr) return null;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    if (!year || !month || !day) return null;

    const dt = new Date(year, month - 1, day);
    const time = String(appt?.time || "");
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        dt.setHours(hours, minutes, 0, 0);
      }
    } else {
      // Treat "no time" as end-of-day so same-day appointments remain upcoming.
      dt.setHours(23, 59, 0, 0);
    }
    return dt;
  }, []);

  const { upcomingAppointments, upcomingAppointmentsPreview } = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    const now = new Date();

    const upcoming = [];
    for (const appt of list) {
      const status = String(appt?.status || "").toLowerCase();
      if (
        status === "completed" ||
        status === "cancelled" ||
        status === "missed"
      ) {
        continue;
      }

      const apptDt = appointmentDateTimeLocal(appt);
      if (!apptDt || Number.isNaN(apptDt.getTime())) continue;
      if (apptDt < now) continue;

      upcoming.push({ appt, apptDt });
    }

    upcoming.sort((a, b) => a.apptDt - b.apptDt);

    const preview = upcoming.slice(0, 3).map(({ appt }) => ({
      ...appt,
      _dateStr: normalizeDateInput(appt?.date),
      _displayTime:
        appt?.time && /^\d{2}:\d{2}$/.test(String(appt.time))
          ? to12HourDisplay(String(appt.time))
          : appt?.time || "",
    }));
    return {
      upcomingAppointments: upcoming.length,
      upcomingAppointmentsPreview: preview,
    };
  }, [appointments, appointmentDateTimeLocal]);

  const timeSortValue = (time) => {
    const key = String(time || "").toLowerCase();
    if (TIME_BUCKET_TO_24H[key]) return timeToMinutes(TIME_BUCKET_TO_24H[key]);
    if (/^\d{2}:\d{2}$/.test(key)) return timeToMinutes(key);
    return Number.MAX_SAFE_INTEGER;
  };

  const formatScheduleTime = (time) => {
    const key = String(time || "").toLowerCase();
    if (TIME_BUCKET_TO_24H[key])
      return to12HourDisplay(TIME_BUCKET_TO_24H[key]);
    if (/^\d{2}:\d{2}$/.test(key)) return to12HourDisplay(key);
    return "Unscheduled";
  };

  const scheduleItemsForPatient = useMemo(() => {
    const list = Array.isArray(scheduleItems) ? scheduleItems : [];
    return list.filter(
      (item) => scheduleFilter === "all" || item?.patientId === scheduleFilter,
    );
  }, [scheduleItems, scheduleFilter]);

  const scheduleCounts = useMemo(() => {
    const base = { all: 0, pending: 0, taken: 0 };
    for (const item of scheduleItemsForPatient) {
      base.all += 1;
      const status = String(item?.status || "").toLowerCase();
      if (status === "taken") base.taken += 1;
      else base.pending += 1; // includes "pending", empty, "missed", etc.
    }
    return base;
  }, [scheduleItemsForPatient]);

  const filteredScheduleItems = useMemo(() => {
    const list = scheduleItemsForPatient;
    if (scheduleStatusFilter === "taken") {
      return list.filter(
        (item) => String(item?.status || "").toLowerCase() === "taken",
      );
    }
    if (scheduleStatusFilter === "pending") {
      return list.filter(
        (item) => String(item?.status || "").toLowerCase() !== "taken",
      );
    }
    return list;
  }, [scheduleItemsForPatient, scheduleStatusFilter]);

  const scheduleDefaultSortConfig = useMemo(
    () => ({ key: "time", direction: "asc" }),
    [],
  );

  const scheduleColumns = useMemo(
    () => [
      {
        key: "__rowNumber",
        label: "#",
        align: "center",
        sortable: false,
        render: (_value, _row, rowIndex) => (
          <span className="font-poppins text-sm text-text-secondary tabular-nums">
            {rowIndex + 1}
          </span>
        ),
      },
      {
        key: "time",
        label: "Time",
        sortValue: (row) => timeSortValue(row?.time),
        render: (value) => (
          <span className="font-poppins text-sm font-semibold text-text-primary">
            {formatScheduleTime(value)}
          </span>
        ),
      },
      {
        key: "medicationName",
        label: "Name",
        sortValue: (row) => row?.medicationName,
        render: (value) => (
          <span className="font-poppins font-semibold text-text-primary">
            {value || "—"}
          </span>
        ),
      },
      {
        key: "patientName",
        label: "Patient",
        sortValue: (row) => row?.patientName,
        render: (value) => (
          <span className="font-poppins text-sm text-text-primary">
            {value || "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center",
        sortValue: (row) => row?.status,
        render: (value) => {
          const status = String(value || "").toLowerCase();
          const styles =
            status === "taken"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : status === "missed"
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-amber-50 text-amber-700 border-amber-100";
          const label = status ? status : "pending";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full border font-poppins text-xs font-semibold capitalize ${styles}`}
            >
              {label}
            </span>
          );
        },
      },
    ],
    [],
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Patient card component
  const PatientCard = ({ patient }) => {
    const patientId = patient?.id;
    const pStats = scheduleItems.filter(
      (i) => String(i?.patientId) === String(patient?.id),
    );
    const hasQuickInfo = Boolean(patient?.nextMedication);
    const { expectedTotal: total, percent: completionPercent } =
      getPerMedicationAdherence(pStats);
    const adherenceTone =
      total === 0
        ? "neutral"
        : completionPercent >= 80
          ? "success"
          : completionPercent >= 50
            ? "warning"
            : "danger";
    const adherenceToneClasses = {
      neutral: { bar: "bg-border-subtle", text: "text-text-secondary" },
      success: { bar: "bg-success", text: "text-success" },
      warning: { bar: "bg-warning", text: "text-warning" },
      danger: { bar: "bg-danger", text: "text-danger" },
    };
    const adherenceClasses =
      adherenceToneClasses[adherenceTone] || adherenceToneClasses.neutral;

    return (
      <Card
        onClick={() => {
          if (!patientId) {
            showError("Unable to open patient details (missing patient id).");
            return;
          }
          navigate(`/patients/${patientId}`);
        }}
        accent="secondary"
        className="pt-5 px-5 pb-4 group"
        aria-label={`View patient ${patient?.name || ""}`.trim()}
      >
        {/* Patient header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold text-lg"
              style={{ backgroundColor: patient.avatarColor }}
            >
              {patient.avatarInitials}
            </div>
            <div>
              <h3 className="font-poppins font-bold text-text-primary">
                {patient.name}
              </h3>
            </div>
          </div>
          {patient.alerts > 0 && (
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
              <WarningCircleIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-semibold">
                {patient.alerts}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className={hasQuickInfo ? "mb-4" : "mb-0"}>
          <span className="sr-only">
            {total > 0
              ? `Adherence ${completionPercent}%`
              : "No adherence data"}
          </span>
          <div className="flex items-center gap-3">
            <div className="h-2 bg-background-subtle rounded-full overflow-hidden flex-1">
              <div
                className={`h-full rounded-full transition-all duration-300 ${adherenceClasses.bar}`}
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </div>
            <span
              className={`font-poppins text-xs font-semibold tabular-nums text-right min-w-[3ch] ${adherenceClasses.text}`}
            >
              {total > 0 ? `${completionPercent}%` : "—"}
            </span>
          </div>
        </div>

        {/* Quick info */}
        {hasQuickInfo && (
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg flex-1">
              <ClockIcon size={14} weight="fill" />
              <span className="font-poppins text-xs font-medium">
                Next: {patient.nextMedication}
              </span>
            </div>
          </div>
        )}
      </Card>
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
          <PageHeader
            title={`Good ${getTimeGreeting()}, ${userName}!`}
            description="Here's an overview of your patients"
          />

          {/* Calendar section */}
          <Calendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onWeekChange={setVisibleWeekStart}
            appointments={calendarAppointments}
            adherence={weekAdherence}
            mode="Caregiver"
          />

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Today's adherence */}
            <Card
              onClick={() => navigate("/patients")}
              accent="secondary"
              className="text-left h-full flex flex-col"
              aria-label="View adherence by patient"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="text-success"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                    Today&apos;s Adherence
                  </p>
                  <span className="sr-only">
                    {totalMedicationsDate > 0
                      ? `${totalMedicationsTakenDate}/${totalMedicationsDate} doses taken`
                      : "No scheduled doses"}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center pt-4">
                <TodayAdherencePieChart
                  taken={totalMedicationsTakenDate}
                  notTaken={Math.max(
                    totalMedicationsDate - totalMedicationsTakenDate,
                    0,
                  )}
                />
              </div>
            </Card>

            {/* Low supply */}
            <Card
              onClick={() => navigate("/patients")}
              accent="secondary"
              className="text-left h-full flex flex-col"
              aria-label="View low supply alerts by patient"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
                  <WarningCircleIcon
                    size={20}
                    weight="fill"
                    className="text-danger"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                    Low Supply Alerts
                  </p>
                </div>
              </div>

              <div className="pt-4 flex-1">
                <span className="sr-only">
                  {totalLowSupply} low supply alert
                  {totalLowSupply === 1 ? "" : "s"} total
                </span>
                {lowSupplyPreviewItems.length > 0 ? (
                  <ul className="space-y-2">
                    {lowSupplyPreviewItems.map((item) => {
                      const qty = Number(item.quantity);
                      const qtyLabel = Number.isFinite(qty)
                        ? `${qty} left`
                        : "Low";
                      return (
                        <li
                          key={`${item.patientId || "p"}-${item.medicationId || item.medicationName || "m"}`}
                          className="flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-poppins text-sm font-semibold text-text-primary truncate">
                              {item.medicationName || "Medication"}
                            </p>
                            <p className="font-poppins text-xs text-text-secondary truncate">
                              {item.patientName || "Patient"}
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
            </Card>

            {/* Upcoming appointments */}
            <Card
              onClick={() => navigate("/appointments")}
              accent="secondary"
              className="text-left h-full flex flex-col"
              aria-label="View upcoming appointments"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CalendarCheckIcon
                    size={20}
                    weight="fill"
                    className="text-primary"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-poppins text-base font-semibold text-text-primary leading-tight">
                    Upcoming Appointments
                  </p>
                </div>
              </div>

              <div className="pt-4 flex-1">
                <span className="sr-only">
                  {upcomingAppointments} upcoming appointment
                  {upcomingAppointments === 1 ? "" : "s"} total
                </span>
                {upcomingAppointmentsPreview.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingAppointmentsPreview.map((appt, idx) => {
                      const key =
                        appt?.id ||
                        appt?._id ||
                        `${appt?.title || "appt"}-${appt?._dateStr || "date"}-${idx}`;
                      const patientName =
                        typeof appt?.patient === "object"
                          ? appt.patient?.name || "Patient"
                          : "Patient";
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
                            {patientName}
                          </p>
                          <p className="font-poppins text-sm font-semibold text-blue-700 mt-1">
                            {formatDateNumeric(appt?._dateStr) || "—"}
                            {appt?._displayTime
                              ? ` • ${appt._displayTime}`
                              : ""}
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
            </Card>
          </div>

          {/* Patients section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Your Patients
              </h2>
              <p className="font-poppins text-sm text-text-secondary mt-1">
                {totalPatients} patient{totalPatients === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => navigate("/patients")}
              className="font-poppins text-sm font-semibold flex items-center gap-1 hover:opacity-90 transition-all"
              style={{ color: modeHexColor }}
            >
              View All
              <CaretRightIcon size={16} weight="bold" />
            </button>
          </div>

          {/* Patient cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          {/* Today's schedule section */}
          <div>
            <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">
              Medication Schedule
            </h2>
            <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border-default">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <ClockIcon size={18} />
                    <span className="font-poppins text-sm">
                      {filteredScheduleItems.length} items
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    {/* Patient filter */}
                    <SelectMenu
                      value={scheduleFilter}
                      onChange={(next) => setScheduleFilter(next)}
                      options={[
                        { value: "all", label: "All patients" },
                        ...patients.map((patient) => ({
                          value: patient.id,
                          label: patient.name,
                        })),
                      ]}
                      mode="Caregiver"
                      aria-label="Filter schedule by patient"
                      buttonClassName="px-3 py-2 rounded-lg text-sm"
                    />

                    {/* Status filter (dropdown) */}
                    <SelectMenu
                      value={scheduleStatusFilter}
                      onChange={(next) => setScheduleStatusFilter(next)}
                      options={[
                        { value: "all", label: `All (${scheduleCounts.all})` },
                        {
                          value: "pending",
                          label: `Pending (${scheduleCounts.pending})`,
                        },
                        {
                          value: "taken",
                          label: `Taken (${scheduleCounts.taken})`,
                        },
                      ]}
                      mode="Caregiver"
                      aria-label="Filter schedule by status"
                      buttonClassName="px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {isScheduleLoading ? (
                <div className="px-5 py-8 text-center">
                  <p className="font-poppins text-text-secondary">
                    Loading schedule…
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={scheduleColumns}
                  data={filteredScheduleItems}
                  defaultSortConfig={scheduleDefaultSortConfig}
                  showActions={false}
                  emptyMessage="No medication schedule available yet."
                  emptySubMessage="Add medications for your patients in their profiles"
                  emptyAction={
                    <button
                      type="button"
                      onClick={() => navigate("/patients")}
                      className="font-poppins font-semibold text-sm"
                      style={{ color: modeHexColor }}
                    >
                      To Patients Page
                    </button>
                  }
                  EmptyIcon={ClockIcon}
                  mode="Caregiver"
                  variant="compact"
                  containerClassName="border-0 rounded-none shadow-none"
                  onRowClick={(row) => {
                    if (row?.patientId) navigate(`/patients/${row.patientId}`);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
