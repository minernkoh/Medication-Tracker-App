/**
 * SelectMenu (UI component)
 *
 * Custom dropdown/select component with a portal-rendered popover.
 * Used across the app for consistent "select" UX in both Personal and Caregiver modes.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function SelectMenu({
  value = "",
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  mode = "Personal",
  variant = "default",
  className = "",
  buttonClassName = "",
  listClassName = "",
  fullWidth = true,
  "aria-label": ariaLabel = "Select",
  id,
  name,
  ariaInvalid,
  ariaDescribedBy,
}) {
  const isCaregiver = mode === "Caregiver";
  const isPill = variant === "pill";
  const modeTextClass = isCaregiver ? "text-secondary" : "text-primary";
  const modeRingClass = isCaregiver ? "focus-visible:ring-secondary/35" : "focus-visible:ring-primary/35";

  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);

  const selected = useMemo(() => {
    return Array.isArray(options) ? options.find((o) => o.value === value) : null;
  }, [options, value]);

  const label = selected?.label || (value ? String(value) : "");
  const displayText = label || placeholder || "Select…";

  const close = () => setOpen(false);

  // If this control becomes disabled while open, close the panel.
  useEffect(() => {
    if (!disabled) return;
    close();
  }, [disabled]);

  const recomputePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const desiredMaxHeight = 288; // matches previous max-h-72

    const width = Math.min(rect.width, Math.max(0, window.innerWidth - margin * 2));
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const left = clamp(rect.left, margin, maxLeft);

    const availableBelow = Math.max(0, window.innerHeight - rect.bottom - margin);
    const availableAbove = Math.max(0, rect.top - margin);
    const openUp = availableBelow < 160 && availableAbove > availableBelow;
    const maxHeight = Math.min(desiredMaxHeight, openUp ? availableAbove : availableBelow);

    setPanelStyle({
      position: "fixed",
      left,
      width,
      zIndex: 200,
      maxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + margin }
        : { top: rect.bottom + margin }),
    });
  };

  useEffect(() => {
    if (!open) return;
    recomputePosition();

    const onScrollOrResize = () => recomputePosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }
      close();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isPlaceholderSelected = !value;
  const placeholderDisabled = Boolean(required);

  const items = useMemo(() => {
    const list = Array.isArray(options) ? options : [];
    if (!placeholder) return list;
    return [
      {
        value: "",
        label: placeholder,
        __isPlaceholder: true,
      },
      ...list,
    ];
  }, [options, placeholder]);

  const handleSelect = (opt) => {
    if (disabled) return;
    if (opt?.__isPlaceholder && placeholderDisabled) return;
    onChange?.(opt?.value ?? "");
    close();
  };

  const triggerTextClass = isPlaceholderSelected ? "text-text-secondary" : "text-text-primary";

  const modeHoverBorderClass = isCaregiver ? "hover:border-secondary" : "hover:border-primary";
  const modeFocusBorderClass = isCaregiver ? "focus-visible:border-secondary" : "focus-visible:border-primary";

  const widthClass = fullWidth ? "w-full" : "w-auto";

  const neutralRingClass = "focus-visible:ring-border-default/35";
  const focusRingClass = isPill ? neutralRingClass : modeRingClass;

  const triggerBaseClasses = isPill
    ? `${widthClass} px-3 py-1.5 rounded-lg font-poppins text-xs font-semibold focus:outline-none transition-colors flex items-center justify-between gap-2`
    : `${widthClass} px-4 py-3 rounded-xl border font-poppins text-sm focus:outline-none transition-colors flex items-center justify-between gap-2`;

  const triggerStateClasses = disabled
    ? isPill
      ? "text-text-secondary bg-background-subtle"
      : "text-text-secondary bg-background-subtle border-border-default"
    : isPill
      ? "bg-background-default hover:bg-background-hover"
      : `bg-background-default border-border-default hover:bg-background-hover ${modeHoverBorderClass} ${modeFocusBorderClass}`;

  const triggerClasses = `${triggerBaseClasses} ${triggerStateClasses} ${focusRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClassName} ${
    // Keep disabled truly non-interactive, even if callers pass cursor/hover classes.
    disabled ? "cursor-not-allowed pointer-events-none" : ""
  }`.trim();

  const panel = open && panelStyle
    ? createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className={`rounded-2xl border border-border-default bg-background-default shadow-2xl overflow-hidden ${className}`.trim()}
          data-popover-panel="true"
          role="listbox"
          aria-label={ariaLabel}
        >
          <div
            className={`overflow-y-auto no-scrollbar ${listClassName}`.trim()}
            style={panelStyle?.maxHeight ? { maxHeight: panelStyle.maxHeight } : undefined}
          >
            {items.map((opt) => {
              const isOptSelected = opt.value === value;
              const isOptPlaceholder = Boolean(opt.__isPlaceholder);
              const isOptDisabled = disabled || (isOptPlaceholder && placeholderDisabled);
              return (
                <button
                  key={`${opt.value}__${opt.label}`}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  disabled={isOptDisabled}
                  className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left font-poppins text-sm transition-colors ${
                    isOptDisabled
                      ? "text-text-secondary/60 cursor-not-allowed"
                      : "text-text-primary hover:bg-background-hover"
                  } ${isOptSelected ? "bg-background-hover" : ""}`}
                >
                  <span
                    className={
                      isOptSelected
                        ? `font-semibold ${isPill ? "text-text-primary" : modeTextClass}`
                        : ""
                    }
                  >
                    {opt.label}
                  </span>
                  {isOptSelected && !isOptPlaceholder && (
                    <CheckIcon
                      size={18}
                      weight="bold"
                      className={isPill ? "text-icon-secondary" : modeTextClass}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={triggerClasses}
        aria-haspopup="listbox"
        aria-expanded={disabled ? false : open}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      >
        <span className={`truncate ${triggerTextClass}`}>{displayText}</span>
        {!disabled &&
          (open ? (
            <CaretUpIcon
              size={16}
              weight="bold"
              className={isPill ? "text-icon-secondary" : modeTextClass}
            />
          ) : (
            <CaretDownIcon
              size={16}
              weight="regular"
              className={(() => {
                if (isPill) return "text-icon-secondary";
                if (isPlaceholderSelected) return "text-text-secondary";
                return modeTextClass;
              })()}
            />
          ))}
      </button>
      {panel}
    </>
  );
}

export default SelectMenu;

