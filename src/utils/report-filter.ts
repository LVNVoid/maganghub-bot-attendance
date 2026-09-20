import type { ReportItem } from "@/schemas/report-schema";

export function filterReports(
  reports: readonly ReportItem[],
  query: string,
  statusFilter: string
): readonly ReportItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return reports.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const matchDate = r.date.toLowerCase().includes(normalizedQuery);
    const matchActivity = r.activity.toLowerCase().includes(normalizedQuery);
    const matchLearning = r.learning.toLowerCase().includes(normalizedQuery);
    const matchObstacles = r.obstacles.toLowerCase().includes(normalizedQuery);

    return matchDate || matchActivity || matchLearning || matchObstacles;
  });
}

export function paginateReports<T>(
  items: readonly T[],
  page: number,
  pageSize: number
): {
  readonly paginatedItems: readonly T[];
  readonly totalPages: number;
  readonly safePage: number;
  readonly totalItems: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    paginatedItems,
    totalPages,
    safePage,
    totalItems,
  };
}
