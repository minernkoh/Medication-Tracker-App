/**
 * Calendar (feature component)
 *
 * Displays:
 * - A 7-day week strip for quick navigation
 * - A popover date picker for jumping to specific dates
 *
 * Key behaviors:
 * - Emits `onWeekChange(weekStart)` so pages can prefetch data for the visible week.
 * - Shows appointment dots (`appointments`) and adherence indicators (`adherence` map).
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { CalendarDateButton, SelectMenu } from "../ui";
import {
  MONTHS,
  DAYS,
  getDaysInMonth,
  getStartOfWeek,
  formatShortMonthYear,
  toLocalIsoDay,
} from "../../utils";
import { textStyles } from "../../utils/typography";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Calendar({
  selectedDate,
  onDateChange,
  appointments = [],
  adherence = {},
  onWeekChange,
  mode = "Personal",
  showWeekStrip = true,
  variant = "default", // "default" | "modal"
  className = "",
}) {
  const isCaregiver = mode === "Caregiver";
  const modeTextClass = isCaregiver ? "text-secondary" : "text-primary";
  const modeBgClass = isCaregiver ? "bg-secondary" : "bg-primary";
  const modeBgLightClass = isCaregiver
    ? "bg-secondary-light"
    : "bg-primary-light";
  const modeRingClass = isCaregiver ? "ring-secondary/30" : "ring-primary/30";

  const today = new Date();
  const effectiveSelectedDate = selectedDate || today;
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(selectedDate || today),
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(
    (selectedDate || today).getMonth(),
  );
  const [pickerYear, setPickerYear] = useState(
    (selectedDate || today).getFullYear(),
  );

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);

  const recomputePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;

    const desiredWidth = 320; // ~20rem, matches previous min-w
    const width = Math.min(
      desiredWidth,
      Math.max(0, window.innerWidth - margin * 2),
    );
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const idealLeft = rect.left + rect.width / 2 - width / 2;
    const left = clamp(idealLeft, margin, maxLeft);

    const availableBelow = Math.max(
      0,
      window.innerHeight - rect.bottom - margin,
    );
    const availableAbove = Math.max(0, rect.top - margin);
    const openUp = availableBelow < 380 && availableAbove > availableBelow;
    const maxHeight = openUp ? availableAbove : availableBelow;

    setPanelStyle({
      position: "fixed",
      left,
      width,
      zIndex: 180,
      maxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + margin }
        : { top: rect.bottom + margin }),
    });
  };

  // Close date picker when clicking outside
  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      // Allow interactions with other popovers (e.g. SelectMenu panels rendered in a portal).
      if (target?.closest?.('[data-popover-panel="true"]')) return;

      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setIsDatePickerOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsDatePickerOpen(false);
    };

    // Use click so nested portal menus can handle selection first.
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePickerOpen]);

  useEffect(() => {
    if (!isDatePickerOpen) return;
    recomputePosition();

    const onScrollOrResize = () => recomputePosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [isDatePickerOpen]);

  // Sync week start when selectedDate changes from outside (e.g. Go to Today)
  useEffect(() => {
    setCurrentWeekStart(getStartOfWeek(selectedDate || today));
  }, [selectedDate]);

  // Emit visible week start to parent (for dashboard-level data fetching)
  useEffect(() => {
    onWeekChange?.(currentWeekStart);
  }, [currentWeekStart, onWeekChange]);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateStr = toLocalIsoDay(date);

      dates.push({
        day: DAYS[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
        month: date.getMonth(),
        year: date.getFullYear(),
        hasAppointment: appointments.some((a) => a.date === dateStr),
        hasFullAdherence: adherence[dateStr] === 100,
      });
    }
    return dates;
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToPrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const getCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
    const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const grid = [];
    let dayCount = 1;

    const prevMonth = pickerMonth === 0 ? 11 : pickerMonth - 1;
    const prevYear = pickerMonth === 0 ? pickerYear - 1 : pickerYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const cellIndex = i * 7 + j;
        if (cellIndex < adjustedFirstDay) {
          week.push({
            day: daysInPrevMonth - adjustedFirstDay + cellIndex + 1,
            isCurrentMonth: false,
            month: prevMonth,
            year: prevYear,
          });
        } else if (dayCount <= daysInMonth) {
          week.push({
            day: dayCount,
            isCurrentMonth: true,
            month: pickerMonth,
            year: pickerYear,
          });
          dayCount++;
        } else {
          const nextMonth = pickerMonth === 11 ? 0 : pickerMonth + 1;
          const nextYear = pickerMonth === 11 ? pickerYear + 1 : pickerYear;
          week.push({
            day: dayCount - daysInMonth,
            isCurrentMonth: false,
            month: nextMonth,
            year: nextYear,
          });
          dayCount++;
        }
      }
      grid.push(week);
      if (dayCount > daysInMonth && i >= 3) break;
    }
    return grid;
  };

  const handleDateSelect = (date) => {
    onDateChange(date);
    setIsDatePickerOpen(false);
  };

  const goToToday = () => {
    const d = new Date();
    onDateChange(d);
    setIsDatePickerOpen(false);
  };

  const isSelected = (item) => {
    return (
      effectiveSelectedDate.getDate() === item.date &&
      effectiveSelectedDate.getMonth() === item.month &&
      effectiveSelectedDate.getFullYear() === item.year
    );
  };

  const getDisplayMonthYear = () => {
    const midWeek = new Date(currentWeekStart);
    midWeek.setDate(currentWeekStart.getDate() + 3);
    return formatShortMonthYear(midWeek.getMonth(), midWeek.getFullYear());
  };

  const getModalDisplayDate = () => {
    const dd = String(effectiveSelectedDate.getDate()).padStart(2, "0");
    const month = MONTHS[effectiveSelectedDate.getMonth()] || "";
    const yyyy = effectiveSelectedDate.getFullYear();
    return `${dd} ${month} ${yyyy}`.trim();
  };

  const containerClassName =
    variant === "modal"
      ? `w-full relative overflow-visible ${className}`.trim()
      : `bg-background-default border border-border-default flex flex-col gap-2 items-center p-4 rounded-2xl shrink-0 w-full relative overflow-visible ${className}`.trim();

  const triggerClassName =
    variant === "modal"
      ? `w-full px-4 py-3 rounded-xl border border-border-default font-poppins text-sm bg-background-default hover:bg-background-hover transition-colors flex items-center justify-between gap-2 focus:outline-none ${
          isCaregiver
            ? "focus-visible:ring-2 focus-visible:ring-secondary/35"
            : "focus-visible:ring-2 focus-visible:ring-primary/35"
        } focus-visible:ring-offset-2`
      : "flex items-center justify-center gap-2 w-full group hover:bg-background-hover rounded-lg py-1 px-2 transition-all duration-200";

  const datePickerPanel =
    isDatePickerOpen && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            className="border border-border-default rounded-2xl shadow-2xl p-4 bg-background-default overflow-y-auto overscroll-contain"
            style={panelStyle}
            data-popover-panel="true"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-2 hover:bg-background-hover rounded-lg transition-colors"
              >
                <CaretLeftIcon
                  size={20}
                  weight="bold"
                  className="text-text-primary"
                />
              </button>
              <div className="flex items-center gap-2">
                <SelectMenu
                  value={String(pickerMonth)}
                  onChange={(next) => setPickerMonth(parseInt(next, 10))}
                  options={MONTHS.map((month, idx) => ({
                    value: String(idx),
                    label: month,
                  }))}
                  mode={mode}
                  aria-label="Month"
                  buttonClassName={`${textStyles.heading.small} w-auto px-2 py-1 rounded-lg border-none bg-transparent hover:bg-background-hover`}
                />
                <SelectMenu
                  value={String(pickerYear)}
                  onChange={(next) => setPickerYear(parseInt(next, 10))}
                  options={Array.from({ length: 20 }, (_, i) => 2020 + i).map(
                    (year) => ({
                      value: String(year),
                      label: String(year),
                    }),
                  )}
                  mode={mode}
                  aria-label="Year"
                  buttonClassName={`${textStyles.heading.small} w-auto px-2 py-1 rounded-lg border-none bg-transparent hover:bg-background-hover`}
                />
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-background-hover rounded-lg transition-colors"
              >
                <CaretRightIcon
                  size={20}
                  weight="bold"
                  className="text-text-primary"
                />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <div
                  key={day}
                  className={`${textStyles.caption.small} text-center py-1 font-medium`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarGrid()
                .flat()
                .map((cell, idx) => {
                  const isCellSelected =
                    effectiveSelectedDate.getDate() === cell.day &&
                    effectiveSelectedDate.getMonth() === cell.month &&
                    effectiveSelectedDate.getFullYear() === cell.year;
                  const isCellToday =
                    today.getDate() === cell.day &&
                    today.getMonth() === cell.month &&
                    today.getFullYear() === cell.year;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() =>
                        handleDateSelect(
                          new Date(cell.year, cell.month, cell.day),
                        )
                      }
                      className={`w-9 h-9 rounded-lg font-poppins text-sm transition-all flex items-center justify-center ${
                        isCellSelected
                          ? `font-bold shadow-md ${modeBgClass} text-text-onPrimary`
                          : isCellToday
                            ? `font-semibold ring-1 ${modeRingClass} ${modeBgLightClass} ${modeTextClass}`
                            : !cell.isCurrentMonth
                              ? "text-text-secondary/40 hover:bg-background-hover"
                              : "text-text-primary hover:bg-background-hover"
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
            </div>
            <div className="mt-4 pt-3 flex justify-center border-t border-border-subtle">
              <button
                type="button"
                onClick={goToToday}
                className={`${textStyles.label.medium} px-4 py-2 rounded-lg transition-all ${
                  isCaregiver
                    ? "hover:bg-secondary-light text-secondary"
                    : "hover:bg-primary-light text-primary"
                }`}
              >
                Go to Today
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={containerClassName}>
      <div className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setPickerMonth(effectiveSelectedDate.getMonth());
            setPickerYear(effectiveSelectedDate.getFullYear());
            setIsDatePickerOpen(!isDatePickerOpen);
          }}
          className={triggerClassName}
        >
          {variant !== "modal" && (
            <CalendarIcon
              size={18}
              weight="regular"
              className={`${modeTextClass} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          )}
          <p
            className={
              variant === "modal"
                ? "font-poppins text-sm text-text-primary"
                : `${textStyles.heading.small} text-text-primary text-center`
            }
          >
            {variant === "modal"
              ? getModalDisplayDate()
              : getDisplayMonthYear()}
          </p>
          {isDatePickerOpen ? (
            <CaretUpIcon size={16} weight="bold" className={modeTextClass} />
          ) : (
            <CaretDownIcon
              size={16}
              weight="regular"
              className={
                isCaregiver
                  ? "text-text-secondary group-hover:text-secondary"
                  : "text-text-secondary group-hover:text-primary"
              }
            />
          )}
        </button>
      </div>
      {datePickerPanel}

      {showWeekStrip && (
        <div className="flex gap-1 md:gap-2 min-h-[4.5rem] items-center shrink-0 w-full overflow-x-auto overflow-y-visible pb-4">
          <button
            type="button"
            onClick={goToPreviousWeek}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all"
          >
            <CaretLeftIcon size={20} className="text-icon-primary" />
          </button>
          {getWeekDates().map((item, idx) => (
            <CalendarDateButton
              key={idx}
              day={item.day}
              date={item.date}
              isSelected={isSelected(item)}
              isToday={
                today.getDate() === item.date &&
                today.getMonth() === item.month &&
                today.getFullYear() === item.year
              }
              hasAppointment={item.hasAppointment}
              hasFullAdherence={item.hasFullAdherence}
              onClick={() => onDateChange(item.fullDate)}
              mode={mode}
            />
          ))}
          <button
            type="button"
            onClick={goToNextWeek}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all"
          >
            <CaretRightIcon size={20} className="text-icon-primary" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Calendar;
