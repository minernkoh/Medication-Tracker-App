/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React from "react";
import { WarningCircle, ArrowClockwise, House } from "@phosphor-icons/react";
import { colors } from "../../utils/colors";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <WarningCircle
                  size={32}
                  weight="fill"
                  className="text-red-500"
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              We're sorry, but something unexpected happened. Please try
              refreshing the page or return to the home page.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer text-sm font-medium text-text-secondary mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs text-text-secondary font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="mt-1 text-red-600 whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-gray-600 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                style={{
                  boxShadow: "0 0.5rem 1.5rem rgba(21, 93, 252, 0.35)",
                }}
              >
                <ArrowClockwise size={20} weight="bold" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-text-primary rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <House size={20} weight="bold" />
                Go Home
              </button>
            </div>

            {/* Additional Help Text */}
            <p className="text-xs text-text-secondary mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
