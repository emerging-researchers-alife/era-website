import { useNavigate } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { ClockIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { AgendaEntry } from '../../lib/events';
import { formatEventDate, formatLocalTime, formatShortDate, formatSourceTime } from '../../lib/events';
import { getEventLayoutId, useEventSelection } from './EventSelectionContext';

interface EventItemProps {
  entry: AgendaEntry;
  /** Condensed styling for the past-events disclosure. */
  compact?: boolean;
}

const MAX_THEN_DATES = 3;

export function EventItem({ entry, compact = false }: EventItemProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { setActiveOccurrence } = useEventSelection();
  const { event, next, rest } = entry;

  const resolved = { event, occurrence: next };
  const date = formatEventDate(next.startUtc);
  const localTime = formatLocalTime(next.startUtc);
  const sourceTime = formatSourceTime(next.startUtc, event.timezone);

  const thenDates = rest.slice(0, MAX_THEN_DATES).map((o) => formatShortDate(o.startUtc));
  const moreCount = rest.length - thenDates.length;

  const openEvent = () => {
    setActiveOccurrence(resolved);
    void navigate({ to: '/events/$slug', params: { slug: event.slug } });
  };

  return (
    <motion.button
      type="button"
      layoutId={shouldReduceMotion ? undefined : getEventLayoutId(resolved)}
      onClick={openEvent}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="group block w-full border-t border-[var(--color-border)] py-6 text-left first:border-t-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-surface)]"
    >
      <span className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-6">
        {/* Date marker */}
        <span className="text-left">
          <span className="block font-display text-3xl leading-none text-[var(--color-dark)] sm:text-4xl">
            {date.day}
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {date.weekday}
          </span>
        </span>

        {/* Content */}
        <span className="min-w-0">
          {event.recurrenceText && (
            <span className="block text-sm font-medium text-[var(--color-primary-dark)]">
              {event.recurrenceText}
            </span>
          )}
          <span className="mt-1 block font-display text-xl font-medium leading-tight text-[var(--color-dark)] transition-colors group-hover:text-[var(--color-primary-dark)] sm:text-2xl">
            {event.title}
          </span>

          {!compact && (
            <span className="mt-2 block max-w-prose leading-relaxed text-[var(--color-text-secondary)]">
              {event.summary.trim()}
            </span>
          )}

          <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
              {localTime}
              <span className="text-[var(--color-text-muted)]">·</span>
              {sourceTime}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
              <span className="truncate">{event.location.label}</span>
            </span>
          </span>

          {!compact && thenDates.length > 0 && (
            <span className="mt-2 block text-sm text-[var(--color-text-muted)]">
              Then {thenDates.join(' · ')}
              {moreCount > 0 && ` · +${moreCount} more`}
            </span>
          )}
        </span>

        {/* Affordance */}
        <span className="hidden self-center sm:block">
          <ChevronRightIcon
            className="h-5 w-5 text-[var(--color-text-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-primary-dark)]"
            aria-hidden="true"
          />
        </span>
      </span>
    </motion.button>
  );
}
