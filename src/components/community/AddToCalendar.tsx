import { CalendarDaysIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import type { EventMetadata, EventOccurrence } from '../../content/events.types';

interface AddToCalendarProps {
  event: EventMetadata;
  occurrence: EventOccurrence;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatUtcForCalendar(value: string): string {
  return value.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function getEndUtc(event: EventMetadata, occurrence: EventOccurrence): string {
  if (occurrence.endUtc) {
    return occurrence.endUtc;
  }

  const start = new Date(occurrence.startUtc);
  const durationMinutes = event.durationMinutes ?? 60;
  return new Date(start.getTime() + durationMinutes * 60_000).toISOString();
}

function buildIcs(event: EventMetadata, occurrence: EventOccurrence): string {
  const endUtc = getEndUtc(event, occurrence);
  const uid = `${event.slug}-${formatUtcForCalendar(occurrence.startUtc)}@emergingresearchers.life`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Emerging Researchers in Artificial Life//ERA Events//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcForCalendar(new Date().toISOString())}`,
    `DTSTART:${formatUtcForCalendar(occurrence.startUtc)}`,
    `DTEND:${formatUtcForCalendar(endUtc)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.summary.trim())}`,
    `LOCATION:${escapeIcsText(event.location.label)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function AddToCalendar({ event, occurrence }: AddToCalendarProps) {
  const endUtc = getEndUtc(event, occurrence);
  const dates = `${formatUtcForCalendar(occurrence.startUtc)}/${formatUtcForCalendar(endUtc)}`;

  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', event.title);
  googleUrl.searchParams.set('dates', dates);
  googleUrl.searchParams.set('details', event.summary.trim());
  googleUrl.searchParams.set('location', event.location.url ?? event.location.label);

  const icsHref = useMemo(() => {
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event, occurrence))}`;
  }, [event, occurrence]);

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={icsHref}
        download={`${event.slug}.ics`}
        aria-label={`Download ${event.title} as an ICS calendar file`}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium bg-[var(--color-dark)] text-white hover:bg-[var(--color-dark-soft)] active:scale-[0.98] transition border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] focus-visible:ring-offset-2"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        .ics
      </a>
      <a
        href={googleUrl.toString()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Add ${event.title} to Google Calendar`}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-primary-light)] active:scale-[0.98] transition border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] focus-visible:ring-offset-2"
      >
        <CalendarDaysIcon className="w-4 h-4" />
        Google
      </a>
    </div>
  );
}
