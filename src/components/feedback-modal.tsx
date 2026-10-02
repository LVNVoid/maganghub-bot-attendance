"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  MessageSquarePlus,
  X,
  Bug,
  Lightbulb,
  HelpCircle,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import {
  submitFeedbackAction,
  getMyFeedbacksAction,
} from "@/actions/feedback-actions";
import type { FeedbackCategory, FeedbackItem } from "@/services/feedback-service";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [category, setCategory] = useState<FeedbackCategory>("BUG");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-collapse on mobile screens after initial display
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileExpanded(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Load user feedbacks when modal opens or tab changes to history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getMyFeedbacksAction();
      if (res.success && res.data) {
        setFeedbacks(res.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) {
      toast.error("Subjek kendala minimal 3 karakter");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Deskripsi kendala minimal 10 karakter");
      return;
    }

    startTransition(async () => {
      const res = await submitFeedbackAction({
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.success) {
        toast.success("Feedback berhasil dikirim! Admin akan segera meninjau.");
        setSubject("");
        setMessage("");
        setCategory("BUG");
        loadHistory();
        setActiveTab("history");
      } else {
        toast.error(res.error || "Gagal mengirim feedback");
      }
    });
  };

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
          label: "Pertanyaan / Umum",
          icon: HelpCircle,
          className: "bg-surface-elevated text-ink-secondary border-hairline",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return {
          label: "Selesai Ditangani",
          icon: CheckCircle2,
          className: "bg-primary-soft text-primary border-primary/30",
        };
      case "IN_PROGRESS":
        return {
          label: "Sedang Ditangani",
          icon: Clock,
          className: "bg-info/15 text-info border-info/30",
        };
      case "OPEN":
      default:
        return {
          label: "Menunggu Review",
          icon: AlertCircle,
          className: "bg-warning/15 text-warning border-warning/30",
        };
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Bantuan dan Feedback"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-5 right-5 z-40 bg-surface-elevated hover:bg-canvas-subtle border border-hairline hover:border-primary text-ink-primary hover:text-primary shadow-2xl h-12 sm:h-11 rounded-full flex items-center cursor-pointer transition-all duration-300 group active:scale-95",
          isMobileExpanded || isHovered
            ? "px-4 sm:px-4.5"
            : "px-3.5 sm:px-4.5"
        )}
      >
        <MessageSquarePlus className="w-5 h-5 text-primary shrink-0 group-hover:rotate-12 transition-transform duration-200" />
        <span
          className={cn(
            "font-medium whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out text-xs sm:text-xs",
            // Desktop: always expanded
            "sm:max-w-[200px] sm:opacity-100 sm:ml-2.5",
            // Mobile: animated collapse / expand
            isMobileExpanded || isHovered
              ? "max-w-[180px] opacity-100 ml-2"
              : "max-w-0 opacity-0 ml-0"
          )}
        >
          Bantuan &amp; Feedback
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-lg bg-canvas-subtle border border-hairline rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-canvas-deep/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    Bantuan &amp; Feedback
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Laporkan kendala aplikasi atau ajukan saran fitur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-muted hover:text-ink-primary p-1 rounded-sm hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-hairline bg-canvas-deep/20 px-5 pt-2 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={cn(
                  "pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer",
                  activeTab === "form"
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-secondary hover:text-ink-primary"
                )}
              >
                Kirim Feedback
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("history");
                  loadHistory();
                }}
                className={cn(
                  "pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === "history"
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-secondary hover:text-ink-primary"
                )}
              >
                <span>Riwayat Saya</span>
                {feedbacks.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface border border-hairline text-ink-secondary">
                    {feedbacks.length}
                  </span>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {activeTab === "form" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink-secondary">
                      Kategori
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "BUG", label: "Kendala", icon: Bug },
                          { id: "FEATURE", label: "Saran Fitur", icon: Lightbulb },
                          { id: "GENERAL", label: "Lainnya", icon: HelpCircle },
                        ] as const
                      ).map((item) => {
                        const Icon = item.icon;
                        const isSelected = category === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCategory(item.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-2.5 rounded-sm border text-xs font-medium gap-1.5 transition-all cursor-pointer",
                              isSelected
                                ? "bg-primary-soft text-primary border-primary/40 shadow-xs"
                                : "bg-canvas-deep text-ink-secondary border-hairline hover:border-hairline-prominent hover:text-ink-primary"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink-secondary">
                      Judul / Ringkasan Kendala
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Error saat submit absen otomatis hari ini"
                      required
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink-secondary">
                      Deskripsi Lengkap
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Jelaskan detail kendala yang Anda alami, pesan error yang muncul, atau saran perbaikan..."
                      className="min-h-[110px]"
                      required
                    />
                    <p className="text-[11px] text-ink-muted">
                      Minimal 10 karakter. Laporan Anda langsung diteruskan ke tim pengembang.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      disabled={isPending}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="emerald"
                      disabled={isPending}
                      className="gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Kirim Laporan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* History Tab */
                <div className="space-y-3">
                  {isLoadingHistory ? (
                    <div className="py-12 flex flex-col items-center justify-center text-ink-muted text-xs gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Memuat riwayat feedback...</span>
                    </div>
                  ) : feedbacks.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-ink-muted">
                        <MessageSquarePlus className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-ink-secondary">
                        Belum ada feedback yang dikirim
                      </p>
                      <p className="text-[11px] text-ink-muted max-w-xs mx-auto">
                        Jika Anda menemukan kendala saat absensi atau memiliki saran fitur, laporkan lewat tab Kirim Feedback.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveTab("form")}
                        className="mt-2 text-xs"
                      >
                        Tulis Feedback Baru
                      </Button>
                    </div>
                  ) : (
                    feedbacks.map((item) => {
                      const catBadge = getCategoryBadge(item.category);
                      const statusBadge = getStatusBadge(item.status);
                      const CatIcon = catBadge.icon;
                      const StatusIcon = statusBadge.icon;

                      return (
                        <div
                          key={item.id}
                          className="bg-canvas-deep border border-hairline rounded-sm p-3.5 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium border",
                                catBadge.className
                              )}
                            >
                              <CatIcon className="w-3 h-3" />
                              {catBadge.label}
                            </span>

                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium border font-mono",
                                statusBadge.className
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-semibold text-ink-primary">
                              {item.subject}
                            </h4>
                            <p className="text-ink-secondary mt-1 whitespace-pre-wrap leading-relaxed">
                              {item.message}
                            </p>
                          </div>

                          {/* Admin Response Note */}
                          {item.adminNote && (
                            <div className="mt-2 p-2.5 rounded-sm bg-surface border border-hairline space-y-1">
                              <span className="text-[10px] font-semibold text-primary block">
                                Tanggapan Admin:
                              </span>
                              <p className="text-ink-secondary text-[11px] whitespace-pre-wrap">
                                {item.adminNote}
                              </p>
                            </div>
                          )}

                          <div className="text-[10px] text-ink-muted flex items-center justify-between pt-1 border-t border-hairline/60">
                            <span>
                              {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
