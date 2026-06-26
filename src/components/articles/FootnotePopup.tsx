/**
 * Footnote popup system using DOM event delegation.
 * Shows footnote content on hover over footnote references.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { HoverBox } from './HoverBox';

interface FootnotePopupProps {
  /** Reference to the article content container */
  containerRef: React.RefObject<HTMLElement>;
}

interface FootnoteState {
  isVisible: boolean;
  content: string;
  position: { x: number; y: number };
}

export function FootnotePopup({ containerRef }: FootnotePopupProps) {
  const [footnote, setFootnote] = useState<FootnoteState>({
    isVisible: false,
    content: '',
    position: { x: 0, y: 0 },
  });

  const hideTimeoutRef = useRef<number | null>(null);

  // Get footnote content by ID
  const getFootnoteContent = useCallback((refId: string): string => {
    // refId is like "user-content-fnref-1", we need "user-content-fn-1"
    const footnoteId = refId.replace('fnref', 'fn');
    const footnoteElement = document.getElementById(footnoteId);

    if (!footnoteElement) return '';

    // Get the paragraph content, excluding the back-reference link
    const paragraph = footnoteElement.querySelector('p');
    if (paragraph) {
      // Clone to avoid modifying the DOM
      const clone = paragraph.cloneNode(true) as HTMLElement;
      // Remove the back-reference link
      const backref = clone.querySelector('.data-footnote-backref');
      if (backref) backref.remove();
      return clone.textContent?.trim() || '';
    }

    return footnoteElement.textContent?.trim() || '';
  }, []);

  // Handle mouse enter on footnote reference
  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const footnoteRef = target.closest('a[data-footnote-ref]') as HTMLAnchorElement | null;

      if (footnoteRef) {
        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }

        const refId = footnoteRef.id;
        const content = getFootnoteContent(refId);

        if (content) {
          const rect = footnoteRef.getBoundingClientRect();
          setFootnote({
            isVisible: true,
            content,
            position: {
              x: rect.left,
              y: rect.bottom + 8,
            },
          });
        }
      }
    },
    [getFootnoteContent]
  );

  // Handle mouse leave - delay hiding to allow moving to popup
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const footnoteRef = target.closest('a[data-footnote-ref]');

    if (footnoteRef) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setFootnote((prev) => ({ ...prev, isVisible: false }));
      }, 150);
    }
  }, []);

  // Set up event delegation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use event delegation on the container
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [containerRef, handleMouseEnter, handleMouseLeave]);

  return (
    <HoverBox
      isVisible={footnote.isVisible}
      position={footnote.position}
      maxWidth={400}
    >
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {footnote.content}
      </p>
    </HoverBox>
  );
}
