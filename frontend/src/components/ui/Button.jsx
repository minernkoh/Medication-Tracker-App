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
import React from "react";
import { SpinnerGapIcon } from "@phosphor-icons/react";

function Button({
  variant = "primary",
  size = "base",
  fullWidth = false,
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
  // variant styles using tailwind classes - no js hover state needed
  // Note: Using Tailwind classes that reference design tokens from tailwind.config.js
  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover text-text-onPrimary shadow-glow-primary hover:shadow-glow-primary-hover border-transparent",
    secondary:
      "bg-secondary hover:bg-secondary-hover text-text-onSecondary shadow-glow-secondary hover:shadow-glow-secondary-hover border-transparent",
    success:
      "bg-success hover:bg-success-hover text-text-onPrimary shadow-glow-success hover:shadow-glow-success-hover border-transparent",
    danger:
      "bg-danger hover:bg-danger-hover text-text-onPrimary shadow-glow-danger hover:shadow-glow-danger-hover border-transparent",
    outline:
      "bg-transparent hover:bg-primary/5 text-primary border-2 border-primary shadow-none",
    ghost:
      "bg-transparent hover:bg-black/5 text-text-primary shadow-none border-transparent",
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

  const baseClasses = `
    inline-flex items-center justify-center
    font-poppins font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    disabled:bg-background-subtle disabled:text-text-secondary disabled:shadow-none disabled:cursor-not-allowed
    ${variantClasses[variant] || variantClasses.primary}
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
