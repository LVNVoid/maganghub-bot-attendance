"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateReportDraft, saveReportDraft } from "@/actions/report-actions";
import { Sparkles, Save, CheckCircle2, AlertTriangle, Loader2, Lock } from "lucide-react";

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
  aiConfig?: {
    isReady: boolean;
    modelName?: string;
    provider?: string;
  };
}

export function ReportForm({
  initialReport,
  selectedDate,
  onDateChange,
  aiConfig,
}: ReportFormProps) {
  const isSubmitted = initialReport?.status === "SUBMITTED";
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
    if (isSubmitted) {
      toast.error("Laporan tanggal ini sudah berstatus SUBMITTED dan terkunci.");
      return;
    }

    setGenerating(true);

    const res = await generateReportDraft(date);
    if (!res.success) {
      toast.error(res.error.message);
    } else if (res.data) {
      setActivity(res.data.activity);
      setLearning(res.data.learning);
      setObstacles(res.data.obstacles);
      toast.success(res.message || "Draft laporan berhasil di-generate!");
    }
    setGenerating(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitted) {
      toast.error("Laporan sudah berstatus SUBMITTED dan tidak dapat diedit.");
      return;
    }

    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("date", date);

    const res = await saveReportDraft(formData);
    if (!res.success) {
      toast.error(res.error.message);
    } else {
      toast.success(res.message || "Draft berhasil disimpan.");
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
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">
            Editor Laporan Harian MagangHub
          </h2>
          <p className="text-xs text-ink-secondary">
            Setiap bagian wajib minimal 100 karakter sesuai validasi Monev Kemnaker.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            {aiConfig?.isReady ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0"
                title={`Model AI Aktif: ${aiConfig.modelName}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Siap &bull; {aiConfig.modelName}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface text-ink-muted border border-hairline shrink-0"
                title="Kunci API pribadi belum diisi. Pembuatan laporan menggunakan generator cerdas lokal (0 token)."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                AI: Fallback 0-Token
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={date}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="flex-1 sm:w-36 text-xs h-10 sm:h-8"
            />

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGenerateAI}
              disabled={generating || isSubmitted}
              className="gap-1.5 h-10 sm:h-8 px-3 text-xs border-primary/30 text-primary hover:bg-primary-soft shrink-0 disabled:opacity-50"
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
      </div>

      {isSubmitted && (
        <div className="flex items-start sm:items-center gap-2.5 p-3 sm:p-3.5 rounded-sm bg-primary/10 border border-primary/30 text-xs text-primary animate-in fade-in duration-150">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            Laporan tanggal <strong>{date}</strong> sudah berstatus <strong>SUBMITTED</strong> ke Monev MagangHub dan telah dikunci. Anda tidak dapat mengedit atau menimpa laporan ini.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
        {/* Section 1: Uraian Aktivitas */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-medium text-ink-secondary">
              1. Uraian Aktivitas Pengerjaan (Hasil Kerja)
            </label>
            <div>{renderCharCounter(activity)}</div>
          </div>
          <Textarea
            name="activity"
            rows={4}
            placeholder="Tuliskan ringkasan aktivitas nyata pengerjaan hari ini (minimal 100 karakter)..."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            disabled={isSubmitted}
            required
          />
        </div>

        {/* Section 2: Pembelajaran */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-medium text-ink-secondary">
              2. Pembelajaran yang Diperoleh
            </label>
            <div>{renderCharCounter(learning)}</div>
          </div>
          <Textarea
            name="learning"
            rows={3}
            placeholder="Tuliskan hal teknis atau profesional yang dipelajari hari ini (minimal 100 karakter)..."
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            disabled={isSubmitted}
            required
          />
        </div>

        {/* Section 3: Kendala */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-medium text-ink-secondary">
              3. Kendala yang Dihadapi &amp; Solusi
            </label>
            <div>{renderCharCounter(obstacles)}</div>
          </div>
          <Textarea
            name="obstacles"
            rows={3}
            placeholder="Tuliskan kendala teknis atau tantangan yang dihadapi serta langkah solusinya (minimal 100 karakter)..."
            value={obstacles}
            onChange={(e) => setObstacles(e.target.value)}
            disabled={isSubmitted}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-hairline">
          <div className="text-xs text-ink-muted">
            Status Validasi:{" "}
            {isSubmitted ? (
              <span className="text-primary font-medium">Laporan telah dikunci (SUBMITTED)</span>
            ) : isFormValid ? (
              <span className="text-primary font-medium">Siap disubmit</span>
            ) : (
              <span className="text-warning font-medium">Belum memenuhi batas minimal karakter</span>
            )}
          </div>

          <Button
            type="submit"
            variant={isSubmitted ? "outline" : "secondary"}
            disabled={saving || isSubmitted}
            className="w-full sm:w-auto gap-2 text-xs h-10 sm:h-8 font-semibold"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isSubmitted ? (
              <Lock className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSubmitted ? "Laporan Terkunci (Submitted)" : "Simpan Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
