/**
 * SectionHeader Component - Section header with icon, title, and optional action
 *
 * @param {React.ReactNode} icon - Icon component
 * @param {string} title - Section title
 * @param {string} description - Optional description/subtitle
 * @param {React.ReactNode} action - Optional action button/content
 * @param {string} variant - "default" | "compact" - Header size variant
 * @param {string} className - Additional CSS classes
 */

function SectionHeader({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}) {
  const titleClasses = {
    default: "font-poppins font-bold text-xl text-text-primary",
    compact: "font-poppins font-bold text-lg text-text-primary",
  };

  const marginClasses = {
    default: "mb-4",
    compact: "mb-3",
  };

  return (
    <div
      className={`flex items-center justify-between ${marginClasses[variant]} ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          <h2 className={titleClasses[variant]}>{title}</h2>
          {description && (
            <p className="font-poppins text-sm text-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default SectionHeader;
