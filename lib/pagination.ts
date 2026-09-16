export const PAGE_SIZE = 50;

export function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    currentPage,
    totalPages,
    total,
    start: total === 0 ? 0 : start + 1,
    end: Math.min(end, total),
  };
}

/** Compact page number list with ellipsis markers (`"…"`). */
export function getPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i]!;
    if (i > 0 && page - sorted[i - 1]! > 1) {
      result.push("…");
    }
    result.push(page);
  }
  return result;
}
