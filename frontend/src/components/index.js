/**
 * Components Index
 * Central export for all components
 */

// UI Components (buttons, cards, layout, etc.)
export {
  // Buttons
  Button,
  ActionButtons,
  CalendarDate,
  MedicineDue,
  MenuButtons,
  // Layout
  Sidebar,
  // Data display
  AppointmentCard,
  DataTable,
  MedicationSection,
  PieChart,
  // Auth
  OnboardingTutorial,
  // Utilities
  ErrorBoundary,
} from "./ui";

// Modals
export { AddAppointmentModal, CaregiverAuthModal } from "./modals";

// Pages
export {
  // Patient pages
  Dashboard,
  MedicationPage,
  AppointmentsPage,
  // Caregiver pages
  CaregiverDashboard,
  PatientsPage,
  PatientDetailPage,
  CaregiverAppointmentsPage,
  // Shared pages
  SettingsPage,
  AuthPage,
} from "./pages";
