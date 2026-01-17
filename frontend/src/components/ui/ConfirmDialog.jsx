/**
 * ConfirmDialog Component - Reusable confirmation dialog
 * Used for delete confirmations, logout confirmations, etc.
 *
 * @param {boolean} isOpen - Whether dialog is open
 * @param {function} onClose - Close callback
 * @param {function} onConfirm - Confirm callback
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text (default: "Confirm")
 * @param {string} cancelText - Cancel button text (default: "Cancel")
 * @param {string} variant - "danger" | "warning" | "info" (default: "danger")
 * @param {React.ReactNode} icon - Optional custom icon
 */

import React from "react";
import {
  WarningIcon,
  SignOutIcon,
  TrashIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";
import Modal from "./Modal";

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
}) {
  const variantConfig = {
    danger: {
      icon: TrashIcon,
      iconColor: colors.danger.DEFAULT,
      iconBg: colors.danger.light,
      confirmBg: colors.danger.DEFAULT,
      confirmHover: colors.danger.hover,
    },
    warning: {
      icon: WarningIcon,
      iconColor: colors.warning.DEFAULT,
      iconBg: colors.warning.light,
      confirmBg: colors.warning.DEFAULT,
      confirmHover: colors.warning.hover,
    },
    info: {
      icon: InfoIcon,
      iconColor: colors.primary.DEFAULT,
      iconBg: colors.primary.light,
      confirmBg: colors.primary.DEFAULT,
      confirmHover: colors.primary.hover,
    },
  };

  const config = variantConfig[variant];
  const DefaultIconComponent = config.icon;

  const handleConfirm = () => {
    // Call onConfirm first - if it causes navigation/unmount, 
    // onClose might not be needed, but we'll try to call it anyway
    if (onConfirm) {
      onConfirm();
    }
    // Only close if component is still mounted (non-navigation scenario)
    // If onConfirm caused navigation, this won't execute anyway
    onClose?.();
  };

  // Render icon - handle both JSX (ReactNode) and component function
  const renderIcon = () => {
    if (icon) {
      // If icon is provided as JSX (React element), render it directly
      if (React.isValidElement(icon)) {
        return icon;
      }
      // If icon is provided as a component function, render it
      const IconComponent = icon;
      return <IconComponent size={32} weight="fill" color={config.iconColor} />;
    }
    // Use default icon component
    return <DefaultIconComponent size={32} weight="fill" color={config.iconColor} />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={true}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: config.iconBg }}
          >
            {renderIcon()}
          </div>

          {/* Title */}
          <h3 className="font-poppins font-bold text-xl text-text-primary mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="font-poppins text-sm text-text-secondary mb-6 max-w-sm">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-text-primary border border-border-default hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: config.confirmBg,
                "--tw-ring-color": config.confirmBg,
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
