"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  saveUserAiConfigAction,
  deleteUserAiConfigAction,
  testUserAiConfigAction,
} from "@/actions/ai-config-actions";
import {
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Trash2,
  Sparkles,
} from "lucide-react";

interface AiConfigCardProps {
  hasConfig: boolean;
  provider?: string;
  baseUrl?: string;
  modelName?: string;
}

const PRESETS = [
  {
    name: "Groq (Gratis / Rekomendasi)",
    provider: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    modelName: "llama-3.3-70b-versatile",
  },
  {
    name: "OpenRouter",
    provider: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    modelName: "meta-llama/llama-3.3-70b-instruct",
  },
  {
    name: "OpenAI",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    modelName: "gpt-4o-mini",
  },
  {
    name: "Custom (Self-Hosted / Proxy)",
    provider: "custom",
    baseUrl: "",
    modelName: "",
  },
];

export function AiConfigCard({
  hasConfig,
  provider = "openai_compatible",
  baseUrl = "https://api.groq.com/openai/v1",
  modelName = "llama-3.3-70b-versatile",
}: AiConfigCardProps) {
  const [isEditing, setIsEditing] = useState(!hasConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedBaseUrl, setSelectedBaseUrl] = useState(baseUrl);
  const [selectedModel, setSelectedModel] = useState(modelName);
  const [selectedProvider, setSelectedProvider] = useState(provider);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const handleSelectPreset = (presetName: string) => {
    const preset = PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    setSelectedProvider(preset.provider);
    if (preset.baseUrl) setSelectedBaseUrl(preset.baseUrl);
    if (preset.modelName) setSelectedModel(preset.modelName);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("provider", selectedProvider);
    formData.append("baseUrl", selectedBaseUrl);
    formData.append("modelName", selectedModel);
    formData.append("apiKey", apiKeyInput);

    const res = await saveUserAiConfigAction(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Konfigurasi AI berhasil disimpan dan terenkripsi.");
      setIsEditing(false);
      setApiKeyInput("");
    }
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);

    const res = await testUserAiConfigAction({
      baseUrl: selectedBaseUrl,
      modelName: selectedModel,
      apiKey: apiKeyInput || undefined,
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setTesting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteUserAiConfigAction();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Konfigurasi AI pribadi telah dihapus.");
      setIsEditing(true);
      setApiKeyInput("");
    }
    setDeleting(false);
  };

  return (
    <>
      <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-ink-primary">
                Model AI Pribadi (BYOK)
              </h2>
            </div>
            <p className="text-xs text-ink-secondary">
              Gunakan API Key AI milik Anda sendiri (Groq, OpenRouter, OpenAI, dll). Kunci dienkripsi aman menggunakan AES-256-GCM.
            </p>
          </div>

          <div>
            {hasConfig ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Key Pribadi Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-ink-secondary border border-hairline">
                <Sparkles className="w-3.5 h-3.5 text-warning" />
                Fallback Generator (0 Token)
              </span>
            )}
          </div>
        </div>

        {hasConfig && !isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface border border-hairline rounded-xs text-xs">
              <div>
                <span className="text-ink-muted block">Provider / Base URL:</span>
                <span className="font-mono text-ink-primary break-all">{baseUrl}</span>
              </div>
              <div>
                <span className="text-ink-muted block">Nama Model:</span>
                <span className="font-mono text-ink-primary">{modelName}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-ink-muted block">API Key:</span>
                <span className="font-mono text-ink-secondary">••••••••••••••••••••••••••••••••</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Kunci API Anda tersimpan dalam bentuk ciphertext AES-256-GCM.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                Ubah Konfigurasi
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing}
                className="text-xs gap-1.5"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-primary" />
                )}
                Uji Koneksi AI
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="text-xs text-error hover:text-error hover:bg-error/10 gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Key
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">
                Pilih Preset Provider
              </label>
              <select
                onChange={(e) => handleSelectPreset(e.target.value)}
                defaultValue={PRESETS[0].name}
                className="w-full bg-surface border border-hairline rounded-xs px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-primary/50"
              >
                {PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-primary">
                  Base URL API
                </label>
                <Input
                  value={selectedBaseUrl}
                  onChange={(e) => setSelectedBaseUrl(e.target.value)}
                  placeholder="https://api.groq.com/openai/v1"
                  required
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-primary">
                  Nama Model
                </label>
                <Input
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="llama-3.3-70b-versatile"
                  required
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">
                API Key Pribadi
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasConfig ? "Masukkan API Key baru jika ingin mengubah" : "gsk_... atau sk-..."}
                  required={!hasConfig}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-ink-muted">
                Untuk Groq gratis, buat API Key di{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  console.groq.com
                </a>
                .
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Konfigurasi AI
              </Button>

              {apiKeyInput && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="text-xs gap-1.5"
                >
                  {testing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-primary" />
                  )}
                  Uji Koneksi
                </Button>
              )}

              {hasConfig && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Hapus API Key AI?"
        description="Setelah dihapus, pembuatan laporan otomatis akan menggunakan generator cerdas lokal (0 token) kecuali Anda memasukkan API Key baru."
        confirmText="Hapus Key"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
