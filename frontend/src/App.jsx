/**
 * App Component - Root component of the application
 * Handles top-level navigation, authentication, and mode switching
 */
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Dashboard,
  AppointmentsPage,
  MedicationPage,
  Sidebar,
  AuthPage,
  OnboardingTutorial,
  CaregiverAuthModal,
  CaregiverDashboard,
  PatientsPage,
  PatientDetailPage,
  CaregiverAppointmentsPage,
} from "./components";

// Lazy load SettingsPage
const SettingsPage = React.lazy(() =>
  import("./components/pages/SettingsPage")
);

// Wrapper component to handle routes with sidebar
function AppLayout({
  user,
  mode,
  onSwitchMode,
  onLogout,
  showCaregiverModal,
  setShowCaregiverModal,
  onCaregiverLogin,
  onCaregiverSignup,
}) {
  const location = useLocation();

  return (
    <div className="h-screen bg-white flex overflow-hidden overflow-x-hidden">
      {/* Sidebar - fixed position, sticky to viewport */}
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        mode={mode}
        onSwitchMode={onSwitchMode}
        onLogout={onLogout}
      />

      {/* Main content area - scrollable, moves to accommodate sidebar on desktop */}
      <main className="flex-1 ml-0 md:ml-[256px] overflow-y-auto h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard - different based on mode */}
          <Route
            path="/dashboard"
            element={
              mode === "Caregiver" ? (
                <CaregiverDashboard userName={user.name.split(" ")[0]} />
              ) : (
                <Dashboard userName={user.name.split(" ")[0]} mode={mode} />
              )
            }
          />

          {/* Patients routes - Caregiver mode only */}
          <Route
            path="/patients"
            element={
              mode === "Caregiver" ? (
                <PatientsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/patients/:patientId"
            element={
              mode === "Caregiver" ? (
                <PatientDetailPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Medications - Personal mode only */}
          <Route
            path="/medications"
            element={
              mode === "Personal" ? (
                <MedicationPage
                  userName={user.name.split(" ")[0]}
                  mode={mode}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Appointments - different based on mode */}
          <Route
            path="/appointments"
            element={
              mode === "Caregiver" ? (
                <CaregiverAppointmentsPage />
              ) : (
                <AppointmentsPage
                  userName={user.name.split(" ")[0]}
                  mode={mode}
                />
              )
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                }
              >
                <SettingsPage user={user} mode={mode} onLogout={onLogout} />
              </React.Suspense>
            }
          />
        </Routes>
      </main>

      {/* Caregiver Auth Modal */}
      <CaregiverAuthModal
        isOpen={showCaregiverModal}
        onClose={() => setShowCaregiverModal(false)}
        onLogin={onCaregiverLogin}
        onSignup={onCaregiverSignup}
      />
    </div>
  );
}

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for existing session
    const saved = localStorage.getItem("medtracker_auth");
    return saved ? JSON.parse(saved).isAuthenticated : false;
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("medtracker_auth");
    return saved
      ? JSON.parse(saved).user
      : { name: "Sarah Johnson", email: "sarahjohnson@gmail.com" };
  });

  // Mode state (Personal or Caregiver)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("medtracker_auth");
    return saved ? JSON.parse(saved).mode : "Personal";
  });

  // Caregiver modal state
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);

  // Save auth state to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(
        "medtracker_auth",
        JSON.stringify({ isAuthenticated, user, mode })
      );
    }
  }, [isAuthenticated, user, mode]);

  // Handle login from auth page
  const handleLogin = (userData) => {
    setUser({
      name: userData.name || "Sarah Johnson",
      email: userData.email,
    });
    setMode(userData.mode || "Personal");
    setIsAuthenticated(true);
  };

  // Handle showing onboarding for new users
  const handleShowOnboarding = (userData) => {
    setPendingUser(userData);
    setShowOnboarding(true);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (userData) => {
    setUser({
      name: userData.name,
      email: userData.email,
    });
    setMode(userData.mode);
    setIsAuthenticated(true);
    setShowOnboarding(false);
    setPendingUser(null);
  };

  // Handle switching to caregiver mode
  const handleSwitchMode = () => {
    if (mode === "Personal") {
      // Show caregiver login/signup modal
      setShowCaregiverModal(true);
    } else {
      // Switch back to personal mode
      setMode("Personal");
    }
  };

  // Handle caregiver login
  const handleCaregiverLogin = (userData) => {
    setMode("Caregiver");
    setShowCaregiverModal(false);
  };

  // Handle caregiver signup (show onboarding)
  const handleCaregiverSignup = (userData) => {
    setShowCaregiverModal(false);
    setPendingUser({ ...userData, mode: "Caregiver" });
    setShowOnboarding(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser({ name: "Sarah Johnson", email: "sarahjohnson@gmail.com" });
    setMode("Personal");
    localStorage.removeItem("medtracker_auth");
  };

  // Show onboarding tutorial for new users
  if (showOnboarding && pendingUser) {
    return (
      <OnboardingTutorial
        user={pendingUser}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPage onLogin={handleLogin} onShowOnboarding={handleShowOnboarding} />
    );
  }

  // Show main app
  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        mode={mode}
        onSwitchMode={handleSwitchMode}
        onLogout={handleLogout}
        showCaregiverModal={showCaregiverModal}
        setShowCaregiverModal={setShowCaregiverModal}
        onCaregiverLogin={handleCaregiverLogin}
        onCaregiverSignup={handleCaregiverSignup}
      />
    </BrowserRouter>
  );
}

export default App;
