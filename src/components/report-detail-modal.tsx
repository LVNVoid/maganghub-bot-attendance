"use client";

import * as React from "react";
import Link from "next/link";
import type { ReportItem } from "@/schemas/report-schema";
import { Button } from "@/components/ui/button";
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  AlertTriangle,
  FileText,
  ExternalLink,
  Lock,
} from "lucide-react";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
}

export function ReportDetailModal({
  isOpen,
  onClose,
  report,
}: ReportDetailModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const isSubmitted = report.status === "SUBMITTED";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-soft text-primary border border-primary/20">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-error/10 text-error border border-error/20">
            <AlertCircle className="w-3 h-3" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface text-ink-secondary border border-hairline">
            <Clock className="w-3 h-3 text-ink-muted" /> Draft
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-canvas-subtle border border-hairline rounded-md shadow-2xl overflow-hidden focus:outline-none animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-hairline bg-canvas-deep">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2
                id="report-modal-title"
                className="font-mono text-sm sm:text-base font-semibold text-ink-primary"
              >
                {report.date}
              </h2>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-[11px] text-ink-muted flex items-center gap-2">
              <span>Sumber: {report.sourceType}</span>
              {isSubmitted && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Lock className="w-3 h-3" /> Terkunci (Read-Only)
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1.5 rounded-xs transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Aktivitas */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-ink-primary font-semibold">
              <FileText className="w-4 h-4 text-primary" />
              <span>1. Uraian Aktivitas (Hasil Kerja)</span>
            </div>
            <div className="p-3.5 rounded-xs bg-canvas border border-hairline text-ink-primary whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
              {report.activity}
            </div>
          </div>

          {/* Section 2: Pembelajaran */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>2. Pembelajaran yang Diperoleh</span>
            </div>
            <div className="p-3.5 rounded-xs bg-primary/5 border border-primary/20 text-ink-primary whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
              {report.learning}
            </div>
          </div>

          {/* Section 3: Kendala */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-warning font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Kendala yang Dihadapi &amp; Solusi</span>
            </div>
            <div className="p-3.5 rounded-xs bg-warning/5 border border-warning/20 text-ink-primary whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
              {report.obstacles}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-t border-hairline bg-canvas-deep">
          <Link href={`/reports?date=${report.date}`} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 h-9 sm:h-8 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isSubmitted ? "Buka di Editor (Read-Only)" : "Edit di Editor"}</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-9 sm:h-8 px-4 text-xs"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
