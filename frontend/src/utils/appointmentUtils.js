/**
 * Appointment utilities
 * Shared helpers for status display + sorting (Personal + Caregiver pages)
 */

const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function getAppointmentLocalDateTime(appointment) {
  const dateStr = appointment?.date;
  if (!dateStr || typeof dateStr !== "string" || !ISO_DAY_RE.test(dateStr)) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;

  const dt = new Date(year, month - 1, day);

  const time = String(appointment?.time || "");
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      dt.setHours(hours, minutes, 0, 0);
      return dt;
    }
  }

  // If no time is provided, treat as end-of-day so same-day appointments
  // don't immediately become "Missed" in the morning.
  dt.setHours(23, 59, 0, 0);
  return dt;
}

/**
 * Display-only status resolver:
 * - if status is set and not Scheduled, use it
 * - else derive Today/Missed/Scheduled based on local date/time
 */
export function getAppointmentDisplayStatus(appointment, now = new Date()) {
  if (appointment?.status && appointment.status !== "Scheduled") return appointment.status;

  const dt = getAppointmentLocalDateTime(appointment, now);
  if (!dt || Number.isNaN(dt.getTime())) return "Scheduled";

  // Auto-resolution: mark as Missed if current time > appointment time by 1 hour.
  if (now - dt > 3600000) return "Missed";

  const todayDate = new Date(now);
  todayDate.setHours(0, 0, 0, 0);
  const compareDate = new Date(dt);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === todayDate.getTime()) return "Today";
  if (compareDate > todayDate) return "Scheduled";
  return "Missed";
}

export function getAppointmentStatusPillClass(appointment) {
  const displayStatus = getAppointmentDisplayStatus(appointment);
  const isToday = displayStatus === "Today";
  const value = appointment?.status || "Scheduled";
  if (value === "Scheduled" || isToday) return "bg-blue-50 text-blue-600";
  if (value === "Completed") return "bg-emerald-50 text-emerald-700";
  if (value === "Cancelled") return "bg-gray-100 text-gray-600";
  return "bg-red-50 text-red-600";
}

export function getAppointmentStatusSortRank(appointment) {
  const status = getAppointmentDisplayStatus(appointment);
  const order = {
    Today: 0,
    Scheduled: 1,
    Completed: 2,
    Missed: 3,
    Cancelled: 4,
  };
  return order[status] ?? 99;
}

