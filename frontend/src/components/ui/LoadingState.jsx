/**
 * LoadingState Component - Displays loading spinner or skeleton screens
 * Provides consistent loading UI across the application
 *
 * @param {string} type - "spinner" | "skeleton" | "inline" (default: "spinner")
 * @param {string} message - Optional loading message
 * @param {string} size - "sm" | "md" | "lg" (default: "md")
 * @param {boolean} fullScreen - Whether to display full-screen loading (default: false)
 * @param {React.ReactNode} children - Custom skeleton content (for type="skeleton")
 */

import { SpinnerGapIcon } from "@phosphor-icons/react";

const sizeConfig = {
  sm: {
    spinner: 24,
    text: "text-sm",
  },
  md: {
    spinner: 32,
    text: "text-base",
  },
  lg: {
    spinner: 48,
    text: "text-lg",
  },
};

function LoadingState({
  type = "spinner",
  message,
  size = "md",
  fullScreen = false,
  children,
}) {
  const config = sizeConfig[size] || sizeConfig.md;

  if (type === "spinner") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 ${
          fullScreen ? "min-h-screen" : "py-12"
        }`}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      >
        <SpinnerGapIcon
          size={config.spinner}
          weight="bold"
          className="animate-spin text-primary"
        />
        {message && (
          <p
            className={`font-poppins font-medium ${config.text} text-text-secondary`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === "inline") {
    return (
      <div
        className="inline-flex items-center gap-2"
        role="status"
        aria-label="Loading"
      >
        <SpinnerGapIcon
          size={config.spinner}
          weight="bold"
          className="animate-spin text-primary"
        />
        {message && (
          <span
            className={`font-poppins font-medium ${config.text} text-text-secondary`}
          >
            {message}
          </span>
        )}
      </div>
    );
  }

  if (type === "skeleton") {
    return children || <SkeletonScreen />;
  }

  return null;
}

/**
 * SkeletonScreen Component - Placeholder loading UI
 * Shows animated skeleton placeholders for content
 */
export function SkeletonScreen() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Card Skeleton */}
      <div className="bg-background-subtle rounded-2xl p-5 border border-border-default">
        <div className="space-y-3">
          <div className="h-4 bg-background-hover rounded w-3/4" />
          <div className="h-4 bg-background-hover rounded w-1/2" />
          <div className="h-4 bg-background-hover rounded w-2/3" />
        </div>
      </div>
      <div className="bg-background-subtle rounded-2xl p-5 border border-border-default">
        <div className="space-y-3">
          <div className="h-4 bg-background-hover rounded w-3/4" />
          <div className="h-4 bg-background-hover rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonCard Component - Individual skeleton card
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-background-subtle rounded-2xl p-5 border border-border-default animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-background-hover rounded"
            style={{ width: `${100 - i * 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonList Component - List of skeleton items
 */
export function SkeletonList({ count = 3, ItemComponent = SkeletonCard }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  );
}

export default LoadingState;
