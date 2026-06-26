import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getEventLayoutId, useEventSelection } from './EventSelectionContext';
import { EventDetail } from './EventDetail';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function EventModal() {
  const { slug } = useParams({ from: '/events/$slug' });
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { activeOccurrence } = useEventSelection();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const layoutId =
    activeOccurrence?.event.slug === slug && !shouldReduceMotion
      ? getEventLayoutId(activeOccurrence)
      : undefined;

  const close = () => {
    // replace (not push) so the back button doesn't reopen the modal after the
    // open pushed /events/$slug — and deep-link closes land cleanly on /events.
    void navigate({ to: '/events', replace: true });
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(13,17,23,0.45)] px-4 py-8 backdrop-blur-sm md:py-12"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <motion.div
        ref={panelRef}
        layoutId={layoutId}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lg)]"
        initial={layoutId || shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={layoutId || shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-colors hover:text-[var(--color-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)]"
          aria-label="Close event details"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <EventDetail
          slug={slug}
          selectedOccurrence={
            activeOccurrence?.event.slug === slug ? activeOccurrence.occurrence : undefined
          }
        />
      </motion.div>
    </motion.div>
  );
}
