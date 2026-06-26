/**
 * Article list component that renders a paginated list of article cards.
 */

import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ArticleCard } from './ArticleCard';
import { Pagination } from '../ui';
import type { ArticleMetadata } from '../../content/types';

interface ArticleListProps {
  articles: ArticleMetadata[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function ArticleList({
  articles,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
}: ArticleListProps) {
  // Calculate the starting index for numbering
  const startIndex = (currentPage - 1) * itemsPerPage + 1;

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="py-16 text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface-alt)' }}
        >
          <DocumentTextIcon className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <h3
          className="font-display text-lg font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No articles found
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Article Cards */}
      <div className="divide-y divide-[var(--color-border)]">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            index={startIndex + index}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
