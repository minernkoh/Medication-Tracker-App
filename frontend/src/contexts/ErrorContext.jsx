/**
 * ErrorContext - Global error handling context
 * Provides error state and handlers for displaying errors throughout the app
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  const showError = useCallback((message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const error = { id, message, type: "error", duration };

    setErrors((prev) => [...prev, error]);

    return id;
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type: "success", duration };

    setErrors((prev) => [...prev, notification]);

    return id;
  }, []);

  const showWarning = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type: "warning", duration };

    setErrors((prev) => [...prev, notification]);

    return id;
  }, []);

  const showInfo = useCallback((message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type: "info", duration };

    setErrors((prev) => [...prev, notification]);

    return id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  const handleApiError = useCallback(
    (error) => {
      let message = "An unexpected error occurred";

      if (error?.response) {
        // API responded with error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            message = data?.message || "Invalid request. Please check your input.";
            break;
          case 401:
            message = "Please log in to continue";
            break;
          case 403:
            message = "You don't have permission to perform this action";
            break;
          case 404:
            message = data?.message || "The requested resource was not found";
            break;
          case 409:
            message = data?.message || "This resource already exists";
            break;
          case 422:
            message = data?.message || "Validation failed. Please check your input.";
            break;
          case 500:
            message = "Server error. Please try again later.";
            break;
          default:
            message = data?.message || `Error (${status}): Something went wrong`;
        }
      } else if (error?.request) {
        // Request was made but no response received
        message = "Network error. Please check your connection and try again.";
      } else if (error?.message) {
        // Error in request setup
        message = error.message;
      }

      return showError(message);
    },
    [showError]
  );

  return (
    <ErrorContext.Provider
      value={{
        showError,
        showSuccess,
        showWarning,
        showInfo,
        handleApiError,
        removeError,
      }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-tooltip flex flex-col gap-3 pointer-events-none">
        {errors.map((error) => (
          <div key={error.id} className="pointer-events-auto">
            <Toast
              type={error.type}
              message={error.message}
              duration={error.duration}
              onClose={() => removeError(error.id)}
              isVisible={true}
            />
          </div>
        ))}
      </div>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return context;
}
