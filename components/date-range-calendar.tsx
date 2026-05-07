'use client';
import { useState } from 'react';
import { useLang } from '@/components/lang-provider';

interface DateRangeCalendarProps {
  start: string;
  end: string;
  availableDates?: string[];
  onStartChange: (d: string) => void;
  onEndChange: (d: string) => void;
  minDate?: string;
  open: boolean;
  onClose: () => void;
}

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

export function DateRangeCalendar({
  start,
  end,
  availableDates,
  onStartChange,
  onEndChange,
  minDate,
  onClose,
}: DateRangeCalendarProps) {
  const { t } = useLang();
  const today = toStr(new Date());
  const effectiveMin = minDate ?? today;

  const initYear = start ? new Date(start).getFullYear() : new Date().getFullYear();
  const initMonth = start ? new Date(start).getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [selecting, setSelecting] = useState<'start' | 'end'>(start ? 'end' : 'start');
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const availSet = availableDates ? new Set(availableDates) : null;

  function isSelectable(dateStr: string): boolean {
    if (dateStr < effectiveMin) return false;
    if (availSet !== null && !availSet.has(dateStr)) return false;
    return true;
  }

  function handleDayClick(dateStr: string) {
    if (!isSelectable(dateStr)) return;
    if (selecting === 'start') {
      onStartChange(dateStr);
      const newEnd = addDays(dateStr, 1);
      onEndChange(newEnd);
      setSelecting('end');
    } else {
      if (dateStr >= start) {
        onEndChange(dateStr);
        setSelecting('start');
        onClose();
      } else {
        onStartChange(dateStr);
        onEndChange(addDays(dateStr, 1));
        setSelecting('end');
      }
    }
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  }

  // Build calendar grid (Monday-first)
  const firstDay = new Date(viewYear, viewMonth, 1);
  // getDay: 0=Sun, convert to Mon=0
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d);
    cells.push(toStr(dt));
  }
  // pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null);

  const effectiveHover = selecting === 'end' && hoverDate && hoverDate > start ? hoverDate : null;

  // figure out instruction label
  const instructionText = selecting === 'start' ? t.booking.calSelectStart : t.booking.calSelectEnd;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-full select-none">
      {/* Instruction */}
      <p className="text-label-sm text-primary font-semibold mb-3 text-center">{instructionText}</p>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-low transition cursor-pointer"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">chevron_left</span>
        </button>
        <span className="font-bold text-label-bold text-on-background">
          {MONTHS_EN[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-low transition cursor-pointer"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">chevron_right</span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_EN.map(wd => (
          <div key={wd} className="text-center text-label-sm text-slate-400 font-semibold py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} />;
          }

          const isPast = dateStr < effectiveMin;
          const isUnavail = availSet !== null && !availSet.has(dateStr) && !isPast;
          const notSelectable = isPast || isUnavail;

          const isStart = !!start && dateStr === start;
          const isEnd = !!end && dateStr === end;
          const isToday = dateStr === today;

          const inRange = start && end && start !== end
            ? dateStr > start && dateStr < end
            : false;
          const inHover = effectiveHover && start
            ? dateStr > start && dateStr <= effectiveHover
            : false;

          // Cell-level background for range effect
          let cellBg = '';
          if (!notSelectable && (inRange || inHover)) {
            cellBg = 'bg-blue-50';
          }
          if (isStart && end && end > start) {
            cellBg = 'bg-blue-50 rounded-l-full';
          }
          if (isEnd && start && end > start) {
            cellBg = 'bg-blue-50 rounded-r-full';
          }

          // Day circle styling
          let dayClass = 'relative flex items-center justify-center w-8 h-8 mx-auto text-label-sm font-semibold transition-colors rounded-full';

          if (notSelectable) {
            dayClass += ' text-slate-300 line-through cursor-not-allowed';
          } else if (isStart || isEnd) {
            dayClass += ' bg-primary-container text-white font-bold cursor-pointer';
          } else if (availSet !== null && availSet.has(dateStr)) {
            dayClass += ' bg-green-50 text-green-800 cursor-pointer hover:bg-green-100';
          } else {
            dayClass += ' text-on-background cursor-pointer hover:bg-surface-container-low';
          }

          if (isToday && !isStart && !isEnd) {
            dayClass += ' ring-1 ring-primary';
          }

          return (
            <div key={dateStr} className={`py-0.5 ${cellBg}`}>
              <div
                className={dayClass}
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => !notSelectable && setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                role="button"
                tabIndex={notSelectable ? -1 : 0}
                onKeyDown={e => e.key === 'Enter' && handleDayClick(dateStr)}
                aria-label={dateStr}
                aria-disabled={notSelectable}
              >
                {new Date(dateStr + 'T00:00:00').getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-secondary flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-100 border border-green-300 inline-block" />
          {t.booking.calAvailable}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
          {t.booking.calUnavailable}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary-container inline-block" />
          {t.booking.calSelected}
        </span>
      </div>
    </div>
  );
}
