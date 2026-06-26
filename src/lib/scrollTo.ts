/**
 * Smooth scroll utilities for article navigation.
 */

/**
 * Scroll to an element by ID with smooth behavior.
 * Accounts for fixed header offset.
 */
export function scrollToElement(
  elementId: string,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
  } = {}
): void {
  const { offset = 100, behavior = 'smooth' } = options;

  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior,
  });
}

/**
 * Get the currently visible section based on scroll position.
 * Useful for highlighting active ToC item.
 */
export function getActiveSection(
  sectionIds: string[],
  offset: number = 120
): string | null {
  const scrollPosition = window.scrollY + offset;

  // Find the section that's currently in view
  for (let i = sectionIds.length - 1; i >= 0; i--) {
    const sectionId = sectionIds[i];
    const element = document.getElementById(sectionId);
    if (element && element.offsetTop <= scrollPosition) {
      return sectionId;
    }
  }

  return sectionIds[0] || null;
}

/**
 * Hook up smooth scroll to all anchor links within a container.
 * Call this in useEffect after content is rendered.
 */
export function enableSmoothScrollForAnchors(
  containerRef: HTMLElement | null,
  offset: number = 100
): () => void {
  if (!containerRef) return () => {};

  const handleClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;

    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.slice(1);
        scrollToElement(targetId, { offset });

        // Update URL hash without jumping
        history.pushState(null, '', href);
      }
    }
  };

  containerRef.addEventListener('click', handleClick);

  // Cleanup function
  return () => {
    containerRef.removeEventListener('click', handleClick);
  };
}
