import React from "react";
import PatientsPage from "./PatientsPage";

/**
 * CaregiverDashboard
 * Currently reuses the PatientsPage as the main dashboard view for caregivers.
 * Can be expanded later with aggregate stats.
 */
const CaregiverDashboard = () => {
  return <PatientsPage />;
};

export default CaregiverDashboard;
