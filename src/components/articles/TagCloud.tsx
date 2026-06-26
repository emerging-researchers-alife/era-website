/**
 * Interactive tag cloud with horizontal flow layout.
 * Shows primary tags initially, expands to reveal co-occurring tags on selection.
 */

import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { FloatingTag } from './FloatingTag';
import { useArticlesStore } from '../../stores/useArticlesStore';
import { getCooccurringTags } from '../../lib/tagCooccurrence';
import { PRIMARY_TAGS } from '../../content/types';
import { allTags } from '../../content/registry';

// Maximum number of secondary tags to show initially
const MAX_SECONDARY_TAGS = 8;

export function TagCloud() {
  const [showAllSecondary, setShowAllSecondary] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const {
    selectedTags,
    cloudExpanded,
    toggleTag,
    resetCloud,
  } = useArticlesStore();

  // Get co-occurring tags when tags are selected
  const cooccurringTags = useMemo(() => {
    if (selectedTags.length === 0) return [];
    return getCooccurringTags(selectedTags);
  }, [selectedTags]);

  // Categorize tags for layout
  const { primaryTags, secondaryTags, hiddenCount } = useMemo(() => {
    const primaryTagSet = new Set(PRIMARY_TAGS as readonly string[]);

    // Primary tags that exist in articles
    const primary = allTags.filter((tag) => primaryTagSet.has(tag));

    // Secondary tags (co-occurring, non-primary)
    const cooccurringTagNames = cooccurringTags.map((t) => t.tag);
    const secondary = cooccurringTagNames.filter((tag) => !primaryTagSet.has(tag));

    // Limit secondary tags unless expanded
    const limitedSecondary = showAllSecondary
      ? secondary
      : secondary.slice(0, MAX_SECONDARY_TAGS);

    return {
      primaryTags: primary,
      secondaryTags: limitedSecondary,
      hiddenCount: Math.max(0, secondary.length - MAX_SECONDARY_TAGS),
    };
  }, [cooccurringTags, showAllSecondary]);

  // Create co-occurrence strength map
  const cooccurrenceMap = useMemo(() => {
    const map = new Map<string, number>();
    const maxCount = Math.max(...cooccurringTags.map((t) => t.count), 1);
    for (const { tag, count } of cooccurringTags) {
      map.set(tag, count / maxCount);
    }
    return map;
  }, [cooccurringTags]);

  const handleTagClick = useCallback(
    (tag: string) => {
      toggleTag(tag);
      setShowAllSecondary(false);
    },
    [toggleTag]
  );

  const handleReset = useCallback(() => {
    resetCloud();
    setShowAllSecondary(false);
  }, [resetCloud]);

  const hasSelection = selectedTags.length > 0;
  const hasHiddenTags = hiddenCount > 0 && !showAllSecondary;

  return (
    <div className="relative">
      {/* Reset button - top right */}
      <AnimatePresence>
        {hasSelection && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={handleReset}
            className="absolute -top-1 right-0 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors z-10"
            title="Reset filters"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <LayoutGroup>
        {/* Main tag container */}
        <motion.div
          layout
          className="flex flex-col items-center gap-3"
          transition={{
            layout: {
              type: 'spring',
              stiffness: shouldReduceMotion ? 400 : 200,
              damping: shouldReduceMotion ? 40 : 25,
            },
          }}
          role="group"
          aria-label="Filter by tags"
        >
          {/* Selected + Related tags row (when expanded) */}
          <AnimatePresence mode="popLayout">
            {cloudExpanded && (
              <motion.div
                key="selected-row"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {/* Selected tags first */}
                {selectedTags.map((tag) => (
                  <FloatingTag
                    key={tag}
                    tag={tag}
                    isSelected={true}
                    isPrimary={new Set(PRIMARY_TAGS as readonly string[]).has(tag)}
                    onClick={() => handleTagClick(tag)}
                  />
                ))}

                {/* Secondary (co-occurring) tags */}
                {secondaryTags.map((tag) => (
                  <FloatingTag
                    key={tag}
                    tag={tag}
                    isSelected={selectedTags.includes(tag)}
                    isPrimary={false}
                    cooccurrenceStrength={cooccurrenceMap.get(tag) || 0.5}
                    onClick={() => handleTagClick(tag)}
                  />
                ))}

                {/* Show more button */}
                {hasHiddenTags && (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowAllSecondary(true)}
                    className="px-3 py-1.5 text-xs text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    +{hiddenCount} more
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary tags row */}
          <motion.div
            layout
            className="flex flex-wrap justify-center gap-2"
          >
            <AnimatePresence mode="popLayout">
              {primaryTags
                .filter((tag) => !selectedTags.includes(tag))
                .map((tag) => (
                  <FloatingTag
                    key={tag}
                    tag={tag}
                    isSelected={false}
                    isPrimary={true}
                    isFaded={cloudExpanded}
                    onClick={() => handleTagClick(tag)}
                  />
                ))}
            </AnimatePresence>
          </motion.div>

          {/* No related tags message */}
          <AnimatePresence>
            {cloudExpanded && cooccurringTags.length === 0 && selectedTags.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[var(--color-text-muted)]"
              >
                No related tags found
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
