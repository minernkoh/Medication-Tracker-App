/**
 * App Component - Root component of the application
 * Handles top-level navigation, authentication, and mode switching
 */
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import { MedicationsProvider } from "./contexts/MedicationsContext";
import NotFoundPage from "./components/pages/NotFoundPage";
import { api } from "./api";
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
  const firstName = user?.name ? user.name.split(" ")[0] : "";

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
                <CaregiverDashboard userName={firstName} />
              ) : (
                <DashboardPage userName={firstName} mode={mode} />
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
                  userName={firstName}
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
                  userName={firstName}
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
    const storedUser = getAuthField("user");
    const token = localStorage.getItem("token");
    return Boolean(token && storedUser);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // User state
  const [user, setUser] = useState(() => {
    const storedUser = getAuthField("user");
    if (storedUser) return storedUser;
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : { name: "", email: "" };
    } catch {
      return { name: "", email: "" };
    }
  });

  // Mode state (Personal or Caregiver)
  const [mode, setMode] = useState(() => {
    const storedMode = getAuthField("mode");
    if (storedMode) return storedMode;
    return user?.role === "caregiver" ? "Caregiver" : "Personal";
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

  const normalizeUser = (userData) => ({
    ...userData,
    id: userData?.id || userData?._id,
  });

  // Handle login from auth page
  const handleLogin = async (credentials) => {
    try {
      const data = await api.auth.signin(credentials);
      const normalizedUser = normalizeUser(data.user || {});
      const userMode =
        normalizedUser.role === "caregiver" ? "Caregiver" : "Personal";
      setUser(normalizedUser);
      setMode(userMode);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSignup = async (signupData) => {
    try {
      await api.auth.signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role === "caregiver" ? "caregiver" : "patient",
      });
      const loginData = await api.auth.signin({
        email: signupData.email,
        password: signupData.password,
      });
      const normalizedUser = normalizeUser(loginData.user || {});
      const userMode =
        normalizedUser.role === "caregiver" ? "Caregiver" : "Personal";
      setUser(normalizedUser);
      setMode(userMode);
      setIsAuthenticated(true);
      setPendingUser({
        name: normalizedUser.name,
        email: normalizedUser.email,
        mode: userMode,
      });
      setShowOnboarding(true);
    } catch (error) {
      console.error("Signup failed:", error);
    }
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
  const handleCaregiverLogin = async (credentials) => {
    await handleLogin(credentials);
    setMode("Caregiver");
    setShowCaregiverModal(false);
  };

  // Handle caregiver signup (show onboarding)
  const handleCaregiverSignup = async (userData) => {
    setShowCaregiverModal(false);
    await handleSignup({ ...userData, role: "caregiver" });
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser({ name: "", email: "" });
    setMode("Personal");
    removeAuthData();
    api.auth.logout();
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
        <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
      </ErrorProvider>
    );
  }

  // Show main app
  return (
    <ErrorProvider>
      <MedicationsProvider>
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
      </MedicationsProvider>
    </ErrorProvider>
  );
}

export default App;
