"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { WebhookCurlBox } from "@/components/webhook-curl-box";
import { toggleAutomation, updateAutomationPreferences } from "@/actions/settings-actions";
import { Cpu, Clock, Calendar } from "lucide-react";

interface AutomationConfigCardProps {
  isEnabled: boolean;
  webhookKey: string;
  scheduleTime?: string;
  scheduleDays?: string;
}

const DAYS_OF_WEEK = [
  { id: 1, name: "Senin", short: "Sen" },
  { id: 2, name: "Selasa", short: "Sel" },
  { id: 3, name: "Rabu", short: "Rab" },
  { id: 4, name: "Kamis", short: "Kam" },
  { id: 5, name: "Jumat", short: "Jum" },
  { id: 6, name: "Sabtu", short: "Sab" },
  { id: 0, name: "Minggu", short: "Min" },
];

function parseDays(daysStr: string): number[] {
  const parsed = daysStr
    .split(",")
    .map((d) => parseInt(d.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 6);
  return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5, 6];
}

export function AutomationConfigCard({
  isEnabled: initialEnabled,
  webhookKey,
  scheduleTime = "13:50",
  scheduleDays = "1,2,3,4,5,6",
}: AutomationConfigCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>(() =>
    parseDays(scheduleDays)
  );

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length <= 1) {
          toast.error("Pilih minimal satu hari untuk jadwal absen.");
          return prev;
        }
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort((a, b) => {
          const orderA = a === 0 ? 7 : a;
          const orderB = b === 0 ? 7 : b;
          return orderA - orderB;
        });
      }
    });
  };

  const applyPreset = (preset: number[]) => {
    setSelectedDays(preset);
  };

  const handleToggle = async () => {
    setToggling(true);
    const nextState = !isEnabled;
    const res = await toggleAutomation(nextState);
    if (res?.success) {
      setIsEnabled(nextState);
      toast.success(nextState ? "Automasi terjadwal diaktifkan." : "Automasi dinonaktifkan (mode manual).");
    } else {
      toast.error("Gagal mengubah status automasi.");
    }
    setToggling(false);
  };

  const handleSavePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error("Pilih minimal satu hari.");
      return;
    }

    setSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.set("scheduleDays", selectedDays.join(","));

    const res = await updateAutomationPreferences(formData);
    if (res?.success) {
      toast.success("Preferensi waktu dan hari submit berhasil disimpan.");
    } else {
      toast.error(res?.error || "Gagal menyimpan preferensi waktu submit.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              Metode Eksekusi &amp; Automasi
            </h2>
            <p className="text-xs text-ink-secondary">
              Pilih mode submit manual 1-klik atau automasi cron VPS/Railway
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
          <span className="text-xs text-ink-secondary sm:hidden">
            {isEnabled ? "Automasi Aktif" : "Automasi Nonaktif"}
          </span>
          <button
            onClick={handleToggle}
            disabled={toggling}
            type="button"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? "bg-primary" : "bg-surface"
            }`}
            role="switch"
            aria-checked={isEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual Option Card */}
        <div
          onClick={() => isEnabled && handleToggle()}
          className={`p-4 rounded-sm border cursor-pointer transition-all ${
            !isEnabled
              ? "bg-canvas-deep border-primary/40 ring-1 ring-primary/20"
              : "bg-canvas border-hairline hover:border-hairline-prominent"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-primary">
              Manual Submit (Dashboard Web)
            </span>
            {!isEnabled && (
              <span className="text-[10px] font-mono text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Generate draft laporan harian dan klik &quot;Submit Kehadiran&quot; langsung dari dashboard setiap saat Anda siap. Tanpa server tambahan.
          </p>
        </div>

        {/* Cron Worker Option Card */}
        <div
          onClick={() => !isEnabled && handleToggle()}
          className={`p-4 rounded-sm border cursor-pointer transition-all ${
            isEnabled
              ? "bg-canvas-deep border-primary/40 ring-1 ring-primary/20"
              : "bg-canvas border-hairline hover:border-hairline-prominent"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-primary">
              Automasi Terjadwal (Cron VPS / Worker)
            </span>
            {isEnabled && (
              <span className="text-[10px] font-mono text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Eksekusi submit otomatis sesuai jadwal melalui crontab VPS pribadi, Railway, atau GitHub Actions menggunakan Webhook Token unik.
          </p>
        </div>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="pt-2 border-t border-hairline space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Waktu */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Target Waktu Submit Harian (WIB)
            </label>
            <input
              name="scheduleTime"
              type="time"
              defaultValue={scheduleTime}
              className="w-full bg-canvas-deep border border-hairline rounded-sm px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-ink-muted">
              Waktu acuan eksekusi bot atau cron trigger harian.
            </p>
          </div>

          {/* Hari Absen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Hari Kerja / Jadwal Absen
              </label>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyPreset([1, 2, 3, 4, 5])}
                  className="px-1.5 py-0.5 rounded-xs bg-canvas border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Sen-Jum
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset([1, 2, 3, 4, 5, 6])}
                  className="px-1.5 py-0.5 rounded-xs bg-canvas border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Sen-Sab
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset([1, 2, 3, 4, 5, 6, 0])}
                  className="px-1.5 py-0.5 rounded-xs bg-canvas border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Semua
                </button>
              </div>
            </div>

            {/* Day Selector Buttons */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`min-h-[44px] flex flex-col items-center justify-center rounded-sm border text-xs transition-all ${
                      isSelected
                        ? "bg-primary text-white font-semibold border-primary shadow-xs"
                        : "bg-canvas-deep border-hairline text-ink-secondary hover:border-hairline-prominent hover:text-ink-primary"
                    }`}
                    title={day.name}
                  >
                    <span className="text-[11px] sm:text-xs font-medium">{day.short}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-ink-muted">
              Pilih hari aktif kerja magang. Bot akan melewati (skip) proses submit otomatis di luar hari yang dipilih.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button type="submit" variant="secondary" size="sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Preferensi"}
          </Button>
        </div>
      </form>

      {/* Webhook Box (Visible when Cron is enabled) */}
      {isEnabled && (
        <div className="pt-4 border-t border-hairline">
          <WebhookCurlBox
            webhookKey={webhookKey}
            autoSubmitTime={scheduleTime}
            scheduleDays={selectedDays.join(",")}
          />
        </div>
      )}
    </div>
  );
}
