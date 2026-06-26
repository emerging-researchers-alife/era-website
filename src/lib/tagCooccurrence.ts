/**
 * Tag co-occurrence utilities for the interactive tag cloud.
 * Computes which tags appear together in articles.
 */

import { articlesByDate } from '../content/registry';

export interface TagCooccurrence {
  tag: string;
  count: number;
}

/**
 * Compute which tags co-occur with the given selected tags.
 * Returns tags that appear in articles containing ALL selected tags,
 * sorted by occurrence count (descending).
 */
export function getCooccurringTags(selectedTags: string[]): TagCooccurrence[] {
  if (selectedTags.length === 0) {
    return [];
  }

  // Find articles that contain ALL selected tags
  const matchingArticles = articlesByDate.filter((article) =>
    selectedTags.every((tag) => article.tags.includes(tag))
  );

  // Count occurrences of other tags in matching articles
  const tagCounts = new Map<string, number>();

  for (const article of matchingArticles) {
    for (const tag of article.tags) {
      // Don't include the selected tags themselves
      if (!selectedTags.includes(tag)) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  // Convert to array and sort by count
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all tags that co-occur with a specific tag.
 * Convenience wrapper for single tag selection.
 */
export function getTagsRelatedTo(tag: string): TagCooccurrence[] {
  return getCooccurringTags([tag]);
}

/**
 * Build a full co-occurrence matrix for all tags.
 * Useful for visualization or precomputation.
 */
export function buildCooccurrenceMatrix(): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();

  for (const article of articlesByDate) {
    const tags = article.tags;

    // For each pair of tags in this article
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const tag1 = tags[i];
        const tag2 = tags[j];

        // Increment count for both directions
        if (!matrix.has(tag1)) matrix.set(tag1, new Map());
        if (!matrix.has(tag2)) matrix.set(tag2, new Map());

        const map1 = matrix.get(tag1)!;
        const map2 = matrix.get(tag2)!;

        map1.set(tag2, (map1.get(tag2) || 0) + 1);
        map2.set(tag1, (map2.get(tag1) || 0) + 1);
      }
    }
  }

  return matrix;
}
