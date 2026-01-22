/**
 * ErrorContext - Global error handling context
 * Provides error state and handlers for displaying errors throughout the app
 */

import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";
import { getErrorMessage } from "../utils/apiErrorHandler";

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
      const message = getErrorMessage(error);
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
