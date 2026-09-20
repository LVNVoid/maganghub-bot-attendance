"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteReportAction } from "@/actions/report-actions";
import { useReportHistory } from "@/hooks/use-report-history";
import type { ReportItem } from "@/schemas/report-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  CalendarOff,
} from "lucide-react";
import { isSunday } from "@/lib/date-utils";

export type { ReportItem };

interface ReportHistoryTableProps {
  reports: readonly ReportItem[];
}

export function ReportHistoryTable({ reports }: ReportHistoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const PAGE_SIZE = 10;
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    expandedId,
    toggleExpand,
    paginatedReports,
    totalPages,
    totalItems,
  } = useReportHistory(reports, PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    const target = reportToDelete;

    if (target.status === "SUBMITTED") {
      toast.error("Laporan yang sudah berstatus SUBMITTED tidak dapat dihapus.");
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

  const getStatusBadge = (status: string, dateStr: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-soft text-primary border border-primary/20">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-error/10 text-error border border-error/20">
            <AlertCircle className="w-3 h-3" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-ink-secondary border border-hairline">
            <Clock className="w-3 h-3 text-ink-muted" /> Draft
            {isSunday(dateStr) && " (Libur)"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-canvas-subtle border border-hairline rounded-md p-3.5">
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
            className="pl-8 text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-secondary shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs h-8 px-2.5 rounded-xs bg-canvas-deep border border-hairline text-ink-primary focus:outline-none focus:border-primary"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="FAILED">Gagal</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-canvas-subtle border border-hairline rounded-md overflow-hidden">
        {paginatedReports.length === 0 ? (
          <div className="text-center py-12 text-xs text-ink-muted space-y-2">
            <Clock className="w-8 h-8 text-ink-muted mx-auto" />
            <p>Tidak ada data laporan yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-muted bg-canvas-deep">
                  <th className="py-2.5 px-4 font-medium w-32">Tanggal</th>
                  <th className="py-2.5 px-3 font-medium w-28">Status</th>
                  <th className="py-2.5 px-3 font-medium w-24">Sumber</th>
                  <th className="py-2.5 px-4 font-medium">Ringkasan Aktivitas</th>
                  <th className="py-2.5 px-4 font-medium text-right w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {paginatedReports.map((r) => {
                  const isExpanded = expandedId === r.id;
                  const isDeleting = deletingId === r.id || isPending;
                  const canDelete = r.status !== "SUBMITTED";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-canvas-deep/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-ink-primary align-top">
                        <div className="flex items-center gap-1.5">
                          <span>{r.date}</span>
                          {isSunday(r.date) && (
                            <span title="Hari Minggu (Libur)">
                              <CalendarOff className="w-3 h-3 text-warning shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top">
                        {getStatusBadge(r.status, r.date)}
                      </td>

                      <td className="py-3 px-3 font-mono text-ink-secondary text-[11px] align-top">
                        {r.sourceType}
                      </td>

                      <td className="py-3 px-4 text-ink-secondary align-top">
                        <div className="space-y-1">
                          <p
                            className={`font-sans text-ink-primary leading-relaxed ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {r.activity}
                          </p>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-hairline space-y-2.5 text-[11px] bg-canvas-deep p-3 rounded-xs">
                              <div>
                                <span className="font-semibold text-primary block mb-0.5">
                                  Pembelajaran:
                                </span>
                                <p className="text-ink-secondary leading-relaxed">
                                  {r.learning}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-warning block mb-0.5">
                                  Kendala &amp; Solusi:
                                </span>
                                <p className="text-ink-secondary leading-relaxed">
                                  {r.obstacles}
                                </p>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleExpand(r.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                          >
                            {isExpanded ? (
                              <>
                                <span>Tutup Detail</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Lihat Selengkapnya</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit / Buka di Editor */}
                          <Link href={`/reports?date=${r.date}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] gap-1"
                              title="Buka di Editor Laporan"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </Button>
                          </Link>

                          {/* Tombol Hapus (Hanya untuk DRAFT / FAILED) */}
                          {canDelete ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                              onClick={() => setReportToDelete(r)}
                              className="h-7 px-2 text-[11px] gap-1"
                              title="Hapus laporan ini"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>Hapus</span>
                            </Button>
                          ) : (
                            <span
                              className="text-[10px] font-mono text-ink-muted px-1"
                              title="Laporan sudah tersubmit ke Monev tidak dapat dihapus"
                            >
                              Terkunci
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-hairline text-xs bg-canvas-deep">
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
                className="h-7 px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Prev
              </Button>
              <span className="text-[11px] font-mono text-ink-secondary px-1.5">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
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
