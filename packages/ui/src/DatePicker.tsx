import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  label?: string;
  value?: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date (DD/MM/YYYY)',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState<Date>(parsedDate || new Date());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const formattedDisplay = parsedDate
    ? `${String(parsedDate.getDate()).padStart(2, '0')}/${String(
        parsedDate.getMonth() + 1
      ).padStart(2, '0')}/${parsedDate.getFullYear()}`
    : '';

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const iso = `${year}-${monthStr}-${dayStr}`;
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-1 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-9 rounded-[4px] border px-3 flex items-center justify-between text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0A77FE] focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error ? 'border-[#F83A20]' : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${formattedDisplay ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <span>{formattedDisplay || placeholder}</span>
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 p-3 w-64 rounded-[4px] border border-slate-200 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">
              {MONTH_NAMES[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-[4px] hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-[4px] hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                parsedDate &&
                parsedDate.getFullYear() === year &&
                parsedDate.getMonth() === month &&
                parsedDate.getDate() === day;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 text-xs rounded-[4px] flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#0A77FE] text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-[#F83A20] font-medium">{error}</p>}
    </div>
  );
};
