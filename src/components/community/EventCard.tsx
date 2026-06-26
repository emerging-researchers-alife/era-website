import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { EventMetadata, EventOccurrence } from '../../content/events.types';
import { formatEventDate, formatLocalTime, formatSourceTime } from '../../lib/events';
import { AddToCalendar } from './AddToCalendar';

interface EventCardProps {
  event: EventMetadata;
  occurrence: EventOccurrence;
  compact?: boolean;
}

export function EventCard({
  event,
  occurrence,
  compact = false,
}: EventCardProps) {
  const date = formatEventDate(occurrence.startUtc);
  const localTime = formatLocalTime(occurrence.startUtc);
  const sourceTime = formatSourceTime(occurrence.startUtc, event.timezone);

  return (
    <article className="group py-6 border-t border-[var(--color-border)] first:border-t-0">
      <div className="grid grid-cols-[72px_1fr] md:grid-cols-[92px_1fr_auto] gap-4 md:gap-6 items-start">
        <div
          className="rounded-lg px-3 py-3 text-center"
          style={{ background: 'var(--color-primary-glow)' }}
        >
          <div className="text-xs uppercase font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
            {date.month}
          </div>
          <div className="font-display text-3xl leading-none mt-1" style={{ color: 'var(--color-dark)' }}>
            {date.day}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {date.weekday}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg md:text-xl mb-2" style={{ color: 'var(--color-dark)' }}>
            {event.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              {localTime} your time
              <span className="text-[var(--color-text-muted)]">.</span>
              {sourceTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4" />
              {event.location.url ? (
                <a
                  href={event.location.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-none hover:text-[var(--color-primary-dark)]"
                >
                  {event.location.label}
                </a>
              ) : (
                event.location.label
              )}
            </span>
          </div>

          <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {event.summary}
          </p>

          {!compact && event.activities && event.activities.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {event.activities.map((activity) => (
                <li
                  key={activity}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                  />
                  {activity}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!compact && (
          <div className="col-start-2 md:col-start-auto">
            <AddToCalendar event={event} occurrence={occurrence} />
          </div>
        )}
      </div>
    </article>
  );
}
