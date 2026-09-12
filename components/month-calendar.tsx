"use client";

import React, { useState } from "react";
import { DateWindow } from "@/lib/events/types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface MonthCalendarProps {
  dateWindow: DateWindow;
  selectedDate: string | null; // YYYY-MM-DD
  onSelectDate: (date: string | null) => void;
  dateEventCounts: Record<string, number>;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  dateWindow,
  selectedDate,
  onSelectDate,
  dateEventCounts,
}) => {
  // Calendar month state: initialize with the window start year/month
  const [viewDate, setViewDate] = useState(() => {
    return new Date(dateWindow.start.getFullYear(), dateWindow.start.getMonth(), 1);
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-indexed

  // Min and Max months covered by rolling 30-day window
  const minMonthDate = new Date(dateWindow.start.getFullYear(), dateWindow.start.getMonth(), 1);
  const maxMonthDate = new Date(dateWindow.end.getFullYear(), dateWindow.end.getMonth(), 1);

  const canGoPrev = viewDate > minMonthDate;
  const canGoNext = viewDate < maxMonthDate;

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setViewDate(new Date(viewYear, viewMonth - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setViewDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  // Build days grid for viewMonth
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun, 1=Mon...
  // Sunday-first grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; inMonth: boolean; inWindow: boolean }[] = [];

  // Previous month padding
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const padMonth = String(viewMonth).padStart(2, "0"); // previous month (0-indexed viewMonth is 1-indexed prevMonth)
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const actualMonth = viewMonth === 0 ? "12" : padMonth;
    const dateStr = `${prevYear}-${actualMonth}-${String(d).padStart(2, "0")}`;
    days.push({
      dateStr,
      dayNum: d,
      inMonth: false,
      inWindow: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const padMonth = String(viewMonth + 1).padStart(2, "0");
    const padDay = String(d).padStart(2, "0");
    const dateStr = `${viewYear}-${padMonth}-${padDay}`;
    const inWindow = dateStr >= dateWindow.startDateStr && dateStr <= dateWindow.endDateStr;

    days.push({
      dateStr,
      dayNum: d,
      inMonth: true,
      inWindow,
    });
  }

  // Next month padding to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = viewMonth + 2 > 12 ? 1 : viewMonth + 2;
    const nextYear = viewMonth + 1 >= 12 ? viewYear + 1 : viewYear;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      dateStr,
      dayNum: d,
      inMonth: false,
      inWindow: false,
    });
  }

  const weekHeaders = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="w-full bg-paper-card border border-rule rounded-sm p-3.5 shadow-editorial">
      {/* Calendar Header & Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rule">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-ochre" />
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-ink-primary">
              {viewYear} 年 {viewMonth + 1} 月
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ochre-light text-ochre font-semibold border border-ochre-border">
              未來 30 天視窗
            </span>
          </div>
        </div>

        {/* Month Navigation & Clear Selection */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="flex items-center gap-1 text-xs text-ochre hover:text-ochre-hover px-2 py-1 bg-ochre-light rounded border border-ochre-border transition-colors"
            >
              <X className="w-3 h-3" />
              <span>清除選取 ({selectedDate.slice(5)})</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-paper border border-rule rounded p-0.5">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={handlePrevMonth}
              aria-label="上一個月"
              className={`p-1 rounded transition-colors ${
                canGoPrev
                  ? "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted"
                  : "text-ink-faint cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={handleNextMonth}
              aria-label="下一個月"
              className={`p-1 rounded transition-colors ${
                canGoNext
                  ? "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted"
                  : "text-ink-faint cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Table Header */}
      <div className="grid grid-cols-7 gap-1 mt-2 text-center text-xs font-serif font-medium text-ink-muted">
        {weekHeaders.map((w, idx) => (
          <div
            key={w}
            className={`py-1 ${idx === 0 || idx === 6 ? "text-ochre/80 font-bold" : ""}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mt-1 text-center">
        {days.map((item, index) => {
          const count = dateEventCounts[item.dateStr] || 0;
          const isSelected = selectedDate === item.dateStr;
          const isToday = item.dateStr === dateWindow.startDateStr;

          if (!item.inMonth || !item.inWindow) {
            return (
              <div
                key={`${item.dateStr}-${index}`}
                className="h-10 flex flex-col items-center justify-center rounded text-xs text-ink-faint/40 select-none bg-paper-subtle/30"
              >
                <span>{item.dayNum}</span>
              </div>
            );
          }

          return (
            <button
              key={`${item.dateStr}-${index}`}
              type="button"
              aria-label={`${item.dateStr}, ${count} 場活動`}
              onClick={() => {
                onSelectDate(isSelected ? null : item.dateStr);
              }}
              className={`h-10 min-h-[40px] flex flex-col items-center justify-center rounded relative transition-all border ${
                isSelected
                  ? "bg-ochre text-white border-ochre font-bold shadow-sm"
                  : isToday
                  ? "bg-paper-subtle border-ochre/60 text-ink-primary font-semibold"
                  : "bg-paper border-rule text-ink-primary hover:border-ink-secondary hover:bg-paper-card"
              }`}
            >
              <span className="text-xs font-mono">{item.dayNum}</span>

              {/* Event count indicator */}
              {count > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : count > 3
                        ? "bg-ochre"
                        : "bg-ink-primary"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono leading-none ${
                      isSelected ? "text-white" : "text-ink-muted"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              )}

              {isToday && !isSelected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-ochre" title="今天" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-rule flex items-center justify-between text-[11px] text-ink-muted">
        <span className="font-mono">
          範圍：{dateWindow.startDateStr} 至 {dateWindow.endDateStr} (30 天)
        </span>
        <span className="text-ink-faint">點擊特定日期可單日篩選</span>
      </div>
    </div>
  );
};
