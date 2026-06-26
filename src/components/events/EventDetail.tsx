import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { ArrowTopRightOnSquareIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';
import { BASE_PATH } from '../../router';
import { eventsBySlug } from '../../content/events.registry';
import type { Event as EventContent, EventMetadata, EventOccurrence } from '../../content/events.types';
import { formatLocalTime, formatSourceTime } from '../../lib/events';
import { AddToCalendar } from '../community/AddToCalendar';

interface EventDetailProps {
  slug: string;
  selectedOccurrence?: EventOccurrence;
}

const MAX_VISIBLE_DATES = 4;

const SANITIZE_OPTIONS = {
  ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mtext', 'annotation', 'semantics'],
  ADD_ATTR: ['encoding', 'data-codetabs', 'data-expandable-code', 'data-nca'],
};

function formatOccurrenceDate(startUtc: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(startUtc));
}

function getDisplayOccurrences(event: EventMetadata): EventOccurrence[] {
  const now = Date.now();
  const upcoming = event.occurrences.filter((occurrence) => {
    const endTime = new Date(occurrence.endUtc ?? occurrence.startUtc).getTime();
    return endTime >= now;
  });

  return upcoming.length > 0 ? upcoming : event.occurrences;
}

function getNextOccurrence(event: EventMetadata): EventOccurrence | undefined {
  return getDisplayOccurrences(event)[0] ?? event.occurrences[0];
}

export function EventDetail({ slug, selectedOccurrence }: EventDetailProps) {
  const event = eventsBySlug[slug];
  const [fullEvent, setFullEvent] = useState<EventContent | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(event));
  const [error, setError] = useState<string | null>(null);

  const occurrence = selectedOccurrence ?? (event ? getNextOccurrence(event) : undefined);
  const displayOccurrences = useMemo(
    () => (event ? getDisplayOccurrences(event) : []),
    [event]
  );
  const visibleOccurrences = displayOccurrences.slice(0, MAX_VISIBLE_DATES);
  const hiddenOccurrenceCount = Math.max(displayOccurrences.length - visibleOccurrences.length, 0);
  const datesAreUpcoming =
    displayOccurrences.length > 0 &&
    new Date(displayOccurrences[0].endUtc ?? displayOccurrences[0].startUtc).getTime() >= Date.now();

  useEffect(() => {
    if (!event) {
      setIsLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${BASE_PATH}/events/${slug}.json`);

        if (!response.ok) {
          throw new Error('Failed to load event');
        }

        const data = await response.json();
        setFullEvent(data);
      } catch (e) {
        console.error('Error loading event:', e);
        setError(e instanceof Error ? e.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchEvent();
  }, [event, slug]);

  if (!event) {
    return (
      <div className="p-6">
        <h2 id="event-detail-title" className="font-display text-3xl font-medium text-[var(--color-dark)]">
          Event Not Found
        </h2>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          This event does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <article className="p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 pr-12 md:flex-row md:items-start md:justify-between md:pr-16">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium text-[var(--color-primary-dark)]">
            {event.recurrenceText ?? 'One-time event'}
          </p>
          <h2 id="event-detail-title" className="font-display text-3xl font-medium leading-tight text-[var(--color-dark)] md:text-4xl">
            {event.title}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            {event.summary.trim()}
          </p>
        </div>

        {occurrence && (
          <div className="shrink-0">
            <AddToCalendar event={event} occurrence={occurrence} />
          </div>
        )}
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[var(--color-surface-alt)] p-4">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Location
          </p>
          <div className="mt-2 flex items-start gap-2 text-[var(--color-dark)]">
            <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary-dark)]" />
            {event.location.url ? (
              <a
                href={event.location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border-none font-medium hover:text-[var(--color-primary-dark)]"
              >
                {event.location.label}
                <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <span className="font-medium">{event.location.label}</span>
            )}
          </div>
        </div>

        {event.registrationUrl && (
          <div className="rounded-xl bg-[var(--color-surface-alt)] p-4">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              Registration
            </p>
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[var(--color-dark)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-dark-soft)]"
            >
              <TicketIcon className="h-4 w-4" aria-hidden="true" />
              Register
            </a>
          </div>
        )}
      </div>

      <section className="mb-8">
        <h3 className="mb-3 font-display text-xl font-medium text-[var(--color-dark)]">
          {datesAreUpcoming ? 'Upcoming Dates' : 'Dates'}
        </h3>
        <div className="grid gap-2">
          {visibleOccurrences.map((date) => (
            <div
              key={date.startUtc}
              className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3"
            >
              <p className="font-medium text-[var(--color-dark)]">
                {formatOccurrenceDate(date.startUtc)}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatLocalTime(date.startUtc)} your time, {formatSourceTime(date.startUtc, event.timezone)}
              </p>
            </div>
          ))}
        </div>
        {hiddenOccurrenceCount > 0 && (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            {hiddenOccurrenceCount} later {hiddenOccurrenceCount === 1 ? 'date' : 'dates'} available through the calendar links.
          </p>
        )}
      </section>

      {event.activities && event.activities.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 font-display text-xl font-medium text-[var(--color-dark)]">
            Activities
          </h3>
          <ul className="grid gap-2">
            {event.activities.map((activity) => (
              <li
                key={activity}
                className="rounded-lg bg-[var(--color-primary-glow)] px-4 py-2 text-[var(--color-dark)]"
              >
                {activity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading event details">
          <div className="h-4 w-3/4 rounded bg-[var(--color-surface-alt)]" />
          <div className="h-4 w-full rounded bg-[var(--color-surface-alt)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--color-surface-alt)]" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-alt)] p-5 text-[var(--color-text-secondary)]">
          {error}
        </div>
      ) : fullEvent ? (
        <div
          className="event-detail-content"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(fullEvent.content, SANITIZE_OPTIONS),
          }}
        />
      ) : null}
    </article>
  );
}
