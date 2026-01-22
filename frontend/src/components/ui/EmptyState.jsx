/**
 * EmptyState Component - Displays friendly empty state when there's no data
 * Provides consistent empty state UI with icon, message, description, and optional CTA
 *
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} title - Main heading text
 * @param {string} description - Supporting description text
 * @param {React.ReactNode} action - Optional CTA button or action element
 * @param {string} className - Additional CSS classes
 * @param {string} size - "sm" | "md" | "lg" (default: "md")
 */

import React from "react";

const sizeConfig = {
  sm: {
    iconSize: 32,
    titleSize: "text-lg",
    descriptionSize: "text-sm",
    padding: "p-6",
  },
  md: {
    iconSize: 40,
    titleSize: "text-xl",
    descriptionSize: "text-base",
    padding: "p-8",
  },
  lg: {
    iconSize: 48,
    titleSize: "text-2xl",
    descriptionSize: "text-lg",
    padding: "p-10",
  },
};

function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  size = "md",
}) {
  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`flex flex-col w-full h-full min-h-0 flex-1 ${config.padding} ${className} items-center justify-center text-center`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 opacity-50 flex items-center justify-center">
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, { size: config.iconSize })
          ) : (
            icon
          )}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3
          className={`font-poppins font-semibold ${config.titleSize} text-text-primary mb-2`}
        >
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p
          className={`font-poppins font-normal ${config.descriptionSize} text-text-secondary max-w-md mb-6`}
        >
          {description}
        </p>
      )}

      {/* Action/CTA */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
