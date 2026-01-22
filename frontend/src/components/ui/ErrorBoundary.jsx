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
import {
  WarningCircleIcon,
  ArrowClockwiseIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import Button from "./Button.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
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
      const isDev = Boolean(import.meta?.env?.DEV);
      // Custom fallback UI with design tokens
      return (
        <div className="min-h-screen bg-background-default flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-background-default rounded-2xl shadow-elevated border border-border-default p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-danger-light">
                <WarningCircleIcon
                  size={32}
                  weight="fill"
                  className="text-danger"
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="font-poppins font-bold text-2xl text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="font-poppins text-base text-text-secondary mb-6">
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page or return to the home page.
            </p>

            {/* Error Details (only in development) */}
            {isDev && this.state.error && (
              <details className="mb-6 text-left bg-background-subtle rounded-lg p-4 border border-border-default">
                <summary className="cursor-pointer font-poppins font-semibold text-sm text-text-secondary mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="font-poppins text-xs text-text-secondary font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre
                      className="mt-1 whitespace-pre-wrap break-words text-danger"
                    >
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-text-secondary whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon={<ArrowClockwiseIcon size={20} weight="bold" />}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                icon={<HouseIcon size={20} weight="bold" />}
              >
                Go Home
              </Button>
            </div>

            {/* Additional Help Text */}
            <p className="font-poppins text-xs text-text-secondary mt-6">
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
