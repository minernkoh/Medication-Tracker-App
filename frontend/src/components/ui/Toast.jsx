/**
 * Toast Component - Displays temporary notifications (success, error, warning, info)
 * Auto-dismisses after specified duration or can be manually dismissed
 *
 * @param {string} type - "success" | "error" | "warning" | "info"
 * @param {string} message - Toast message
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {function} onClose - Callback when toast is closed
 * @param {boolean} isVisible - Whether toast is visible
 */

import React, { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  InfoIcon,
  XIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";

const iconConfig = {
  success: {
    icon: CheckCircleIcon,
    color: colors.success.DEFAULT,
    bgColor: "bg-success-light",
    borderColor: "border-success",
  },
  error: {
    icon: XCircleIcon,
    color: colors.danger.DEFAULT,
    bgColor: "bg-danger-light",
    borderColor: "border-danger",
  },
  warning: {
    icon: WarningCircleIcon,
    color: colors.warning.DEFAULT,
    bgColor: "bg-warning-light",
    borderColor: "border-warning",
  },
  info: {
    icon: InfoIcon,
    color: colors.primary.DEFAULT,
    bgColor: "bg-primary-light",
    borderColor: "border-primary",
  },
};

function Toast({
  type = "info",
  message,
  duration = 5000,
  onClose,
  isVisible = true,
}) {
  const config = iconConfig[type] || iconConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} shadow-lg animate-slide-up min-w-[300px] max-w-[500px]`}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <Icon
        size={24}
        weight="fill"
        color={config.color}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-poppins font-semibold text-sm text-text-primary leading-snug text-left">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Close notification"
        >
          <XIcon size={18} weight="regular" color={colors.icon.secondary} />
        </button>
      )}
    </div>
  );
}

export default Toast;
