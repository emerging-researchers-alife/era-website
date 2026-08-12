import type { EventMetadata, EventOccurrence } from '../content/events.types';

export interface ResolvedEventOccurrence {
  event: EventMetadata;
  occurrence: EventOccurrence;
}

/**
 * One agenda row per event: the occurrence it represents (`next`) plus the
 * subsequent upcoming occurrences (`rest`) used for the "then scheduled" line.
 */
export interface AgendaEntry {
  event: EventMetadata;
  next: EventOccurrence;
  rest: EventOccurrence[];
}

export interface MonthGroup {
  /** 'YYYY-MM' sort/identity key. */
  monthKey: string;
  /** Display label, e.g. 'July 2026'. */
  label: string;
  items: AgendaEntry[];
}

function occurrenceEnd(occurrence: EventOccurrence): number {
  return new Date(occurrence.endUtc ?? occurrence.startUtc).getTime();
}

function startTime(occurrence: EventOccurrence): number {
  return new Date(occurrence.startUtc).getTime();
}

export function getResolvedEventOccurrences(events: EventMetadata[]): ResolvedEventOccurrence[] {
  return events
    .flatMap((event) =>
      event.occurrences.map((occurrence) => ({
        event,
        occurrence,
      }))
    )
    .sort((a, b) => startTime(a.occurrence) - startTime(b.occurrence));
}

export function splitEventOccurrences(
  events: EventMetadata[],
  now = Date.now()
): { upcoming: ResolvedEventOccurrence[]; past: ResolvedEventOccurrence[] } {
  const resolved = getResolvedEventOccurrences(events);
  const upcoming: ResolvedEventOccurrence[] = [];
  const past: ResolvedEventOccurrence[] = [];

  for (const item of resolved) {
    if (occurrenceEnd(item.occurrence) >= now) {
      upcoming.push(item);
    } else {
      past.push(item);
    }
  }

  return {
    upcoming,
    // Most-recent-first for the "Past events" disclosure.
    past: past.reverse(),
  };
}

function monthGroup(entries: AgendaEntry[], pick: (entry: AgendaEntry) => EventOccurrence): MonthGroup[] {
  const groups: MonthGroup[] = [];

  for (const entry of entries) {
    const date = new Date(pick(entry).startUtc);
    const timeZone = entry.event.allDay ? entry.event.timezone : undefined;
    const keyParts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      timeZone,
    }).formatToParts(date);
    const year = keyParts.find((part) => part.type === 'year')?.value ?? '';
    const month = keyParts.find((part) => part.type === 'month')?.value ?? '';
    const monthKey = `${year}-${month}`;
    let group = groups.at(-1);

    if (!group || group.monthKey !== monthKey) {
      group = {
        monthKey,
        label: new Intl.DateTimeFormat(undefined, {
          month: 'long',
          year: 'numeric',
          timeZone,
        }).format(date),
        items: [],
      };
      groups.push(group);
    }

    group.items.push(entry);
  }

  return groups;
}

/**
 * Upcoming agenda: one entry per event at its soonest upcoming occurrence,
 * grouped by month. `rest` carries the following occurrences so the row can
 * show when the event is otherwise scheduled (the full list lives in the modal).
 */
export function buildUpcomingAgenda(events: EventMetadata[], now = Date.now()): MonthGroup[] {
  const entries: AgendaEntry[] = [];

  for (const event of events) {
    const upcoming = event.occurrences
      .filter((occurrence) => occurrenceEnd(occurrence) >= now)
      .sort((a, b) => startTime(a) - startTime(b));

    if (upcoming.length === 0) continue;
    entries.push({ event, next: upcoming[0], rest: upcoming.slice(1) });
  }

  entries.sort((a, b) => startTime(a.next) - startTime(b.next));
  return monthGroup(entries, (entry) => entry.next);
}

/** Past disclosure: one entry per event at its most recent past occurrence. */
export function buildPastList(events: EventMetadata[], now = Date.now()): AgendaEntry[] {
  const entries: AgendaEntry[] = [];

  for (const event of events) {
    const past = event.occurrences
      .filter((occurrence) => occurrenceEnd(occurrence) < now)
      .sort((a, b) => startTime(b) - startTime(a));

    if (past.length === 0) continue;
    entries.push({ event, next: past[0], rest: [] });
  }

  entries.sort((a, b) => startTime(b.next) - startTime(a.next));
  return entries;
}

// ── Time / date formatting ─────────────────────────────────────────────────

export function formatSourceTime(startUtc: string, timezone: string): string {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(startUtc));
  const place = timezone.split('/').at(-1)?.replace(/_/g, ' ') ?? timezone;

  return `${time} ${place}`;
}

export function formatLocalTime(startUtc: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(startUtc));
}

export function formatEventDate(
  startUtc: string,
  timeZone?: string
): { month: string; day: string; weekday: string } {
  const date = new Date(startUtc);

  return {
    month: new Intl.DateTimeFormat(undefined, { month: 'short', timeZone }).format(date),
    day: new Intl.DateTimeFormat(undefined, { day: '2-digit', timeZone }).format(date),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone }).format(date),
  };
}

/** Short date for the "then scheduled" line, e.g. "13 Aug". */
export function formatShortDate(startUtc: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(new Date(startUtc));
}

/** Human-readable inclusive range for an occurrence whose stored end is exclusive. */
export function formatAllDayDateRange(
  occurrence: EventOccurrence,
  timeZone: string
): string {
  const start = new Date(occurrence.startUtc);
  if (!occurrence.endUtc) {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone,
    }).format(start);
  }

  const inclusiveEnd = new Date(new Date(occurrence.endUtc).getTime() - 1);
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  });

  return formatter.formatRange(start, inclusiveEnd);
}
