/**
 * Article card component for displaying article previews in the list view.
 */

import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '../ui';
import type { ArticleMetadata } from '../../content/types';

interface ArticleCardProps {
  article: ArticleMetadata;
  index: number;
}

/**
 * Format author names for display.
 * - Single author: "Jane Doe"
 * - Two authors: "Jane Doe & John Smith"
 * - Three or more: "Jane Doe et al."
 */
function formatAuthors(authors: ArticleMetadata['authors']): string {
  if (authors.length === 1) return authors[0].name;
  if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`;
  return `${authors[0].name} et al.`;
}

/**
 * Format date for display.
 */
function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link
        to="/resources/$slug"
        params={{ slug: article.slug }}
        className="block py-6 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]/50 -mx-4 px-4 rounded-lg transition-colors"
        data-umami-event="article-click"
        data-umami-event-slug={article.slug}
        data-umami-event-type={article.tags.find(t => ['tutorial', 'guide', 'explainer', 'research', 'opinion', 'recap'].includes(t)) || 'article'}
        data-umami-event-level={article.tags.find(t => ['beginner', 'intermediate', 'advanced'].includes(t)) || 'unspecified'}
      >
        {/* Title Row */}
        <div className="flex gap-3 items-baseline mb-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)] tabular-nums">
            {index}.
          </span>
          <h3 className="font-display text-lg font-semibold text-[var(--color-dark)] group-hover:text-[var(--color-primary-dark)] transition-colors line-clamp-2">
            {article.title}
          </h3>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-text-muted)] mb-3 ml-7">
          <span>{formatAuthors(article.authors)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{article.readingTime} min read</span>
          {article.status === 'peer-reviewed' && (
            <>
              <span aria-hidden="true">·</span>
              <Badge variant="primary">Peer Reviewed</Badge>
            </>
          )}
        </div>

        {/* Abstract */}
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-2 mb-3 ml-7">
          {article.abstract}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 ml-7">
          {article.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 4 && (
            <span className="text-xs text-[var(--color-text-muted)]">
              +{article.tags.length - 4} more
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
