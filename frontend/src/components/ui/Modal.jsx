/**
 * Modal Component - Reusable modal base component
 * Provides consistent modal structure, backdrop, close behavior, and accessibility
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - "sm" | "md" | "lg" | "xl" (default: "lg")
 * @param {boolean} showCloseButton - Whether to show close button (default: true)
 * @param {string} className - Additional CSS classes for modal content
 * @param {React.ReactNode} headerContent - Custom header content (optional, overrides title)
 * @param {React.ReactNode} footerContent - Footer content (optional)
 */

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  showCloseButton = true,
  className = "",
  headerContent,
  footerContent,
  mode = "Personal",
}) {
  const isCaregiver = mode === "Caregiver";

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-background-default rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col shadow-xl animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (pinned top-right, no header bar) */}
        {showCloseButton && !headerContent && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-background-hover transition-colors focus:outline-none focus-visible:ring-2 ${
              isCaregiver ? "focus-visible:ring-secondary/35" : "focus-visible:ring-primary/35"
            } focus-visible:ring-offset-2 z-10`}
            aria-label="Close modal"
          >
            <XIcon size={24} weight="regular" color={colors.icon.primary} />
          </button>
        )}

        {/* Header */}
        {headerContent ? (
          <div className="flex-shrink-0 w-full">
            {headerContent}
          </div>
        ) : title ? (
          <div className="p-5 pb-0 flex-shrink-0">
            <h2
              id="modal-title"
              className="font-poppins font-bold text-xl text-text-primary"
            >
              {title}
            </h2>
          </div>
        ) : null}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footerContent && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-border-default flex-shrink-0">
            {footerContent}
          </div>
        )}
      </div>
    </div>
    ,
    document.body,
  );
}

export default Modal;
