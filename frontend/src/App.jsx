/**
 * App Component - Root component of the application
 * This is the main entry point that React renders first
 */
import React from "react";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Dashboard userName="Sarah" mode="Personal" />
    </div>
  );
}

export default App;
