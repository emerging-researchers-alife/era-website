/**
 * Table of Contents component for article navigation.
 * Shows as a sticky sidebar on desktop, collapsible on mobile.
 * H3 headings are nested under H2s and auto-expand when that section is active.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { scrollToElement, getActiveSection } from '../../lib/scrollTo';
import type { TableOfContentsItem } from '../../content/types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  className?: string;
}

interface TocGroup {
  h2: TableOfContentsItem;
  children: TableOfContentsItem[];
}

/**
 * Group flat ToC items into H2 sections with nested H3 children.
 */
function groupItems(items: TableOfContentsItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  let currentGroup: TocGroup | null = null;

  for (const item of items) {
    if (item.level === 2) {
      // Start a new group
      currentGroup = { h2: item, children: [] };
      groups.push(currentGroup);
    } else if (item.level === 3 && currentGroup) {
      // Add to current group's children
      currentGroup.children.push(item);
    }
  }

  return groups;
}

/**
 * Find which H2 section contains the active item.
 */
function findActiveH2(groups: TocGroup[], activeId: string | null): string | null {
  if (!activeId) return null;

  for (const group of groups) {
    if (group.h2.id === activeId) {
      return group.h2.id;
    }
    for (const child of group.children) {
      if (child.id === activeId) {
        return group.h2.id;
      }
    }
  }

  return null;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Group items by H2 sections
  const groups = useMemo(() => groupItems(items), [items]);

  // Get all section IDs for scroll tracking
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  // Find which H2 section is currently active
  const activeH2Id = useMemo(() => findActiveH2(groups, activeId), [groups, activeId]);

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const active = getActiveSection(sectionIds, 120);
      setActiveId(active);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  const handleItemClick = useCallback((id: string) => {
    // Close dropdown first, then scroll after exit animation completes
    // This fixes mobile scroll not working due to AnimatePresence interference
    setIsExpanded(false);
    setTimeout(() => {
      scrollToElement(id, { offset: 100 });
    }, 250);
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile: Collapsible dropdown */}
      <div className={clsx('lg:hidden', className)}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white shadow-[var(--shadow-sm)] text-left"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--color-dark)' }}>
            <ListBulletIcon className="w-[18px] h-[18px]" />
            Table of Contents
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-[18px] h-[18px]" style={{ color: 'var(--color-text-muted)' }} />
          </motion.span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              aria-label="Table of contents"
            >
              <ul className="mt-2 p-4 rounded-xl bg-white shadow-[var(--shadow-sm)] space-y-1">
                {groups.map((group) => (
                  <li key={group.h2.id}>
                    {/* H2 item */}
                    <button
                      onClick={() => handleItemClick(group.h2.id)}
                      className={clsx(
                        'block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors',
                        activeId === group.h2.id
                          ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary-dark)] font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'
                      )}
                    >
                      {group.h2.text}
                    </button>

                    {/* H3 children - always visible in mobile dropdown */}
                    {group.children.length > 0 && (
                      <ul className="ml-3 mt-1 space-y-1">
                        {group.children.map((child) => (
                          <li key={child.id}>
                            <button
                              onClick={() => handleItemClick(child.id)}
                              className={clsx(
                                'block w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors',
                                activeId === child.id
                                  ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary-dark)] font-medium'
                                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]'
                              )}
                            >
                              {child.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Sticky sidebar with collapsible sections */}
      <nav
        className={clsx('hidden lg:block sticky top-24', className)}
        aria-label="Table of contents"
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          On this page
        </p>
        <ul className="space-y-0.5 border-l-2 border-[var(--color-border)]">
          {groups.map((group) => {
            const isActiveSection = activeH2Id === group.h2.id;
            const hasChildren = group.children.length > 0;

            return (
              <li key={group.h2.id} className="relative">
                {/* Active indicator for H2 */}
                {activeId === group.h2.id && (
                  <motion.div
                    layoutId="toc-indicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 -ml-0.5 bg-[var(--color-primary)]"
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* H2 item */}
                <button
                  onClick={() => handleItemClick(group.h2.id)}
                  className={clsx(
                    'flex items-center w-full text-left py-1.5 pl-4 pr-2 text-sm transition-colors',
                    activeId === group.h2.id
                      ? 'text-[var(--color-primary-dark)] font-medium'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {hasChildren && (
                    <motion.span
                      animate={{ rotate: isActiveSection ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                      className="mr-1 flex-shrink-0"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <ChevronRightIcon className="w-3 h-3" />
                    </motion.span>
                  )}
                  <span className={!hasChildren ? 'ml-4' : ''}>{group.h2.text}</span>
                </button>

                {/* H3 children - collapsible based on active section */}
                <AnimatePresence>
                  {hasChildren && isActiveSection && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {group.children.map((child) => (
                        <li key={child.id} className="relative">
                          {/* Active indicator for H3 */}
                          {activeId === child.id && (
                            <motion.div
                              layoutId="toc-indicator"
                              className="absolute left-0 top-0 bottom-0 w-0.5 -ml-0.5 bg-[var(--color-primary)]"
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <button
                            onClick={() => handleItemClick(child.id)}
                            className={clsx(
                              'block w-full text-left py-1 pl-9 pr-2 text-sm transition-colors',
                              activeId === child.id
                                ? 'text-[var(--color-primary-dark)] font-medium'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            )}
                          >
                            {child.text}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
