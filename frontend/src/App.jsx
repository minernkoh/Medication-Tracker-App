/**
 * App Component - Root component of the application
 * Handles top-level navigation between pages using React Router
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AppointmentsPage from "./components/AppointmentsPage";

function App() {
  const mode = "Personal";

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<Dashboard userName="Sarah" mode={mode} />}
          />
          <Route
            path="/appointments"
            element={<AppointmentsPage userName="Sarah" mode={mode} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
