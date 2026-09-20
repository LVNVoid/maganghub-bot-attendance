"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { WebhookCurlBox } from "@/components/webhook-curl-box";
import { toggleAutomation, updateAutomationPreferences } from "@/actions/settings-actions";
import { Cpu, Clock } from "lucide-react";

interface AutomationConfigCardProps {
  isEnabled: boolean;
  webhookKey: string;
  scheduleTime?: string;
}

export function AutomationConfigCard({
  isEnabled: initialEnabled,
  webhookKey,
  scheduleTime = "13:50",
}: AutomationConfigCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateAutomationPreferences(formData);
    if (res?.success) {
      toast.success("Preferensi waktu submit berhasil disimpan.");
    } else {
      toast.error("Gagal menyimpan preferensi waktu submit.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              Metode Eksekusi & Automasi
            </h2>
            <p className="text-xs text-ink-secondary">
              Pilih mode submit manual 1-klik atau automasi cron VPS/Railway
            </p>
          </div>
        </div>

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
      <form onSubmit={handleSavePreferences} className="pt-2 border-t border-hairline space-y-4">
        <div className="space-y-1.5 max-w-xs">
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
        </div>

        <div className="flex items-center justify-end">
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
          />
        </div>
      )}
    </div>
  );
}
