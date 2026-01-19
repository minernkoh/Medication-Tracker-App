import React, { useState, useRef, useEffect } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { CalendarDateButton } from "../ui";
import {
  hexToRgba,
  MONTHS,
  DAYS,
  getDaysInMonth,
  getStartOfWeek,
  formatShortMonthYear,
} from "../../utils";
import { colors } from "../../../tailwind.config.js";
import { textStyles } from "../../utils/typography";

function Calendar({
  selectedDate,
  onDateChange,
  appointments = [],
  adherence = {},
  onWeekChange,
}) {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(selectedDate || today));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState((selectedDate || today).getMonth());
  const [pickerYear, setPickerYear] = useState((selectedDate || today).getFullYear());

  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync week start when selectedDate changes from outside (e.g. Go to Today)
  useEffect(() => {
    setCurrentWeekStart(getStartOfWeek(selectedDate));
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
      const dateStr = date.toISOString().split("T")[0];
      
      dates.push({
        day: DAYS[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
        month: date.getMonth(),
        year: date.getFullYear(),
        hasAppointment: appointments.some(a => a.date === dateStr),
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
          week.push({ day: daysInPrevMonth - adjustedFirstDay + cellIndex + 1, isCurrentMonth: false, month: prevMonth, year: prevYear });
        } else if (dayCount <= daysInMonth) {
          week.push({ day: dayCount, isCurrentMonth: true, month: pickerMonth, year: pickerYear });
          dayCount++;
        } else {
          const nextMonth = pickerMonth === 11 ? 0 : pickerMonth + 1;
          const nextYear = pickerMonth === 11 ? pickerYear + 1 : pickerYear;
          week.push({ day: dayCount - daysInMonth, isCurrentMonth: false, month: nextMonth, year: nextYear });
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
      selectedDate.getDate() === item.date &&
      selectedDate.getMonth() === item.month &&
      selectedDate.getFullYear() === item.year
    );
  };

  const getDisplayMonthYear = () => {
    const midWeek = new Date(currentWeekStart);
    midWeek.setDate(currentWeekStart.getDate() + 3);
    return formatShortMonthYear(midWeek.getMonth(), midWeek.getFullYear());
  };

  return (
    <div className="bg-background-default border border-border-default flex flex-col gap-2 items-center p-4 rounded-2xl shrink-0 w-full relative overflow-visible">
      <div className="relative w-full" ref={datePickerRef}>
        <button
          onClick={() => {
            setPickerMonth(selectedDate.getMonth());
            setPickerYear(selectedDate.getFullYear());
            setIsDatePickerOpen(!isDatePickerOpen);
          }}
          className="flex items-center justify-center gap-2 w-full group hover:bg-background-hover rounded-lg py-1 px-2 transition-all duration-200"
        >
          <CalendarIcon size={18} weight="regular" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className={`${textStyles.heading.small} text-text-primary text-center`}>{getDisplayMonthYear()}</p>
          {isDatePickerOpen ? <CaretUpIcon size={16} weight="bold" className="text-primary" /> : <CaretDownIcon size={16} weight="regular" className="text-text-secondary group-hover:text-primary" />}
        </button>

        {isDatePickerOpen && (
          <div
            className="fixed left-1/2 -translate-x-1/2 border border-border-default rounded-2xl shadow-2xl z-[100] p-4 min-w-[20rem] bg-background-default"
            style={{
              top: datePickerRef.current ? datePickerRef.current.getBoundingClientRect().bottom + 8 : "auto",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <CaretLeftIcon size={20} weight="bold" className="text-text-primary" />
              </button>
              <div className="flex items-center gap-2">
                <select value={pickerMonth} onChange={(e) => setPickerMonth(parseInt(e.target.value))} className={`${textStyles.heading.small} bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 border-none outline-none text-text-primary`}>
                  {MONTHS.map((month, idx) => <option key={month} value={idx}>{month}</option>)}
                </select>
                <select value={pickerYear} onChange={(e) => setPickerYear(parseInt(e.target.value))} className={`${textStyles.heading.small} bg-transparent hover:bg-gray-100 rounded-lg px-2 py-1 border-none outline-none text-text-primary`}>
                  {Array.from({ length: 20 }, (_, i) => 2020 + i).map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <CaretRightIcon size={20} weight="bold" className="text-text-primary" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => <div key={day} className={`${textStyles.caption.small} text-center py-1 font-medium`}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarGrid().flat().map((cell, idx) => {
                const isCellSelected = selectedDate.getDate() === cell.day && selectedDate.getMonth() === cell.month && selectedDate.getFullYear() === cell.year;
                const isCellToday = today.getDate() === cell.day && today.getMonth() === cell.month && today.getFullYear() === cell.year;
                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(new Date(cell.year, cell.month, cell.day))}
                    className={`w-9 h-9 rounded-lg font-poppins text-sm transition-all flex items-center justify-center ${isCellSelected ? "font-bold shadow-md bg-primary text-text-onPrimary" : isCellToday ? "font-semibold ring-1 ring-primary/30 bg-primary-light text-primary" : !cell.isCurrentMonth ? "text-text-secondary/40 hover:bg-gray-100" : "text-text-primary hover:bg-gray-100"}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 flex justify-center border-t border-border-subtle">
              <button onClick={goToToday} className={`${textStyles.label.medium} px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-primary`}>Go to Today</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1 md:gap-2 min-h-[4.5rem] items-center shrink-0 w-full overflow-x-auto overflow-y-visible pb-4">
        <button onClick={goToPreviousWeek} className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all"><CaretLeftIcon size={20} className="text-icon-primary" /></button>
        {getWeekDates().map((item, idx) => (
          <CalendarDateButton
            key={idx}
            day={item.day}
            date={item.date}
            isSelected={isSelected(item)}
            isToday={today.getDate() === item.date && today.getMonth() === item.month && today.getFullYear() === item.year}
            hasAppointment={item.hasAppointment}
            hasFullAdherence={item.hasFullAdherence}
            onClick={() => onDateChange(item.fullDate)}
          />
        ))}
        <button onClick={goToNextWeek} className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-background-hover rounded-lg transition-all"><CaretRightIcon size={20} className="text-icon-primary" /></button>
      </div>
    </div>
  );
}

export default Calendar;
