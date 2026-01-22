/**
 * AutocompleteInput (UI component)
 *
 * An input with a styled dropdown list (combobox-like).
 * Used for searchable/selectable text fields while still behaving like a normal input.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function AutocompleteInput({
  name,
  value = "",
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  className = "",
  mode = "Personal",
  openOnFocus = true,
  "aria-label": ariaLabel = "Autocomplete",
  ariaInvalid,
  ariaDescribedBy,
  id,
}) {
  const isCaregiver = mode === "Caregiver";
  const modeTextClass = isCaregiver ? "text-secondary" : "text-primary";
  const modeRingClass = isCaregiver
    ? "focus-visible:ring-secondary/35"
    : "focus-visible:ring-primary/35";

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);

  const filtered = useMemo(() => {
    const list = Array.isArray(options) ? options : [];
    const needle = String(value || "").trim().toLowerCase();
    if (!needle) return list;
    return list.filter((o) => {
      const v = String(o?.value || "").toLowerCase();
      const l = String(o?.label || "").toLowerCase();
      return v.includes(needle) || l.includes(needle);
    });
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(filtered.length ? 0 : -1);
  }, [filtered.length, open]);

  const recomputePosition = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const desiredMaxHeight = 288;

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
      zIndex: 210,
      maxHeight,
      ...(openUp ? { bottom: window.innerHeight - rect.top + margin } : { top: rect.bottom + margin }),
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
      if (inputRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) {
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

  const handleSelect = (opt) => {
    if (disabled) return;
    const nextValue = String(opt?.value ?? "");
    onChange?.({ target: { name, value: nextValue } });
    setOpen(false);
  };

  const inputHasValue = Boolean(String(value || "").trim());
  const caretClass = disabled
    ? "text-text-secondary/60"
    : open
      ? modeTextClass
      : inputHasValue
        ? modeTextClass
        : "text-text-secondary";

  const listId = (id || name) ? `${id || name}-listbox` : undefined;

  const panel =
    open && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="rounded-2xl border border-border-default bg-background-default shadow-2xl overflow-hidden"
            data-popover-panel="true"
            role="listbox"
            aria-label={ariaLabel}
            id={listId}
          >
            <div
              className="overflow-y-auto no-scrollbar"
              style={panelStyle?.maxHeight ? { maxHeight: panelStyle.maxHeight } : undefined}
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-3 font-poppins text-sm text-text-secondary">
                  No matches
                </div>
              ) : (
                filtered.map((opt, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`${opt.value}__${opt.label}`}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(opt)}
                      className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left font-poppins text-sm transition-colors ${
                        disabled
                          ? "text-text-secondary/60 cursor-not-allowed"
                          : "text-text-primary hover:bg-background-hover"
                      } ${isActive ? "bg-background-hover" : ""}`}
                      disabled={disabled}
                    >
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          id={id || name}
          name={name}
          type="text"
          value={value || ""}
          onChange={(e) => {
            onChange?.(e);
            if (!disabled) setOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            if (openOnFocus) setOpen(true);
          }}
          onClick={() => {
            if (disabled) return;
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              setOpen(true);
              return;
            }
            if (!open) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => clamp(i + 1, 0, Math.max(0, filtered.length - 1)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => clamp(i - 1, 0, Math.max(0, filtered.length - 1)));
            } else if (e.key === "Enter") {
              if (activeIndex >= 0 && activeIndex < filtered.length) {
                e.preventDefault();
                handleSelect(filtered[activeIndex]);
              }
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`${className} pr-10 ${modeRingClass} focus-visible:ring-2 focus-visible:ring-offset-2`.trim()}
          role="combobox"
          aria-expanded={disabled ? false : open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center focus:outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {open ? (
            <CaretUpIcon size={16} weight="bold" className={caretClass} />
          ) : (
            <CaretDownIcon size={16} weight="regular" className={caretClass} />
          )}
        </button>
      </div>
      {panel}
    </>
  );
}

export default AutocompleteInput;

