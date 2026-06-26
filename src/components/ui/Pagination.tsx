/**
 * Pagination component for navigating through pages of content.
 */

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 sm:gap-2"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className={clsx(
          'flex items-center gap-1 h-11 px-3 sm:px-4 rounded-lg font-medium text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
          canGoPrev
            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]'
            : 'text-[var(--color-text-muted)] cursor-not-allowed'
        )}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-[18px] h-[18px]" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                'w-10 h-10 rounded-lg font-medium text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
                page === currentPage
                  ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]'
              )}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Mobile Page Indicator */}
      <span className="sm:hidden text-sm text-[var(--color-text-secondary)] px-2">
        {currentPage} / {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={clsx(
          'flex items-center gap-1 h-11 px-3 sm:px-4 rounded-lg font-medium text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
          canGoNext
            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]'
            : 'text-[var(--color-text-muted)] cursor-not-allowed'
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRightIcon className="w-[18px] h-[18px]" />
      </button>
    </nav>
  );
}
