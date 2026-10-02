"use client";

import React, { useState, useTransition } from "react";
import {
  MessageSquareWarning,
  Bug,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { updateFeedbackStatusAction } from "@/actions/feedback-actions";
import type {
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackStats,
} from "@/services/feedback-service";

interface AdminFeedbackManagerProps {
  initialFeedbacks: FeedbackItem[];
  stats: FeedbackStats;
}

export function AdminFeedbackManager({
  initialFeedbacks,
  stats,
}: AdminFeedbackManagerProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);
  const [statusFilter, setStatusFilter] = useState<"ALL" | FeedbackStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | FeedbackCategory>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null);

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && f.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryBadge = (cat: FeedbackCategory) => {
    switch (cat) {
      case "BUG":
        return {
          label: "Kendala / Bug",
          icon: Bug,
          className: "bg-error/15 text-error border-error/30",
        };
      case "FEATURE":
        return {
          label: "Saran Fitur",
          icon: Lightbulb,
          className: "bg-primary-soft text-primary border-primary/30",
        };
      case "GENERAL":
      default:
        return {
          label: "Pertanyaan Umum",
          icon: HelpCircle,
          className: "bg-surface text-ink-secondary border-hairline",
        };
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case "RESOLVED":
        return {
          label: "Selesai",
          icon: CheckCircle2,
          className: "bg-primary-soft text-primary border-primary/30",
        };
      case "IN_PROGRESS":
        return {
          label: "Diproses",
          icon: Clock,
          className: "bg-info/15 text-info border-info/30",
        };
      case "OPEN":
      default:
        return {
          label: "Menunggu",
          icon: AlertCircle,
          className: "bg-warning/15 text-warning border-warning/30",
        };
    }
  };

  const handleUpdateStatus = (
    feedbackId: string,
    newStatus: FeedbackStatus,
    adminNote?: string
  ) => {
    setActiveUpdatingId(feedbackId);
    startTransition(async () => {
      const noteToSave =
        adminNote !== undefined ? adminNote : editingNotes[feedbackId] ?? null;

      const res = await updateFeedbackStatusAction({
        id: feedbackId,
        status: newStatus,
        adminNote: noteToSave,
      });

      if (res.success && res.data) {
        toast.success(`Status berhasil diubah ke ${newStatus}`);
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === feedbackId
              ? {
                  ...item,
                  status: newStatus,
                  adminNote: res.data?.adminNote ?? item.adminNote,
                }
              : item
          )
        );
      } else {
        toast.error(res.error || "Gagal memperbarui status");
      }
      setActiveUpdatingId(null);
    });
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-5">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-ink-primary">
              Feedback &amp; Kendala Pengguna
            </h2>
          </div>
          <p className="text-xs text-ink-secondary mt-1">
            Pantau dan tangani laporan kendala teknis atau saran fitur dari peserta magang
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
          <div className="px-2.5 py-1 rounded-sm bg-canvas-deep border border-hairline flex items-center gap-1.5 text-ink-secondary">
            <span>Total:</span>
            <span className="font-semibold text-ink-primary">{stats.total}</span>
          </div>
          <div className="px-2.5 py-1 rounded-sm bg-warning/10 border border-warning/20 flex items-center gap-1.5 text-warning">
            <span>Open:</span>
            <span className="font-semibold">{stats.open}</span>
          </div>
          <div className="px-2.5 py-1 rounded-sm bg-info/10 border border-info/20 flex items-center gap-1.5 text-info">
            <span>Proses:</span>
            <span className="font-semibold">{stats.inProgress}</span>
          </div>
          <div className="px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/20 flex items-center gap-1.5 text-primary">
            <span>Selesai:</span>
            <span className="font-semibold">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-hairline">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-ink-muted mr-1">Status:</span>
          {(
            [
              { id: "ALL", label: "Semua" },
              { id: "OPEN", label: "Menunggu" },
              { id: "IN_PROGRESS", label: "Diproses" },
              { id: "RESOLVED", label: "Selesai" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors cursor-pointer",
                statusFilter === tab.id
                  ? "bg-primary-soft text-primary border border-primary/30"
                  : "bg-canvas-deep text-ink-secondary border border-hairline hover:text-ink-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-ink-muted mr-1">Kategori:</span>
          {(
            [
              { id: "ALL", label: "Semua" },
              { id: "BUG", label: "Kendala" },
              { id: "FEATURE", label: "Fitur" },
              { id: "GENERAL", label: "Umum" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "px-2 py-0.5 rounded-xs text-[11px] font-medium transition-colors cursor-pointer",
                categoryFilter === cat.id
                  ? "bg-surface-elevated text-ink-primary border border-hairline-prominent"
                  : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks List / Table */}
      {filteredFeedbacks.length === 0 ? (
        <div className="py-10 text-center text-xs text-ink-muted">
          Tidak ada feedback yang sesuai dengan filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedbacks.map((f) => {
            const catBadge = getCategoryBadge(f.category);
            const statusBadge = getStatusBadge(f.status);
            const CatIcon = catBadge.icon;
            const StatusIcon = statusBadge.icon;
            const isExpanded = expandedId === f.id;
            const isItemUpdating = isPending && activeUpdatingId === f.id;

            return (
              <div
                key={f.id}
                className="bg-canvas-deep border border-hairline rounded-sm p-4 space-y-3 transition-colors hover:border-hairline-prominent"
              >
                {/* Header row: User, category, status, date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-xs text-ink-primary">
                      {f.user?.name || "Anonim"}
                    </span>
                    <span className="text-[11px] text-ink-muted font-mono">
                      ({f.user?.email || "tanpa email"})
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium border",
                        catBadge.className
                      )}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium border font-mono",
                        statusBadge.className
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>

                    <span className="text-[11px] text-ink-muted whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                      className="p-1 text-ink-muted hover:text-ink-primary cursor-pointer"
                      title={isExpanded ? "Tutup detail" : "Buka detail tanggapan"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Subject & Message */}
                <div>
                  <h4 className="text-xs font-semibold text-ink-primary">
                    {f.subject}
                  </h4>
                  <p className="text-xs text-ink-secondary mt-1 whitespace-pre-wrap leading-relaxed">
                    {f.message}
                  </p>
                </div>

                {/* Admin Note if present and not expanded */}
                {f.adminNote && !isExpanded && (
                  <div className="p-2.5 rounded-sm bg-surface border border-hairline text-xs">
                    <span className="text-[10px] font-semibold text-primary block">
                      Tanggapan Admin:
                    </span>
                    <p className="text-ink-secondary text-[11px] mt-0.5">
                      {f.adminNote}
                    </p>
                  </div>
                )}

                {/* Expanded Action Panel: Quick status switch & admin reply */}
                {isExpanded && (
                  <div className="pt-3 border-t border-hairline/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-ink-muted mr-1">
                          Ubah Status:
                        </span>
                        <Button
                          variant={f.status === "OPEN" ? "primary" : "secondary"}
                          size="sm"
                          disabled={isItemUpdating}
                          onClick={() => handleUpdateStatus(f.id, "OPEN")}
                          className="h-7 text-[11px]"
                        >
                          Menunggu
                        </Button>
                        <Button
                          variant={f.status === "IN_PROGRESS" ? "primary" : "secondary"}
                          size="sm"
                          disabled={isItemUpdating}
                          onClick={() => handleUpdateStatus(f.id, "IN_PROGRESS")}
                          className="h-7 text-[11px]"
                        >
                          Diproses
                        </Button>
                        <Button
                          variant={f.status === "RESOLVED" ? "emerald" : "secondary"}
                          size="sm"
                          disabled={isItemUpdating}
                          onClick={() => handleUpdateStatus(f.id, "RESOLVED")}
                          className="h-7 text-[11px]"
                        >
                          Selesai Ditangani
                        </Button>
                      </div>

                      {isItemUpdating && (
                        <div className="flex items-center gap-1 text-[11px] text-primary">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Note Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-ink-secondary flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span>Tanggapan / Catatan Penyelesaian Admin:</span>
                      </label>
                      <Textarea
                        value={
                          editingNotes[f.id] !== undefined
                            ? editingNotes[f.id]
                            : f.adminNote || ""
                        }
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [f.id]: e.target.value,
                          }))
                        }
                        placeholder="Tulis pesan atau instruksi solusi yang dapat dilihat pengguna di riwayat feedback mereka..."
                        className="min-h-[70px] text-xs"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isItemUpdating}
                          onClick={() =>
                            handleUpdateStatus(
                              f.id,
                              f.status,
                              editingNotes[f.id] ?? f.adminNote ?? ""
                            )
                          }
                          className="gap-1.5 text-xs h-7"
                        >
                          <Save className="w-3 h-3" />
                          <span>Simpan Tanggapan</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
