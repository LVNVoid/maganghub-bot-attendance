"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteReportAction } from "@/actions/report-actions";
import { useReportHistory } from "@/hooks/use-report-history";
import type { ReportItem } from "@/schemas/report-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportDetailModal } from "@/components/report-detail-modal";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Lock,
  Calendar,
  X,
  FileCheck,
  FileEdit,
  GitBranch,
} from "lucide-react";

export type { ReportItem };

interface ReportHistoryTableProps {
  reports: readonly ReportItem[];
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return { formatted: "-", day: "" };
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return { formatted: dateStr, day: "" };
    const [y, m, d] = parts;
    const dateObj = new Date(y, m - 1, d);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const formatted = `${String(d).padStart(2, "0")} ${months[m - 1]} ${y}`;
    const day = days[dateObj.getDay()] || "";
    return { formatted, day };
  } catch {
    return { formatted: dateStr, day: "" };
  }
}

export function ReportHistoryTable({ reports }: ReportHistoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);
  const [selectedReportForModal, setSelectedReportForModal] = useState<ReportItem | null>(null);

  const PAGE_SIZE = 10;
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    paginatedReports,
    totalPages,
    totalItems,
  } = useReportHistory(reports, PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  // KPI Counts
  const counts = useMemo(() => {
    let submitted = 0;
    let draft = 0;
    for (const r of reports) {
      if (r.status === "SUBMITTED") submitted++;
      else if (r.status === "DRAFT") draft++;
    }
    return { total: reports.length, submitted, draft };
  }, [reports]);

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    const target = reportToDelete;

    if (target.status === "SUBMITTED") {
      toast.error("Laporan yang sudah tersubmit ke Monev tidak dapat dihapus.");
      setReportToDelete(null);
      return;
    }

    setDeletingId(target.id);

    startTransition(async () => {
      const res = await deleteReportAction(target.id);
      setDeletingId(null);
      setReportToDelete(null);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Laporan tanggal ${target.date} berhasil dihapus.`);
        router.refresh();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-soft text-primary border border-primary/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <CheckCircle2 className="w-3 h-3" />
            <span>Submitted</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-error/10 text-error border border-error/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            <AlertCircle className="w-3 h-3" />
            <span>Gagal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-elevated text-ink-secondary border border-hairline shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
            <Clock className="w-3 h-3 text-ink-muted" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Summary Cards (Situational Awareness) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs text-ink-muted font-medium">Total Laporan</p>
            <p className="text-base sm:text-xl font-mono font-semibold text-ink-primary mt-0.5">
              {counts.total}
            </p>
          </div>
          <div className="w-8 h-8 rounded-sm bg-canvas-deep border border-hairline flex items-center justify-center text-ink-secondary">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs text-ink-muted font-medium">Tersubmit Monev</p>
            <p className="text-base sm:text-xl font-mono font-semibold text-primary mt-0.5">
              {counts.submitted}
            </p>
          </div>
          <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs text-ink-muted font-medium">Draft Tersimpan</p>
            <p className="text-base sm:text-xl font-mono font-semibold text-ink-secondary mt-0.5">
              {counts.draft}
            </p>
          </div>
          <div className="w-8 h-8 rounded-sm bg-canvas-deep border border-hairline flex items-center justify-center text-ink-muted">
            <FileEdit className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-canvas-subtle border border-hairline rounded-md p-2.5 sm:p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            type="text"
            placeholder="Cari tanggal, aktivitas, atau pembelajaran..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 pr-8 text-xs h-9 sm:h-8 bg-canvas-deep border-hairline text-ink-primary placeholder:text-ink-muted focus:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary p-0.5"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-canvas-deep font-semibold"
                : "bg-canvas-deep text-ink-secondary hover:text-ink-primary border border-hairline"
            }`}
          >
            Semua ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("SUBMITTED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === "SUBMITTED"
                ? "bg-primary text-canvas-deep font-semibold"
                : "bg-canvas-deep text-ink-secondary hover:text-ink-primary border border-hairline"
            }`}
          >
            Submitted ({counts.submitted})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("DRAFT");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === "DRAFT"
                ? "bg-primary text-canvas-deep font-semibold"
                : "bg-canvas-deep text-ink-secondary hover:text-ink-primary border border-hairline"
            }`}
          >
            Draft ({counts.draft})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-canvas-subtle border border-hairline rounded-md overflow-hidden">
        {paginatedReports.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-canvas-deep border border-hairline flex items-center justify-center mx-auto text-ink-muted">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-primary">Tidak ada laporan ditemukan</p>
              <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL"
                  ? "Coba ubah kata kunci pencarian atau sesuaikan filter status."
                  : "Mulai buat laporan harian baru menggunakan tombol Editor Laporan Baru di atas."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs h-8"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View (< sm) */}
            <div className="block sm:hidden divide-y divide-hairline">
              {paginatedReports.map((r) => {
                const dateInfo = formatDisplayDate(r.date);
                const isDeleting = deletingId === r.id || isPending;
                const canDelete = r.status !== "SUBMITTED";
                const isSubmitted = r.status === "SUBMITTED";

                return (
                  <div
                    key={r.id}
                    className="p-3.5 space-y-3 bg-canvas-subtle hover:bg-canvas-deep/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-ink-primary">
                          {dateInfo.formatted}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          • {dateInfo.day}
                        </span>
                      </div>
                      {getStatusBadge(r.status)}
                    </div>

                    <div
                      onClick={() => setSelectedReportForModal(r)}
                      className="cursor-pointer rounded-sm bg-canvas-deep p-3 border border-hairline hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
                        {r.activity}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-primary font-medium flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Baca Laporan Lengkap
                        </span>
                        {r.sourceType && (
                          <span className="text-ink-muted font-mono text-[10px] flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {r.sourceType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReportForModal(r)}
                        className="h-8 px-2 text-xs text-ink-secondary gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Detail</span>
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Link href={`/reports?date=${r.date}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            {isSubmitted ? (
                              <>
                                <Lock className="w-3 h-3 text-primary" />
                                <span>Buka</span>
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </>
                            )}
                          </Button>
                        </Link>

                        {canDelete && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setReportToDelete(r)}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            <span>Hapus</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline text-ink-muted bg-canvas-deep">
                    <th className="py-3 px-4 font-medium w-36">Tanggal</th>
                    <th className="py-3 px-3 font-medium w-32">Status</th>
                    <th className="py-3 px-4 font-medium">Ringkasan Aktivitas</th>
                    <th className="py-3 px-4 font-medium text-right w-44">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {paginatedReports.map((r) => {
                    const dateInfo = formatDisplayDate(r.date);
                    const isDeleting = deletingId === r.id || isPending;
                    const canDelete = r.status !== "SUBMITTED";
                    const isSubmitted = r.status === "SUBMITTED";

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReportForModal(r)}
                        className="hover:bg-canvas-deep/70 transition-colors cursor-pointer group"
                      >
                        {/* Column 1: Tanggal */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-0.5">
                            <p className="font-mono font-semibold text-ink-primary group-hover:text-primary transition-colors">
                              {dateInfo.formatted}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {dateInfo.day}
                            </p>
                          </div>
                        </td>

                        {/* Column 2: Status */}
                        <td className="py-3.5 px-3 align-top">
                          {getStatusBadge(r.status)}
                        </td>

                        {/* Column 3: Ringkasan Aktivitas */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1.5">
                            <p className="text-ink-secondary leading-relaxed line-clamp-2 group-hover:text-ink-primary transition-colors">
                              {r.activity}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-ink-muted">
                              <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:underline">
                                <Eye className="w-3 h-3" />
                                Lihat Laporan Lengkap
                              </span>
                              {r.sourceType && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-xs bg-canvas-deep border border-hairline">
                                  {r.sourceType}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Column 4: Aksi */}
                        <td
                          className="py-3.5 px-4 text-right align-top"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Detail Modal */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReportForModal(r)}
                              className="h-7 px-2 text-[11px] gap-1 hover:text-primary"
                              title="Buka Ringkasan Laporan Lengkap"
                            >
                              <Eye className="w-3 h-3 text-primary" />
                              <span>Detail</span>
                            </Button>

                            {/* Tombol Buka / Edit di Editor */}
                            <Link href={`/reports?date=${r.date}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px] gap-1"
                                title={
                                  isSubmitted
                                    ? "Buka di Editor Laporan (Read-Only)"
                                    : "Buka di Editor Laporan"
                                }
                              >
                                {isSubmitted ? (
                                  <>
                                    <Lock className="w-3 h-3 text-primary" />
                                    <span>Buka</span>
                                  </>
                                ) : (
                                  <>
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </>
                                )}
                              </Button>
                            </Link>

                            {/* Tombol Hapus (Hanya untuk Draft / Gagal) */}
                            {canDelete ? (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                                onClick={() => setReportToDelete(r)}
                                className="h-7 px-2 text-[11px] gap-1"
                                title="Hapus draft laporan ini"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span>Hapus</span>
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 gap-2.5 sm:gap-0 border-t border-hairline text-xs bg-canvas-deep">
            <span className="text-[11px] text-ink-muted">
              Menampilkan {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, totalItems)} dari {totalItems}{" "}
              laporan
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 sm:h-7 px-2.5 sm:px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Prev
              </Button>
              <span className="text-[11px] font-mono text-ink-secondary px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 sm:h-7 px-2.5 sm:px-2 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Riwayat */}
      <ReportDetailModal
        isOpen={!!selectedReportForModal}
        onClose={() => setSelectedReportForModal(null)}
        report={selectedReportForModal}
      />

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Draft Laporan"
        description={`Apakah Anda yakin ingin menghapus draft laporan tanggal ${reportToDelete?.date}? Tindakan ini akan menghapus seluruh isi aktivitas, pembelajaran, dan kendala untuk tanggal tersebut.`}
        confirmText="Ya, Hapus Draft"
        cancelText="Batal"
        variant="danger"
        loading={isPending}
      />
    </div>
  );
}
