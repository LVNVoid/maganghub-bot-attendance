"use client";

import React, { useState } from "react";
import {
  Users,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  MessageSquareWarning,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AdminFeedbackManager } from "@/components/admin-feedback-manager";
import type { AdminUserItem } from "@/services/admin-service";
import type { FeedbackItem, FeedbackStats } from "@/services/feedback-service";

interface AdminDashboardViewProps {
  users: AdminUserItem[];
  totalReports: number;
  totalLogs: number;
  todayReportsCount: number;
  successLogsCount: number;
  successRate: number;
  feedbacks: FeedbackItem[];
  feedbackStats: FeedbackStats;
}

export function AdminDashboardView({
  users,
  totalReports,
  totalLogs: _totalLogs,
  todayReportsCount,
  successLogsCount: _successLogsCount,
  successRate,
  feedbacks,
  feedbackStats,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "feedback">("users");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Peserta (Clickable) */}
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "bg-canvas-subtle border rounded-md p-4 space-y-2 text-left transition-all cursor-pointer group",
            activeTab === "users"
              ? "border-primary/50 ring-1 ring-primary/30"
              : "border-hairline hover:border-hairline-prominent"
          )}
        >
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium group-hover:text-ink-primary transition-colors">
              Total Peserta
            </span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {users.length}
          </div>
          <p className="text-[11px] text-ink-muted">Klik untuk lihat daftar</p>
        </button>

        {/* Card 2: Laporan Hari Ini */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Laporan Hari Ini</span>
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {todayReportsCount}
          </div>
          <p className="text-[11px] text-ink-muted">Telah berhasil disubmit</p>
        </div>

        {/* Card 3: Success Rate */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {successRate}%
          </div>
          <p className="text-[11px] text-ink-muted">Tingkat keberhasilan API</p>
        </div>

        {/* Card 4: Total Submit Terkirim */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Total Submit Terkirim</span>
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {totalReports}
          </div>
          <p className="text-[11px] text-ink-muted">Kumulatif seluruh user</p>
        </div>

        {/* Card 5: Kendala & Feedback (Clickable) */}
        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={cn(
            "bg-canvas-subtle border rounded-md p-4 space-y-2 text-left transition-all cursor-pointer group col-span-2 sm:col-span-1",
            activeTab === "feedback"
              ? "border-warning/50 ring-1 ring-warning/30"
              : "border-hairline hover:border-hairline-prominent"
          )}
        >
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium group-hover:text-ink-primary transition-colors">
              Kendala &amp; Feedback
            </span>
            <MessageSquareWarning className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary flex items-baseline gap-1.5">
            <span>{feedbackStats.open}</span>
            <span className="text-xs text-ink-muted font-normal">
              / {feedbackStats.total} total
            </span>
          </div>
          <p className="text-[11px] text-warning font-medium">
            {feedbackStats.open > 0 ? "Perlu ditindaklanjuti" : "Semua selesai"}
          </p>
        </button>
      </div>

      {/* Tab Switcher Navigation */}
      <div className="border-b border-hairline flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all cursor-pointer",
            activeTab === "users"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Peserta Magang</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface border border-hairline text-ink-secondary">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={cn(
            "flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all cursor-pointer",
            activeTab === "feedback"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle"
          )}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Feedback &amp; Kendala</span>
          {feedbackStats.open > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-warning/20 border border-warning/40 text-warning font-semibold">
              {feedbackStats.open}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface border border-hairline text-ink-secondary">
              {feedbackStats.total}
            </span>
          )}
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "users" ? (
        /* Users Table */
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">
              Daftar Pengguna / Peserta Magang
            </h2>
            <span className="text-xs text-ink-muted">
              Total {users.length} akun terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-muted">
                  <th className="py-2.5 px-3 font-medium">Pengguna</th>
                  <th className="py-2.5 px-3 font-medium">Role</th>
                  <th className="py-2.5 px-3 font-medium">Kredensial Monev</th>
                  <th className="py-2.5 px-3 font-medium">Mode Automasi</th>
                  <th className="py-2.5 px-3 font-medium">Total Laporan</th>
                  <th className="py-2.5 px-3 font-medium">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {users.map((u) => {
                  const credStatus = u.maganghubCred?.status || "BELUM";
                  const isAuto = u.automation?.isEnabled;

                  return (
                    <tr key={u.id} className="hover:bg-canvas-deep/50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-ink-primary">
                          {u.name || "Anonim"}
                        </div>
                        <div className="text-[11px] text-ink-muted font-mono">
                          {u.email}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded-xs text-[10px] font-mono ${
                            u.role === "ADMIN"
                              ? "bg-primary-soft text-primary border border-primary/20"
                              : "bg-surface text-ink-muted border border-hairline"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {credStatus === "VALID" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        ) : credStatus === "INVALID" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-error">
                            <AlertCircle className="w-3 h-3" /> Invalid
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-muted">
                            {credStatus === "UNCHECKED" ? "Unchecked" : "Belum Isi"}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isAuto ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-mono">
                            Cron {u.automation?.scheduleTime} WIB
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-muted">Manual</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-ink-primary">
                        {u._count.reports}
                      </td>

                      <td className="py-3 px-3 text-ink-muted text-[11px] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Feedback Manager */
        <AdminFeedbackManager initialFeedbacks={feedbacks} stats={feedbackStats} />
      )}
    </div>
  );
}
