import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect if the page has been scrolled past a threshold.
 * Used for header background transitions.
 * Throttled to ~60fps (16ms) for better performance.
 */
export function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking.current = false;
      });
    };

    // Check initial scroll position
    setScrolled(window.scrollY > threshold);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
