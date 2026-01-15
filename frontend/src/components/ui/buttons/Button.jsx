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
import React, { useState } from "react";
import { buttonVariants, sizes, transitions } from "../../../utils/designSystem";
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
  const [isHovered, setIsHovered] = useState(false);

  // Get variant styles
  const variantStyles = buttonVariants[variant] || buttonVariants.primary;

  // Get size styles
  const sizeStyles = sizes.button[size] || sizes.button.base;

  // Build dynamic styles
  const getStyles = () => {
    const baseStyles = {
      backgroundColor: disabled
        ? "#e5e5e5"
        : isHovered
        ? variantStyles.bgHover
        : variantStyles.bg,
      color: disabled ? "#9ca3af" : variantStyles.text,
      boxShadow: disabled
        ? "none"
        : isHovered
        ? variantStyles.shadowHover
        : variantStyles.shadow,
      border: variantStyles.border ? `2px solid ${variantStyles.border}` : "none",
      height: sizeStyles.height,
      paddingLeft: sizeStyles.paddingX,
      paddingRight: sizeStyles.paddingX,
      transition: `all ${transitions.base} ${transitions.easing}`,
    };

    return baseStyles;
  };

  // Icon sizes based on button size
  const iconSizes = {
    sm: 16,
    base: 18,
    lg: 20,
  };

  const iconSize = iconSizes[size] || 18;

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2
        font-poppins font-semibold
        rounded-xl
        cursor-pointer
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "cursor-not-allowed" : ""}
        ${size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm"}
        ${className}
      `}
      style={getStyles()}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
