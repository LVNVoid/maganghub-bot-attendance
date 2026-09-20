"use client";

import { useState, useMemo } from "react";
import type { ReportItem } from "@/schemas/report-schema";
import { filterReports, paginateReports } from "@/utils/report-filter";

export function useReportHistory(
  reports: readonly ReportItem[],
  pageSize: number = 10
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return filterReports(reports, searchQuery, statusFilter);
  }, [reports, searchQuery, statusFilter]);

  const { paginatedItems, totalPages, safePage, totalItems } = useMemo(() => {
    return paginateReports(filteredReports, currentPage, pageSize);
  }, [filteredReports, currentPage, pageSize]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusChange,
    currentPage: safePage,
    setCurrentPage,
    expandedId,
    toggleExpand,
    paginatedReports: paginatedItems,
    totalPages,
    totalItems,
  } as const;
}
