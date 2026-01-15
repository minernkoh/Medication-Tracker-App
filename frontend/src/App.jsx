/**
 * App Component - Root component of the application
 * Handles top-level navigation between pages using React Router
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AppointmentsPage from "./components/AppointmentsPage";
import MedicationPage from "./components/MedicationPage";
import Sidebar from "./components/Sidebar";

function App() {
  const mode = "Personal";
  const userName = "Sarah Johnson";
  const userEmail = "sarahjohnson@gmail.com";

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex">
        {/* Sidebar is now always visible on desktop, shows on mobile via toggle */}
        <Sidebar userName={userName} userEmail={userEmail} mode={mode} />

        {/* Main content area - moves to accommodate sidebar on desktop */}
        <div className="flex-1 ml-0 md:ml-[256px]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<Dashboard userName="Sarah" mode={mode} />}
            />
            <Route
              path="/medications"
              element={<MedicationPage userName="Sarah" mode={mode} />}
            />
            <Route
              path="/appointments"
              element={<AppointmentsPage userName="Sarah" mode={mode} />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
