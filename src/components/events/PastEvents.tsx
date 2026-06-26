import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { AgendaEntry } from '../../lib/events';
import { EventItem } from './EventItem';

interface PastEventsProps {
  items: AgendaEntry[];
  /** Cap the list so the disclosure stays tidy. */
  limit?: number;
}

export function PastEvents({ items, limit = 8 }: PastEventsProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (items.length === 0) return null;

  const shown = items.slice(0, limit);

  return (
    <section className="border-t border-[var(--color-border-strong)] pt-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] focus-visible:ring-offset-2"
      >
        Past events
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 opacity-70 lg:pl-[calc(10rem+2rem)]">
              {shown.map((entry) => (
                <EventItem key={entry.event.slug} entry={entry} compact />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
