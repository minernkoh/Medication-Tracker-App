import { useEffect, useMemo, useRef } from "react";
import { getNowTimeInputRounded } from "../../utils";

const ITEM_HEIGHT = 40; // px (matches h-10)
const VIEWPORT_HEIGHT = 160; // px (matches h-40)
const SPACER_HEIGHT = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;

const pad2 = (n) => String(n).padStart(2, "0");

const parseTime = (value) => {
  const v = String(value || "").trim();
  if (!/^\d{2}:\d{2}$/.test(v)) return null;
  const [hh, mm] = v.split(":");
  const h = Number(hh);
  const m = Number(mm);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hour24: h, minute: m };
};

const toTimeString = (hour24, minute) => `${pad2(hour24)}:${pad2(minute)}`;

const nearestInList = (value, list) => {
  if (!Array.isArray(list) || list.length === 0) return value;
  let best = list[0];
  let bestDist = Math.abs(best - value);
  for (const v of list) {
    const d = Math.abs(v - value);
    if (d < bestDist) {
      best = v;
      bestDist = d;
    }
  }
  return best;
};

function WheelColumn({
  items,
  selected,
  onSelect,
  format = (v) => String(v),
  disabled = false,
  ariaLabel,
  accentTextClass,
}) {
  const scrollerRef = useRef(null);
  const scrollStopTimerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);

  const selectedIndex = useMemo(() => {
    const idx = items.findIndex((v) => v === selected);
    return idx >= 0 ? idx : 0;
  }, [items, selected]);

  const scrollToIndex = (idx, behavior = "auto") => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    isProgrammaticScrollRef.current = true;
    el.scrollTo({
      top: SPACER_HEIGHT + clamped * ITEM_HEIGHT,
      behavior,
    });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 150);
  };

  // Keep scroller aligned to selected value.
  useEffect(() => {
    scrollToIndex(selectedIndex, "auto");
  }, [selectedIndex]);

  const handleScroll = () => {
    if (disabled) return;
    if (isProgrammaticScrollRef.current) return;

    if (scrollStopTimerRef.current) {
      window.clearTimeout(scrollStopTimerRef.current);
    }

    scrollStopTimerRef.current = window.setTimeout(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const raw = el.scrollTop - SPACER_HEIGHT;
      const idx = Math.round(raw / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      if (next !== selected) onSelect?.(next);
      scrollToIndex(clamped, "auto");
    }, 120);
  };

  return (
    <div className="w-full">
      {/* Outer wrapper hides scrollbar while keeping inner scrollable */}
      <div
        className={`h-40 overflow-hidden rounded-xl border border-border-default bg-background-default ${
          disabled ? "cursor-not-allowed" : ""
        }`}
      >
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className={`h-full overflow-y-scroll overscroll-contain pr-4 -mr-4 ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          style={{
            scrollSnapType: "y mandatory",
          }}
          aria-label={ariaLabel}
        >
          <div style={{ height: SPACER_HEIGHT }} />
          {items.map((item) => {
            const isSelected = item === selected;
            return (
              <button
                key={String(item)}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onSelect?.(item);
                  scrollToIndex(items.findIndex((v) => v === item), "smooth");
                }}
                className={`w-full h-10 flex items-center justify-center font-poppins text-sm transition-colors ${
                  isSelected
                    ? `font-semibold ${accentTextClass} bg-background-hover`
                    : "text-text-secondary hover:bg-background-hover"
                }`}
                style={{ scrollSnapAlign: "center" }}
              >
                {format(item)}
              </button>
            );
          })}
          <div style={{ height: SPACER_HEIGHT }} />
        </div>
      </div>
    </div>
  );
}

/**
 * TimePicker - scroll/wheel time selector
 *
 * - Stores/returns time as 24-hour "HH:MM"
 * - Displays as 12-hour wheels (hour + minute + AM/PM) by default
 */
function TimePicker({
  value,
  onChange,
  minuteStep = 15,
  mode = "Personal",
  use12Hour = true,
  disabled = false,
  className = "",
  "aria-label": ariaLabel = "Time",
}) {
  const isCaregiver = mode === "Caregiver";
  const accentTextClass = isCaregiver ? "text-secondary" : "text-primary";

  const step = Math.max(1, Math.min(60, Number(minuteStep) || 1));
  const fallback = getNowTimeInputRounded(step, "nearest");
  const parsed = parseTime(value) || parseTime(fallback);

  const minutes = useMemo(() => {
    const out = [];
    for (let m = 0; m < 60; m += step) out.push(m);
    return out;
  }, [step]);

  const hour24 = parsed?.hour24 ?? 0;
  const minute = nearestInList(parsed?.minute ?? 0, minutes);

  const hour12 = ((hour24 % 12) || 12);
  const period = hour24 >= 12 ? "PM" : "AM";

  const hours = useMemo(() => {
    return use12Hour
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);
  }, [use12Hour]);

  const commit = (next) => {
    if (disabled) return;
    onChange?.(next);
  };

  const setHour = (nextHour) => {
    if (!use12Hour) {
      commit(toTimeString(nextHour, minute));
      return;
    }
    const base = nextHour % 12; // 12 -> 0
    const next24 = period === "PM" ? base + 12 : base;
    commit(toTimeString(next24, minute));
  };

  const setMinute = (nextMinute) => {
    commit(toTimeString(hour24, nextMinute));
  };

  const setPeriod = (nextPeriod) => {
    if (!use12Hour) return;
    const base = hour12 % 12; // 12 -> 0
    const next24 = nextPeriod === "PM" ? base + 12 : base;
    commit(toTimeString(next24, minute));
  };

  return (
    <div
      className={`w-full ${disabled ? "opacity-70" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="flex gap-2">
        <WheelColumn
          items={hours}
          selected={use12Hour ? hour12 : hour24}
          onSelect={setHour}
          format={(h) => pad2(h)}
          disabled={disabled}
          ariaLabel="Hours"
          accentTextClass={accentTextClass}
        />
        <WheelColumn
          items={minutes}
          selected={minute}
          onSelect={setMinute}
          format={(m) => pad2(m)}
          disabled={disabled}
          ariaLabel="Minutes"
          accentTextClass={accentTextClass}
        />
        {use12Hour && (
          <div className="w-[5.5rem]">
            <WheelColumn
              items={["AM", "PM"]}
              selected={period}
              onSelect={setPeriod}
              format={(p) => p}
              disabled={disabled}
              ariaLabel="AM/PM"
              accentTextClass={accentTextClass}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TimePicker;

