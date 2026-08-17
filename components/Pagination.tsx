"use client";

// *********************
// Role of the component: Pagination for the shop listing page.
// URL-driven: the current page lives in the query string, so server-side
// rendering, filters and sorting all stay in sync. Renders numbered page
// links (with ellipsis for large catalogs), prev/next, and a
// \"Page X of Y\" counter.
// Name of the component: Pagination.tsx
// *********************

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const Pagination = ({ currentPage, totalPages, totalCount }: PaginationProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("page", String(page));
      replace(`${pathname}?${params.toString()}`);
    },
    [pathname, replace, searchParams, totalPages, currentPage]
  );

  // Numbered pages with ellipsis so a 20,000-product catalog (1,667+ pages)
  // never renders a thousand buttons.
  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sorted = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    const withEllipsis: (number | "...")[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) withEllipsis.push("...");
      withEllipsis.push(p);
      prev = p;
    }
    return withEllipsis;
  }, [totalPages, currentPage]);

  if (totalPages <= 1) return null;

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalCount);

  return (
    <div className="flex flex-col items-center gap-y-3 py-16">
      <p className="text-sm text-stone-500">
        Showing {startItem.toLocaleString()}–{endItem.toLocaleString()} of{" "}
        {totalCount.toLocaleString()} products
      </p>
      <div className="join flex items-center">
        <button
          className={`join-item btn ${currentPage === 1 ? "btn-disabled" : ""}`}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          «
        </button>
        {pageItems.map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="join-item btn btn-disabled">
              …
            </span>
          ) : (
            <button
              key={item}
              className={`join-item btn ${
                item === currentPage
                  ? "bg-amber-500 text-stone-900 hover:bg-amber-400 hover:text-stone-900"
                  : "bg-white text-stone-700 hover:bg-amber-500 hover:text-stone-900"
              }`}
              onClick={() => goToPage(item)}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          )
        )}
        <button
          className={`join-item btn ${currentPage === totalPages ? "btn-disabled" : ""}`}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          »
        </button>
      </div>
      <p className="text-sm text-stone-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
};

export default Pagination;
