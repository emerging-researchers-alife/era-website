/**
 * Tag filter component with toggle pills for filtering articles.
 * Shows primary tags and optionally related tags when filtering.
 */

import clsx from 'clsx';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  relatedTags?: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({
  availableTags,
  selectedTags,
  relatedTags = [],
  onTagToggle,
  onClearAll,
}: TagFilterProps) {
  const hasSelection = selectedTags.length > 0;

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Primary tags row */}
      <div className="relative -mx-1">
        <div
          className={clsx(
            'flex gap-2 overflow-x-auto py-1 px-1',
            'scrollbar-none',
            'snap-x snap-mandatory'
          )}
          role="group"
          aria-label="Filter by tags"
        >
          {/* "All" button */}
          <button
            onClick={onClearAll}
            className={clsx(
              'flex-shrink-0 snap-start',
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
              'focus:outline-none',
              !hasSelection
                ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            )}
            aria-pressed={!hasSelection}
          >
            All
          </button>

          {/* Primary tag pills */}
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={clsx(
                  'flex-shrink-0 snap-start',
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                  'focus:outline-none',
                  isSelected
                    ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                    : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                )}
                aria-pressed={isSelected}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Fade overlay on right edge for scroll indication */}
        <div
          className="absolute right-1 top-1 bottom-1 w-8 pointer-events-none sm:hidden"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-surface))',
          }}
        />
      </div>

      {/* Related tags row - only shown when filtering */}
      {hasSelection && relatedTags.length > 0 && (
        <div className="relative -mx-1">
          <div
            className={clsx(
              'flex items-center gap-2 overflow-x-auto py-1 px-1',
              'scrollbar-none',
              'snap-x snap-mandatory'
            )}
          >
            <span className="flex-shrink-0 text-xs text-[var(--color-text-muted)] pl-1">
              Related:
            </span>

            {relatedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={clsx(
                    'flex-shrink-0 snap-start',
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                    'focus:outline-none',
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--color-dark)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]/60 hover:bg-[var(--color-surface-alt)]'
                  )}
                  aria-pressed={isSelected}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Fade overlay */}
          <div
            className="absolute right-1 top-1 bottom-1 w-8 pointer-events-none sm:hidden"
            style={{
              background: 'linear-gradient(to right, transparent, var(--color-surface))',
            }}
          />
        </div>
      )}
    </div>
  );
}
