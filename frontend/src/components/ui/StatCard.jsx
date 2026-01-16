/**
 * StatCard Component - Display a statistic with icon, label, value, and description
 *
 * @param {React.ReactNode} icon - Icon component
 * @param {string} label - Label text (e.g., "Today", "Weekly")
 * @param {string|number} value - Statistic value to display
 * @param {string} description - Description text below value
 * @param {string} iconColor - Optional custom color for icon
 * @param {string} variant - "default" | "compact" - Card size variant
 * @param {string} className - Additional CSS classes
 */
import React from "react";

function StatCard({
  icon,
  label,
  value,
  description,
  iconColor,
  variant = "default",
  className = "",
}) {
  const valueClasses = {
    default: "font-poppins font-bold text-2xl text-text-primary",
    compact: "font-poppins font-bold text-xl text-text-primary",
  };

  const paddingClasses = {
    default: "p-4",
    compact: "p-3",
  };

  return (
    <div
      className={`bg-background-default border border-border-default rounded-2xl ${paddingClasses[variant]} ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div
            style={iconColor ? { color: iconColor } : undefined}
            className="flex-shrink-0"
          >
            {icon}
          </div>
        )}
        {label && (
          <span className="font-poppins text-xs text-text-secondary">
            {label}
          </span>
        )}
      </div>
      <p className={valueClasses[variant]}>{value}</p>
      {description && (
        <p className="font-poppins text-sm text-text-secondary mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

export default StatCard;
