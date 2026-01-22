/**
 * Button Component - Reusable button with variants and glow effects
 *
 * @param {string} variant - "primary" | "secondary" | "success" | "danger" | "outline" | "ghost"
 * @param {string} size - "sm" | "base" | "lg"
 * @param {boolean} fullWidth - Whether button takes full width
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether button is in loading state
 * @param {React.ReactNode} icon - Icon component to show before text
 * @param {React.ReactNode} iconRight - Icon component to show after text
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 */
import { SpinnerGapIcon } from "@phosphor-icons/react";

function Button({
  variant = "primary",
  size = "base",
  fullWidth = false,
  mode = "Personal",
  disabled = false,
  loading = false,
  icon,
  iconRight,
  children,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const isCaregiver = mode === "Caregiver";

  const outlineClasses = isCaregiver
    ? "bg-transparent hover:bg-secondary/5 text-secondary border-2 border-secondary"
    : "bg-transparent hover:bg-primary/5 text-primary border-2 border-primary";

  // variant styles using tailwind classes - no js hover state needed
  // Note: Using Tailwind classes that reference design tokens from tailwind.config.js
  const variantVisualClasses = {
    primary:
      "bg-primary hover:bg-primary-hover text-text-onPrimary border-transparent",
    secondary:
      "bg-secondary hover:bg-secondary-hover text-text-onSecondary border-transparent",
    success:
      "bg-success hover:bg-success-hover text-text-onPrimary border-transparent",
    danger:
      "bg-danger hover:bg-danger-hover text-text-onPrimary border-transparent",
    outline: outlineClasses,
    modalSecondary:
      "bg-transparent hover:bg-background-hover text-text-primary border border-border-default",
    ghost: "bg-transparent hover:bg-black/5 text-text-primary border-transparent",
  };

  const glowClassesByVariant = {
    primary: {
      sm: "shadow-glow-primary-sm hover:shadow-glow-primary-sm-hover",
      base: "shadow-glow-primary hover:shadow-glow-primary-hover",
    },
    secondary: {
      sm: "shadow-glow-secondary-sm hover:shadow-glow-secondary-sm-hover",
      base: "shadow-glow-secondary hover:shadow-glow-secondary-hover",
    },
    success: {
      sm: "shadow-glow-success-sm hover:shadow-glow-success-sm-hover",
      base: "shadow-glow-success hover:shadow-glow-success-hover",
    },
    danger: {
      sm: "shadow-glow-danger-sm hover:shadow-glow-danger-sm-hover",
      base: "shadow-glow-danger hover:shadow-glow-danger-hover",
    },
    outline: { sm: "shadow-none", base: "shadow-none" },
    modalSecondary: { sm: "shadow-none", base: "shadow-none" },
    ghost: { sm: "shadow-none", base: "shadow-none" },
  };

  const focusRingColorByVariant = {
    primary: "focus-visible:ring-primary/35",
    secondary: "focus-visible:ring-secondary/35",
    success: "focus-visible:ring-success/35",
    danger: "focus-visible:ring-danger/35",
    outline: isCaregiver ? "focus-visible:ring-secondary/35" : "focus-visible:ring-primary/35",
    modalSecondary: "focus-visible:ring-primary/35",
    ghost: "focus-visible:ring-primary/25",
  };

  // size styles using tailwind classes
  const sizeClasses = {
    sm: "h-8 px-3 text-sm gap-1.5",
    base: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-5 text-base gap-2",
  };

  // icon sizes based on button size
  const iconSizes = {
    sm: 16,
    base: 18,
    lg: 20,
  };

  const iconSize = iconSizes[size] || 18;

  const isSmall = size === "sm";
  const focusRingWidth = isSmall ? "focus-visible:ring-1" : "focus-visible:ring-2";
  const focusRingOffset = isSmall
    ? "focus-visible:ring-offset-1"
    : "focus-visible:ring-offset-2";
  const focusRingColor = (() => {
    if (variant === "modalSecondary") {
      return isCaregiver ? "focus-visible:ring-secondary/35" : "focus-visible:ring-primary/35";
    }
    return focusRingColorByVariant[variant] || focusRingColorByVariant.primary;
  })();

  const glowKey = isSmall ? "sm" : "base";
  const glowClasses =
    glowClassesByVariant[variant]?.[glowKey] || glowClassesByVariant.primary[glowKey];

  const baseClasses = `
    inline-flex items-center justify-center
    font-poppins font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none ${focusRingWidth} ${focusRingColor} ${focusRingOffset}
    disabled:bg-background-subtle disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed
    ${variantVisualClasses[variant] || variantVisualClasses.primary}
    ${glowClasses}
    ${sizeClasses[size] || sizeClasses.base}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <SpinnerGapIcon size={iconSize} weight="bold" className="animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
}

export default Button;
