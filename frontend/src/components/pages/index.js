/**
 * Pages Index
 * Export all page components
 */

// Shared pages (used by both patient and caregiver modes)
export { default as SettingsPage } from "./SettingsPage";
export { default as AuthPage } from "./AuthPage";

// Patient pages (Personal mode)
export {
  Dashboard,
  MedicationPage,
  AppointmentsPage,
} from "./patient";

// Caregiver pages (Caregiver mode)
export {
  CaregiverDashboard,
  PatientsPage,
  PatientDetailPage,
  CaregiverAppointmentsPage,
} from "./caregiver";
