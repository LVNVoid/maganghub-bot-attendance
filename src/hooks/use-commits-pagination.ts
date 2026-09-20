"use client";

import { useState, useMemo } from "react";
import { paginateReports } from "@/utils/report-filter";

export function useCommitsPagination<T>(items: readonly T[], pageSize: number = 5) {
  const [currentPage, setCurrentPage] = useState(1);

  const { paginatedItems, totalPages, safePage, totalItems } = useMemo(() => {
    return paginateReports(items, currentPage, pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage: safePage,
    setCurrentPage,
    paginatedItems,
    totalPages,
    totalItems,
  } as const;
}
