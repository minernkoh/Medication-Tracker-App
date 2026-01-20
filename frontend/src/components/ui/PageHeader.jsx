/**
 * PageHeader Component - Standard page header with title, description, and optional action
 *
 * @param {string} title - Page title
 * @param {string} description - Optional description/subtitle
 * @param {React.ReactNode} action - Optional action button/content
 * @param {React.ReactNode} children - Optional additional content (tooltip, etc.)
 * @param {string} variant - "default" | "compact" - Header size variant
 * @param {string} className - Additional CSS classes
 */
import React from "react";

function PageHeader({
  title,
  description,
  action,
  children,
  variant = "default",
  className = "",
}) {
  const titleClasses = {
    default: "font-poppins font-bold leading-none text-2xl md:text-3xl text-text-primary",
    compact: "font-poppins font-bold leading-none text-xl md:text-2xl text-text-primary",
  };

  const descriptionClasses = {
    default: "font-poppins text-base text-text-secondary mt-2",
    compact: "font-poppins text-base text-text-secondary mt-1",
  };

  const marginClasses = {
    default: "mb-8",
    compact: "mb-6",
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${marginClasses[variant]} ${className}`}
    >
      <div className="flex items-center gap-3">
        {typeof title === "string" ? (
          <div>
            <h1 className={titleClasses[variant]}>{title}</h1>
            {description && (
              <p className={descriptionClasses[variant]}>{description}</p>
            )}
          </div>
        ) : (
          title
        )}
        {children}
      </div>
      {action && (
        <div className="self-start sm:self-auto">{action}</div>
      )}
    </div>
  );
}

export default PageHeader;
