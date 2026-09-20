"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateReportDraft, saveReportDraft } from "@/app/(dashboard)/reports/actions";
import { isSunday } from "@/lib/date-utils";
import { Sparkles, Save, CheckCircle2, AlertTriangle, Loader2, CalendarOff } from "lucide-react";

interface ReportData {
  id?: string;
  date: string;
  activity: string;
  learning: string;
  obstacles: string;
  status?: string;
}

interface ReportFormProps {
  initialReport?: ReportData | null;
  selectedDate: string;
  onDateChange?: (date: string) => void;
}

export function ReportForm({
  initialReport,
  selectedDate,
  onDateChange,
}: ReportFormProps) {
  const [date, setDate] = useState(initialReport?.date || selectedDate);
  const [activity, setActivity] = useState(initialReport?.activity || "");
  const [learning, setLearning] = useState(initialReport?.learning || "");
  const [obstacles, setObstacles] = useState(initialReport?.obstacles || "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDateSelect = (newDate: string) => {
    setDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handleGenerateAI = async () => {
    setGenerating(true);

    const res = await generateReportDraft(date);
    if (res?.error) {
      toast.error(res.error);
    } else if (res?.report) {
      setActivity(res.report.activity);
      setLearning(res.report.learning);
      setObstacles(res.report.obstacles);
      toast.success("Draft laporan berhasil di-generate!");
    }
    setGenerating(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("date", date);

    const res = await saveReportDraft(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Draft berhasil disimpan.");
    }
    setSaving(false);
  };

  const renderCharCounter = (text: string) => {
    const len = text.trim().length;
    const isValid = len >= 100;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${
          isValid
            ? "bg-primary-soft text-primary border border-primary/20"
            : "bg-warning/10 text-warning border border-warning/20"
        }`}
      >
        {isValid ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <AlertTriangle className="w-3 h-3" />
        )}
        {len}/100 karakter {isValid ? "(Valid)" : `(Kurang ${100 - len})`}
      </span>
    );
  };

  const isFormValid =
    activity.trim().length >= 100 &&
    learning.trim().length >= 100 &&
    obstacles.trim().length >= 100;

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">
            Editor Laporan Harian MagangHub
          </h2>
          <p className="text-xs text-ink-secondary">
            Setiap bagian wajib minimal 100 karakter sesuai validasi Monev Kemnaker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateSelect(e.target.value)}
            className="w-40 text-xs h-8"
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateAI}
            disabled={generating}
            className="gap-1.5 h-8 text-xs border-primary/30 text-primary hover:bg-primary-soft"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {generating ? "Menganalisis..." : "Generate AI"}
          </Button>
        </div>
      </div>

      {isSunday(date) && (
        <div className="p-3 rounded-xs text-xs flex items-center gap-2 bg-canvas-deep border border-hairline text-ink-secondary">
          <CalendarOff className="w-4 h-4 text-warning shrink-0" />
          <span>
            Tanggal {date} adalah <strong>hari Minggu (hari libur magang)</strong>. Draft pengerjaan tetap dapat disimpan, namun pengiriman laporan ke Monev Kemnaker dinonaktifkan pada hari libur.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Uraian Aktivitas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-secondary">
              1. Uraian Aktivitas Pengerjaan (Hasil Kerja)
            </label>
            {renderCharCounter(activity)}
          </div>
          <Textarea
            name="activity"
            rows={4}
            placeholder="Tuliskan ringkasan aktivitas nyata pengerjaan hari ini (minimal 100 karakter)..."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            required
          />
        </div>

        {/* Section 2: Pembelajaran */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-secondary">
              2. Pembelajaran yang Diperoleh
            </label>
            {renderCharCounter(learning)}
          </div>
          <Textarea
            name="learning"
            rows={3}
            placeholder="Tuliskan hal teknis atau profesional yang dipelajari hari ini (minimal 100 karakter)..."
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            required
          />
        </div>

        {/* Section 3: Kendala */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink-secondary">
              3. Kendala yang Dihadapi &amp; Solusi
            </label>
            {renderCharCounter(obstacles)}
          </div>
          <Textarea
            name="obstacles"
            rows={3}
            placeholder="Tuliskan kendala teknis atau tantangan yang dihadapi serta langkah solusinya (minimal 100 karakter)..."
            value={obstacles}
            onChange={(e) => setObstacles(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-hairline">
          <div className="text-xs text-ink-muted">
            Status Validasi:{" "}
            {isFormValid ? (
              <span className="text-primary font-medium">Siap disubmit</span>
            ) : (
              <span className="text-warning font-medium">Belum memenuhi batas minimal karakter</span>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            disabled={saving}
            className="gap-2 text-xs h-8"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Simpan Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
