/**
 * Zustand store for article list state management.
 * Handles search, tag filtering, pagination, and tag cloud state.
 * Syncs filter state to URL for shareable filtered views.
 */

import { create } from 'zustand';

/**
 * Update URL search params to reflect current filter state.
 * Enables shareable filtered article views.
 */
function syncToUrl(searchQuery: string, selectedTags: string[], page: number) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  // Update or remove query param
  if (searchQuery) {
    url.searchParams.set('q', searchQuery);
  } else {
    url.searchParams.delete('q');
  }

  // Update or remove tags param
  if (selectedTags.length > 0) {
    url.searchParams.set('tags', selectedTags.join(','));
  } else {
    url.searchParams.delete('tags');
  }

  // Update or remove page param (only show if not page 1)
  if (page > 1) {
    url.searchParams.set('page', String(page));
  } else {
    url.searchParams.delete('page');
  }

  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
}

/**
 * Read filter state from URL search params.
 * Called on initial page load to restore filter state.
 */
export function getParamsFromUrl(): { q?: string; tags?: string[]; page?: number } {
  if (typeof window === 'undefined') return {};

  const url = new URL(window.location.href);
  const q = url.searchParams.get('q') || undefined;
  const tagsParam = url.searchParams.get('tags');
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;
  const pageParam = url.searchParams.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : undefined;

  return { q, tags, page };
}

interface ArticlesState {
  // Filter state
  searchQuery: string;
  selectedTags: string[];
  currentPage: number;

  // Tag cloud state
  cloudExpanded: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  // Tag cloud actions
  expandCloud: () => void;
  collapseCloud: () => void;
  resetCloud: () => void;

  // Initialize from URL params
  initFromParams: (params: { q?: string; tags?: string[]; page?: number }) => void;
}

export const useArticlesStore = create<ArticlesState>((set) => ({
  // Initial state
  searchQuery: '',
  selectedTags: [],
  currentPage: 1,
  cloudExpanded: false,

  // Set search query and reset to first page
  setSearchQuery: (query) =>
    set((state) => {
      syncToUrl(query, state.selectedTags, 1);
      return {
        searchQuery: query,
        currentPage: 1,
      };
    }),

  // Toggle a tag on/off and reset to first page
  // Auto-expands cloud when selecting a tag
  toggleTag: (tag) =>
    set((state) => {
      const isSelected = state.selectedTags.includes(tag);
      const newSelectedTags = isSelected
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag];

      syncToUrl(state.searchQuery, newSelectedTags, 1);

      return {
        selectedTags: newSelectedTags,
        currentPage: 1,
        // Expand cloud when selecting, collapse when deselecting all
        cloudExpanded: newSelectedTags.length > 0,
      };
    }),

  // Clear all selected tags
  clearTags: () =>
    set((state) => {
      syncToUrl(state.searchQuery, [], 1);
      return {
        selectedTags: [],
        currentPage: 1,
      };
    }),

  // Set current page
  setPage: (page) =>
    set((state) => {
      syncToUrl(state.searchQuery, state.selectedTags, page);
      return {
        currentPage: page,
      };
    }),

  // Reset all filters to initial state
  resetFilters: () => {
    syncToUrl('', [], 1);
    return set({
      searchQuery: '',
      selectedTags: [],
      currentPage: 1,
      cloudExpanded: false,
    });
  },

  // Expand the tag cloud to show all tags
  expandCloud: () =>
    set({
      cloudExpanded: true,
    }),

  // Collapse the tag cloud to show only primary tags
  collapseCloud: () =>
    set({
      cloudExpanded: false,
    }),

  // Reset cloud: clear selections and collapse
  resetCloud: () =>
    set({
      selectedTags: [],
      currentPage: 1,
      cloudExpanded: false,
    }),

  // Initialize state from URL params (called on mount)
  initFromParams: (params) =>
    set({
      searchQuery: params.q || '',
      selectedTags: params.tags || [],
      currentPage: params.page || 1,
      cloudExpanded: (params.tags?.length || 0) > 0,
    }),
}));
