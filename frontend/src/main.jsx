/**
 * Frontend entry point
 *
 * Creates the React root and mounts the app.
 * Wraps the app with:
 * - `ErrorBoundary` for crash-safe rendering
 * - `BrowserRouter` for client-side routing
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
