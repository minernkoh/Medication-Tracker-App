import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import {
  Dashboard,
  MedicationPage,
  AppointmentsPage,
  CaregiverDashboard,
  PatientsPage,
  PatientDetailPage,
  CaregiverAppointmentsPage,
  Sidebar,
  AuthPage,
  OnboardingTutorial,
} from "./components";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleShowOnboarding = (userData) => {
    setUser(userData);
    setShowOnboarding(true);
  };

  // Simple layout wrapper
  const Layout = ({ children }) => (
    <div className="flex h-full w-full bg-background-default overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden h-full">{children}</main>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="h-full w-full">
        <AuthPage
          onLogin={handleLogin}
          onShowOnboarding={handleShowOnboarding}
        />
        {showOnboarding && (
          <OnboardingTutorial
            user={user}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </div>
    );
  }

  // Get user role to determine which routes to show
  const userRole = user?.role || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.role : null);
  const isCaregiver = userRole === "caregiver";

  return (
    <div className="h-full w-full">
      <Layout>
        <Routes>
          {/* Patient Routes - only accessible to patients */}
          {!isCaregiver && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medications" element={<MedicationPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
            </>
          )}

          {/* Caregiver Routes */}
          {isCaregiver && (
            <>
              <Route path="/" element={<CaregiverDashboard />} />
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              <Route path="/caregiver/patients" element={<PatientsPage />} />
              <Route
                path="/caregiver/schedule"
                element={<CaregiverAppointmentsPage />}
              />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
            </>
          )}

          {/* Redirect caregivers away from patient routes */}
          {isCaregiver && (
            <>
              <Route path="/medications" element={<CaregiverDashboard />} />
              <Route path="/appointments" element={<CaregiverDashboard />} />
            </>
          )}

          {/* Redirect patients away from caregiver routes */}
          {!isCaregiver && (
            <>
              <Route path="/caregiver" element={<Dashboard />} />
              <Route path="/caregiver/patients" element={<Dashboard />} />
              <Route path="/caregiver/schedule" element={<Dashboard />} />
              <Route path="/patients/:id" element={<Dashboard />} />
            </>
          )}
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
