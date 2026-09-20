"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CalendarDayReport {
  date: string; // YYYY-MM-DD
  status: "DRAFT" | "READY" | "SUBMITTED" | "FAILED";
  activity?: string;
}

interface CalendarGridProps {
  reports: CalendarDayReport[];
  onSelectDate?: (date: string) => void;
}

export function CalendarGrid({ reports, onSelectDate }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map reports by date string
  const reportsMap = new Map<string, CalendarDayReport>();
  reports.forEach((r) => {
    reportsMap.set(r.date, r);
  });

  const days = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.push({
      dayNumber: day,
      dateString: dStr,
      report: reportsMap.get(dStr),
    });
  }

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-ink-primary">
            {monthNames[month]} {year}
          </h2>
          <span className="text-xs text-ink-muted">
            Kalender Kehadiran &amp; Laporan
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-ink-muted">
        <div>Min</div>
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, index) => {
          if (!d) {
            return (
              <div
                key={`empty-${index}`}
                className="h-16 rounded-sm bg-transparent"
              />
            );
          }

          const isSubmitted = d.report?.status === "SUBMITTED";
          const isDraft = d.report?.status === "DRAFT" || d.report?.status === "READY";
          const isFailed = d.report?.status === "FAILED";

          return (
            <div
              key={d.dateString}
              onClick={() => onSelectDate && onSelectDate(d.dateString)}
              className={`h-16 rounded-sm border p-1.5 flex flex-col justify-between transition-colors cursor-pointer ${
                isSubmitted
                  ? "bg-primary-soft/30 border-primary/30 hover:border-primary"
                  : isDraft
                  ? "bg-warning/5 border-warning/20 hover:border-warning/40"
                  : isFailed
                  ? "bg-error/5 border-error/20 hover:border-error/40"
                  : "bg-canvas-deep border-hairline hover:border-hairline-prominent"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span
                  className={
                    isSubmitted
                      ? "text-primary font-semibold"
                      : "text-ink-secondary"
                  }
                >
                  {d.dayNumber}
                </span>

                {isSubmitted && (
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                )}
                {isDraft && (
                  <Clock className="w-3 h-3 text-warning" />
                )}
                {isFailed && (
                  <AlertCircle className="w-3 h-3 text-error" />
                )}
              </div>

              {d.report ? (
                <div className="text-[10px] text-ink-muted truncate">
                  {d.report.status}
                </div>
              ) : (
                <div className="text-[10px] text-ink-muted/50">-</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
