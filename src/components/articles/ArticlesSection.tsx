/**
 * Container component that combines search, filters, and article list.
 * Handles filtering logic and Fuse.js search.
 * Initializes filter state from URL params for shareable links.
 */

import { useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { SearchBar } from './SearchBar';
import { TagFilter } from './TagFilter';
import { ArticleList } from './ArticleList';
import { useArticlesStore, getParamsFromUrl } from '../../stores/useArticlesStore';
import { articlesByDate, allTags } from '../../content/registry';
import { PRIMARY_TAGS } from '../../content/types';
import { getCooccurringTags } from '../../lib/tagCooccurrence';
import type { ArticleMetadata } from '../../content/types';

// Fuse.js configuration for fuzzy search
const fuseOptions: Fuse.IFuseOptions<ArticleMetadata> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'abstract', weight: 0.3 },
    { name: 'authors.name', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  ignoreLocation: true,
};

const ITEMS_PER_PAGE = 10;

export function ArticlesSection() {
  const {
    searchQuery,
    selectedTags,
    currentPage,
    setSearchQuery,
    toggleTag,
    clearTags,
    setPage,
    initFromParams,
  } = useArticlesStore();

  // Initialize filter state from URL params on mount
  useEffect(() => {
    const params = getParamsFromUrl();
    if (params.q || params.tags?.length || params.page) {
      initFromParams(params);
    }
  }, [initFromParams]);

  // Get primary tags that exist in articles
  const primaryTags = useMemo(() => {
    const primarySet = new Set(PRIMARY_TAGS as readonly string[]);
    return allTags.filter((tag) => primarySet.has(tag));
  }, []);

  // Get related (co-occurring) tags when filtering
  const relatedTags = useMemo(() => {
    if (selectedTags.length === 0) return [];
    const primarySet = new Set(PRIMARY_TAGS as readonly string[]);
    const cooccurring = getCooccurringTags(selectedTags);
    // Only show non-primary tags as related
    return cooccurring
      .filter((t) => !primarySet.has(t.tag))
      .map((t) => t.tag);
  }, [selectedTags]);

  // Filter articles by tags first
  const tagFilteredArticles = useMemo(() => {
    if (selectedTags.length === 0) return articlesByDate;
    return articlesByDate.filter((article) =>
      selectedTags.some((tag) => article.tags.includes(tag))
    );
  }, [selectedTags]);

  // Memoize Fuse instance - only recreate when articles change, not on every keystroke
  const fuse = useMemo(
    () => new Fuse(tagFilteredArticles, fuseOptions),
    [tagFilteredArticles]
  );

  // Apply search filter using memoized Fuse instance
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return tagFilteredArticles;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, tagFilteredArticles, fuse]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 if current page is beyond total pages (with guard against empty results)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setPage(1);
    }
  }, [currentPage, totalPages, setPage]);

  return (
    <div className="space-y-6">
      {/* Tag Filter */}
      <TagFilter
        availableTags={primaryTags}
        selectedTags={selectedTags}
        relatedTags={relatedTags}
        onTagToggle={toggleTag}
        onClearAll={clearTags}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search articles by title, content, or author..."
      />

      {/* Results Count */}
      {(searchQuery || selectedTags.length > 0) && (
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredArticles.length === 0
            ? 'No articles found'
            : `${filteredArticles.length} article${filteredArticles.length === 1 ? '' : 's'} found`}
        </p>
      )}

      {/* Article List */}
      <ArticleList
        articles={paginatedArticles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
