import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * AdminPagination - Reusable pagination bar for admin tables.
 *
 * Props:
 *  - page          {number}   0-based current page index
 *  - totalPages    {number}   total number of pages
 *  - totalElements {number}   total number of records
 *  - pageSize      {number}   current page size
 *  - onPageChange  {fn}       called with new 0-based page index
 *  - onPageSizeChange {fn}    called with new page size number
 *  - loading       {boolean}  disables controls while loading
 */
export function AdminPagination({
  page = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);
  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;

  // Build window of page buttons: show up to 5 page numbers around current
  const getPageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const buttons = new Set([0, totalPages - 1, page]);
    for (let d = -2; d <= 2; d++) {
      const p = page + d;
      if (p >= 0 && p < totalPages) buttons.add(p);
    }
    const sorted = [...buttons].sort((a, b) => a - b);

    // Insert ellipsis markers
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push("...");
      }
      result.push(sorted[i]);
    }
    return result;
  };

  return (
    <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Left: info + page size */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span>
          Showing{" "}
          <span className="font-semibold text-foreground">{start}</span>
          {" – "}
          <span className="font-semibold text-foreground">{end}</span>
          {" of "}
          <span className="font-semibold text-foreground">{totalElements}</span>
          {" results"}
        </span>
        <span className="text-border hidden sm:inline">|</span>
        <label className="flex items-center gap-1.5">
          Rows:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            disabled={loading}
            className="border border-border rounded-md px-1.5 py-0.5 text-xs bg-white cursor-pointer disabled:opacity-60"
          >
            {[10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange?.(0)}
          disabled={isFirst || loading}
          title="First page"
          className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={isFirst || loading}
          title="Previous page"
          className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page number buttons */}
        {getPageButtons().map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer disabled:cursor-not-allowed ${
                p === page
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-border hover:bg-muted"
              }`}
            >
              {p + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange?.(page + 1)}
          disabled={isLast || loading}
          title="Next page"
          className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange?.(totalPages - 1)}
          disabled={isLast || loading}
          title="Last page"
          className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
