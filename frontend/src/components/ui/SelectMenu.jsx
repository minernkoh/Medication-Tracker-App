import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";

/**
 * SelectMenu - custom dropdown (styled menu, scrollable options)
 *
 * Props:
 * - value: string
 * - onChange: (nextValue: string) => void
 * - options: Array<{ value: string, label: string }>
 * - placeholder: string (optional)
 * - disabled: boolean
 * - required: boolean
 * - mode: "Personal" | "Caregiver"
 */
function SelectMenu({
  value = "",
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  mode = "Personal",
  className = "",
  buttonClassName = "",
  listClassName = "",
  "aria-label": ariaLabel = "Select",
  id,
  name,
  ariaInvalid,
  ariaDescribedBy,
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

  const selected = useMemo(() => {
    return Array.isArray(options)
      ? options.find((o) => o.value === value)
      : null;
  }, [options, value]);

  const label = selected?.label || (value ? String(value) : "");
  const displayText = label || placeholder || "Select…";

  const close = () => setOpen(false);

  const recomputePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const left = rect.left;
    const top = rect.bottom + 8;
    setPanelStyle({
      position: "fixed",
      left,
      top,
      width,
      zIndex: 200,
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

  const triggerTextClass = isPlaceholderSelected
    ? "text-text-secondary"
    : "text-text-primary";

  const modeHoverBorderClass = isCaregiver
    ? "hover:border-secondary"
    : "hover:border-primary";
  const modeFocusBorderClass = isCaregiver
    ? "focus-visible:border-secondary"
    : "focus-visible:border-primary";

  const triggerClasses =
    `w-full px-4 py-3 rounded-xl border font-poppins text-sm focus:outline-none transition-colors flex items-center justify-between gap-2 ${
      disabled
        ? "text-text-secondary bg-background-subtle border-border-default cursor-not-allowed"
        : `bg-background-default border-border-default hover:bg-background-hover ${modeHoverBorderClass} ${modeFocusBorderClass}`
    } ${modeRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClassName}`.trim();

  const panel =
    open && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className={`rounded-2xl border border-border-default bg-background-default shadow-2xl overflow-hidden ${className}`.trim()}
            role="listbox"
            aria-label={ariaLabel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`max-h-72 overflow-y-auto ${listClassName}`.trim()}>
              {items.map((opt) => {
                const isOptSelected = opt.value === value;
                const isOptPlaceholder = Boolean(opt.__isPlaceholder);
                const isOptDisabled =
                  disabled || (isOptPlaceholder && placeholderDisabled);
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
                      className={`${isOptSelected ? `font-semibold ${modeTextClass}` : ""}`}
                    >
                      {opt.label}
                    </span>
                    {isOptSelected && !isOptPlaceholder && (
                      <CheckIcon
                        size={18}
                        weight="bold"
                        className={modeTextClass}
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
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      >
        <span className={`truncate ${triggerTextClass}`}>{displayText}</span>
        {open ? (
          <CaretUpIcon size={16} weight="bold" className={modeTextClass} />
        ) : (
          <CaretDownIcon
            size={16}
            weight="regular"
            className={
              isPlaceholderSelected ? "text-text-secondary" : modeTextClass
            }
          />
        )}
      </button>
      {panel}
    </>
  );
}

export default SelectMenu;
