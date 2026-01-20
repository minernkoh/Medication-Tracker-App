import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import TimePicker from "./TimePicker";
import { getNowTimeInputRounded, to12HourDisplay } from "../../utils";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * TimePickerDropdown - input-like dropdown that opens the scroll/wheel TimePicker
 *
 * - value/onChange uses "HH:MM"
 * - popover closes on outside click / Esc
 */
function TimePickerDropdown({
  value,
  onChange,
  minuteStep = 15,
  mode = "Personal",
  use12Hour = true,
  disabled = false,
  placeholder = "Select a time…",
  className = "",
  buttonClassName = "",
  panelClassName = "",
  "aria-label": ariaLabel = "Time",
}) {
  const isCaregiver = mode === "Caregiver";
  const modeTextClass = isCaregiver ? "text-secondary" : "text-primary";
  const modeRingClass = isCaregiver
    ? "focus-visible:ring-secondary/35"
    : "focus-visible:ring-primary/35";

  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);

  const step = Math.max(1, Math.min(60, Number(minuteStep) || 1));
  const fallback = getNowTimeInputRounded(step, "nearest");
  const pickerValue = value || fallback;

  // Default empty time selectors to "now" rounded to nearest step.
  useEffect(() => {
    if (disabled) return;
    if (value) return;
    onChange?.(fallback);
  }, [disabled, fallback, onChange, value]);

  const display = useMemo(() => {
    if (!value) return "";
    return use12Hour ? to12HourDisplay(value) : value;
  }, [use12Hour, value]);

  const recomputePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minWidth = 320;
    const width = Math.max(rect.width, minWidth);
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const left = clamp(rect.left, 8, maxLeft);
    const top = rect.bottom + 8;
    setPanelStyle({
      position: "fixed",
      left,
      top,
      width,
      zIndex: 220,
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
      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerTextClass = value ? "text-text-primary" : "text-text-secondary";
  const triggerClasses = `w-full px-4 py-3 rounded-xl border font-poppins text-sm focus:outline-none transition-colors flex items-center justify-between gap-2 ${
    disabled
      ? "text-text-secondary bg-background-subtle border-border-default cursor-not-allowed"
      : "bg-background-default border-border-default hover:bg-background-hover"
  } ${modeRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClassName}`.trim();

  const panel =
    open && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className={`rounded-2xl border border-border-default bg-background-default shadow-2xl p-4 ${panelClassName}`.trim()}
            role="dialog"
            aria-label={ariaLabel}
          >
            <TimePicker
              value={pickerValue}
              onChange={(next) => onChange?.(next)}
              minuteStep={step}
              mode={mode}
              use12Hour={use12Hour}
              disabled={disabled}
            />
            <div className="mt-4 pt-3 flex justify-end border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`px-4 py-2 rounded-lg font-poppins text-sm font-semibold transition-colors ${
                  isCaregiver
                    ? "hover:bg-secondary-light text-secondary"
                    : "hover:bg-primary-light text-primary"
                }`}
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={`${triggerClasses} ${className}`.trim()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={`truncate ${triggerTextClass}`}>
          {display || placeholder}
        </span>
        {open ? (
          <CaretUpIcon size={16} weight="bold" className={modeTextClass} />
        ) : (
          <CaretDownIcon
            size={16}
            weight="regular"
            className="text-text-secondary"
          />
        )}
      </button>
      {panel}
    </>
  );
}

export default TimePickerDropdown;

