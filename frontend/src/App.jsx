/**
 * App Component - Root component of the application
 * Handles top-level navigation, authentication, and mode switching
 */
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ListIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
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
import { getModeHexColor } from "./utils/modeUtils";
import {
  getAuthData,
  setAuthData,
  getAuthField,
  updateAuthField,
  getStoredToken,
} from "./utils/storageUtils";
import { normalizeUser } from "./utils/normalization";
import { Modal, Button } from "./components/ui";

// Lazy load SettingsPage
const SettingsPage = React.lazy(
  () => import("./components/pages/SettingsPage"),
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
  showPatientModal,
  setShowPatientModal,
  onPatientLogin,
  onPatientSignup,
  onShowOnboarding,
  onDeleteAccount,
}) {
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const modeColor = getModeHexColor(mode);

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [isSidebarCollapsed]);

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden overflow-x-hidden">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
          >
            <ListIcon size={22} weight="bold" />
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isSidebarCollapsed}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <CaretRightIcon size={18} weight="bold" />
            ) : (
              <CaretLeftIcon size={18} weight="bold" />
            )}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-text-primary">
            MedTracker
          </span>
          <span className="text-xs font-medium" style={{ color: modeColor }}>
            {mode}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-text-primary">
          {firstName ? firstName.charAt(0).toUpperCase() : "U"}
        </div>
      </header>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar - fixed position, sticky to viewport */}
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        mode={mode}
        onSwitchMode={onSwitchMode}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={setIsSidebarCollapsed}
      />

      {/* Main content area - scrollable, moves to accommodate sidebar on desktop */}
      <main
        className={`flex-1 w-full ml-0 ${
          isSidebarCollapsed ? "md:ml-[4.5rem]" : "md:ml-[240px]"
        } overflow-y-auto overflow-x-hidden min-h-0`}
      >
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
                <AppointmentsPage userName={firstName} mode={mode} />
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

      <CaregiverAuthModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onLogin={onPatientLogin}
        onSignup={onPatientSignup}
        role="patient"
      />
    </div>
  );
}

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedUser = getAuthField("user");
    const token = getStoredToken();
    return Boolean(token && storedUser);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [showCaregiverAssignedModal, setShowCaregiverAssignedModal] =
    useState(false);

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
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Save auth state to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const existing = getAuthData() || {};
      const token = existing?.token || getStoredToken();
      setAuthData({
        ...existing,
        isAuthenticated,
        token,
        user,
        mode,
        onboardingSkipped: existing.onboardingSkipped || false,
        onboardingCompleted: existing.onboardingCompleted || false,
      });
    }
  }, [isAuthenticated, user, mode]);

  // Refresh current user to keep caregiver links in sync
  useEffect(() => {
    if (!isAuthenticated) return;
    let isActive = true;

    const refreshUser = async () => {
      try {
        const currentUser = await api.users.getCurrent();
        const normalizedUser = normalizeUser(currentUser || null);
        if (!normalizedUser || !isActive) return;
        setUser(normalizedUser);
        updateAuthField("user", normalizedUser);
      } catch (error) {
        // Keep existing session if refresh fails
      }
    };

    refreshUser();
    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  // Patient "View Only" notification (shown once when caregiver is assigned)
  useEffect(() => {
    if (!isAuthenticated) return;
    const notified = Boolean(getAuthField("caregiverAssignmentNotified", false));
    const caregivers = user?.caregivers;
    const hasCaregiver =
      Boolean(user?.caregiver) ||
      (Array.isArray(caregivers) && caregivers.length > 0);
    const shouldNotify = user?.role === "patient" && hasCaregiver && !notified;
    if (shouldNotify) {
      setShowCaregiverAssignedModal(true);
    }
  }, [isAuthenticated, user]);

  // Handle login from auth page
  const handleLogin = async (credentials) => {
    const data = await api.auth.signin(credentials);
    const normalizedUser = normalizeUser(data.user || {});
    const userMode =
      normalizedUser.role === "caregiver" ? "Caregiver" : "Personal";
    setUser(normalizedUser);
    setMode(userMode);
    setIsAuthenticated(true);
    return data;
  };

  const handleSignup = async (signupData) => {
    const normalizedRole =
      signupData.role === "caregiver" ? "caregiver" : "patient";
    await api.auth.signup({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      role: normalizedRole,
    });
    const loginData = await api.auth.signin({
      email: signupData.email,
      password: signupData.password,
      role: normalizedRole,
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
    return loginData;
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
      // Switch back to personal mode via patient login
      setShowPatientModal(true);
    }
  };

  // Handle caregiver login
  const handleCaregiverLogin = async (credentials) => {
    const data = await handleLogin(credentials);
    setMode("Caregiver");
    setShowCaregiverModal(false);
    return data;
  };

  const handlePatientLogin = async (credentials) => {
    const data = await handleLogin(credentials);
    setMode("Personal");
    setShowPatientModal(false);
    return data;
  };

  // Handle caregiver signup (show onboarding)
  const handleCaregiverSignup = async (userData) => {
    const data = await handleSignup({ ...userData, role: "caregiver" });
    setShowCaregiverModal(false);
    return data;
  };

  const handlePatientSignup = async (userData) => {
    const data = await handleSignup({ ...userData, role: "patient" });
    setShowPatientModal(false);
    return data;
  };

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage first
    api.auth.logout();

    // Reset state - use functional updates to ensure they process
    setIsAuthenticated(false);
    setUser({ name: "", email: "" });
    setMode("Personal");
    setShowOnboarding(false);
    setPendingUser(null);

    // Force navigation to root to ensure clean state
    // Use setTimeout to ensure state updates process first
    setTimeout(() => {
      window.location.href = "/";
    }, 0);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    await api.users.delete(user.id);
    // Account deleted successfully, log out
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
        <>
          <AppLayout
            user={user}
            mode={mode}
            onSwitchMode={handleSwitchMode}
            onLogout={handleLogout}
            showCaregiverModal={showCaregiverModal}
            setShowCaregiverModal={setShowCaregiverModal}
            onCaregiverLogin={handleCaregiverLogin}
            onCaregiverSignup={handleCaregiverSignup}
            showPatientModal={showPatientModal}
            setShowPatientModal={setShowPatientModal}
            onPatientLogin={handlePatientLogin}
            onPatientSignup={handlePatientSignup}
            onShowOnboarding={handleShowOnboardingFromSettings}
            onDeleteAccount={handleDeleteAccount}
          />

          <Modal
            isOpen={showCaregiverAssignedModal}
            onClose={() => {
              setShowCaregiverAssignedModal(false);
              updateAuthField("caregiverAssignmentNotified", true);
            }}
            title="Caregiver assigned"
            size="sm"
            footerContent={
              <Button
                variant="primary"
                onClick={() => {
                  setShowCaregiverAssignedModal(false);
                  updateAuthField("caregiverAssignmentNotified", true);
                }}
                fullWidth
              >
                Got it
              </Button>
            }
          >
            <div className="p-5">
              <p className="font-poppins text-sm text-text-secondary">
                {Array.isArray(user?.caregivers) && user.caregivers[0]?.name
                  ? `You’ve been assigned a caregiver: ${user.caregivers[0].name}. Your account is now in View Only mode.`
                  : "You’ve been assigned a caregiver. Your account is now in View Only mode."}
              </p>
            </div>
          </Modal>
        </>
      </MedicationsProvider>
    </ErrorProvider>
  );
}

export default App;
