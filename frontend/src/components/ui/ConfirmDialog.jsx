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
import { WarningIcon, TrashIcon, InfoIcon } from "@phosphor-icons/react";
import Modal from "./Modal";
import Button from "./Button";

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
  mode = "Personal",
}) {
  const variantConfig = {
    danger: {
      icon: TrashIcon,
      iconClassName: "text-danger",
      iconBgClassName: "bg-danger-light",
      confirmClassName:
        "bg-danger hover:bg-danger-hover focus-visible:ring-danger/35",
    },
    warning: {
      icon: WarningIcon,
      iconClassName: "text-warning",
      iconBgClassName: "bg-warning-light",
      confirmClassName:
        "bg-warning hover:bg-warning-hover focus-visible:ring-warning/35",
    },
    info: {
      icon: InfoIcon,
      iconClassName: "text-primary",
      iconBgClassName: "bg-primary-light",
      confirmClassName:
        "bg-primary hover:bg-primary-hover focus-visible:ring-primary/35",
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
      return (
        <IconComponent size={32} weight="fill" className={config.iconClassName} />
      );
    }
    // Use default icon component
    return (
      <DefaultIconComponent
        size={32}
        weight="fill"
        className={config.iconClassName}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      mode={mode}
    >
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.iconBgClassName}`}
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
            <Button
              type="button"
              variant="modalSecondary"
              onClick={onClose}
              mode={mode}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-text-onPrimary transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${config.confirmClassName}`}
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
