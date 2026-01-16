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
  DashboardPage,
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
import { ErrorProvider } from "./contexts/ErrorContext";
import NotFoundPage from "./components/pages/NotFoundPage";
import {
  getAuthData,
  setAuthData,
  removeAuthData,
  getAuthField,
} from "./utils/storageUtils";

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
  onShowOnboarding,
  onDeleteAccount,
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
      <main className="flex-1 ml-0 md:ml-[256px] overflow-y-auto overflow-x-hidden min-h-0">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard - different based on mode */}
          <Route
            path="/dashboard"
            element={
              mode === "Caregiver" ? (
                <CaregiverDashboard userName={user.name.split(" ")[0]} />
              ) : (
                <DashboardPage userName={user.name.split(" ")[0]} mode={mode} />
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
                  userId={user.id}
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
                <SettingsPage
                  user={user}
                  mode={mode}
                  onLogout={onLogout}
                  onShowOnboarding={onShowOnboarding}
                  onDeleteAccount={onDeleteAccount}
                />
              </React.Suspense>
            }
          />

          {/* 404 - Catch all unmatched routes */}
          <Route path="*" element={<NotFoundPage />} />
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
    return getAuthField("isAuthenticated", false);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // User state
  const [user, setUser] = useState(() => {
    return (
      getAuthField("user") || {
        name: "Sarah Johnson",
        email: "sarahjohnson@gmail.com",
      }
    );
  });

  // Mode state (Personal or Caregiver)
  const [mode, setMode] = useState(() => {
    return getAuthField("mode", "Personal");
  });

  // Caregiver modal state
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);

  // Save auth state to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const existing = getAuthData() || {};
      setAuthData({
        isAuthenticated,
        user,
        mode,
        onboardingSkipped: existing.onboardingSkipped || false,
        onboardingCompleted: existing.onboardingCompleted || false,
      });
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
    // If user is already authenticated (viewing from Settings), just close onboarding
    if (isAuthenticated) {
      setShowOnboarding(false);
      setPendingUser(null);

      // Mark onboarding as completed
      const existing = getAuthData() || {};
      setAuthData({
        ...existing,
        onboardingCompleted: true,
        onboardingSkipped: false,
      });
      return;
    }

    // New user flow - authenticate and complete onboarding
    setUser({
      name: userData.name,
      email: userData.email,
    });
    setMode(userData.mode);
    setIsAuthenticated(true);
    setShowOnboarding(false);
    setPendingUser(null);

    // Mark onboarding as completed
    const existing = getAuthData() || {};
    setAuthData({
      ...existing,
      isAuthenticated: true,
      user: { name: userData.name, email: userData.email },
      mode: userData.mode,
      onboardingCompleted: true,
      onboardingSkipped: false,
    });
  };

  // Handle showing onboarding from Settings
  const handleShowOnboardingFromSettings = () => {
    setPendingUser({
      name: user.name,
      email: user.email,
      mode: mode,
    });
    setShowOnboarding(true);
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
    removeAuthData();
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    // TODO: Call API to delete account
    // For now, just log out the user
    handleLogout();
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
      <ErrorProvider>
        <AuthPage
          onLogin={handleLogin}
          onShowOnboarding={handleShowOnboarding}
        />
      </ErrorProvider>
    );
  }

  // Show main app
  return (
    <ErrorProvider>
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
          onShowOnboarding={handleShowOnboardingFromSettings}
          onDeleteAccount={handleDeleteAccount}
        />
      </BrowserRouter>
    </ErrorProvider>
  );
}

export default App;
