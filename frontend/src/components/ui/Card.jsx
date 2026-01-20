/**
 * Card Component - Reusable card base component
 * Provides consistent card styling and interactive states
 *
 * @param {React.ReactNode} children - Card content
 * @param {function} onClick - Optional click handler (makes card interactive)
 * @param {string} variant - "default" | "elevated" | "outlined" (default: "default")
 * @param {boolean} interactive - Whether card is interactive (default: false if onClick provided, true if onClick is provided)
 * @param {string} accent - "primary" | "secondary" | "success" | "danger" (default: "primary") - interactive ring/border accent
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} header - Optional header content
 * @param {React.ReactNode} footer - Optional footer content
 */

const variantClasses = {
  default: "bg-background-default border border-border-default",
  elevated: "bg-background-default shadow-elevated border border-transparent",
  outlined: "bg-transparent border-2 border-border-default",
};

const interactiveClassesByAccent = {
  primary:
    "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-primary hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-secondary hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
  success:
    "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-success hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2",
  danger:
    "cursor-pointer hover:border-transparent hover:ring-2 hover:ring-danger hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
};

function Card({
  children,
  onClick,
  variant = "default",
  interactive = !!onClick,
  accent = "primary",
  className = "",
  header,
  footer,
  ...props
}) {
  const interactiveClasses =
    interactiveClassesByAccent[accent] || interactiveClassesByAccent.primary;

  const baseClasses = `
    rounded-2xl p-5
    ${variantClasses[variant]}
    ${
      interactive
        ? interactiveClasses
        : ""
    }
    ${className}
  `;

  // If interactive and no explicit element, use button for accessibility
  if (interactive && onClick) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
          }
        }}
        {...props}
      >
        {header && <div className="mb-4">{header}</div>}
        <div>{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </button>
    );
  }

  // Non-interactive card
  return (
    <div className={baseClasses} {...props}>
      {header && <div className="mb-4">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export default Card;
