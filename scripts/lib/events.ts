import { DateTime } from 'luxon';
import { RRule } from 'rrule';
import type { EventFrontmatter, EventOccurrence } from '../../src/content/events.types';

const DEFAULT_PAST_MONTHS = 6;
const DEFAULT_FUTURE_MONTHS = 12;

export interface OccurrenceWindow {
  start: Date;
  end: Date;
}

interface WallParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function parseWallTime(value: string): WallParts {
  const [datePart, timePart] = value.split('T') as [string, string];
  const [year, month, day] = datePart.split('-').map(Number) as [number, number, number];
  const [hour, minute] = timePart.split(':').map(Number) as [number, number];

  return { year, month, day, hour, minute };
}

function wallKey(parts: WallParts): string {
  return [
    String(parts.year).padStart(4, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-') + `T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function dateToWallParts(date: Date): WallParts {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

function floatingDate(parts: WallParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute));
}

function instantToFloatingWall(date: Date, timezone: string): Date {
  const zoned = DateTime.fromJSDate(date).setZone(timezone);
  return floatingDate({
    year: zoned.year,
    month: zoned.month,
    day: zoned.day,
    hour: zoned.hour,
    minute: zoned.minute,
  });
}

function wallToDateTime(value: string, timezone: string): DateTime {
  const parts = parseWallTime(value);
  return DateTime.fromObject(parts, { zone: timezone });
}

function normalizeRRule(value: string): string {
  return value.startsWith('RRULE:') ? value.slice('RRULE:'.length) : value;
}

/**
 * Human-readable recurrence summary (e.g. "Monthly on the 2nd Thursday"),
 * generated at build time so the client never ships the rrule text engine.
 * Handles any RRULE the validator accepts (INTERVAL, BYSETPOS, multi-day, …).
 */
export function describeRecurrence(recurrence: string | undefined): string | undefined {
  if (!recurrence) return undefined;
  try {
    const text = RRule.fromString(normalizeRRule(recurrence)).toText();
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch {
    return undefined;
  }
}

function defaultWindow(): OccurrenceWindow {
  const now = DateTime.now();
  return {
    start: now.minus({ months: DEFAULT_PAST_MONTHS }).toJSDate(),
    end: now.plus({ months: DEFAULT_FUTURE_MONTHS }).toJSDate(),
  };
}

function getDurationMinutes(frontmatter: EventFrontmatter): number | undefined {
  if (frontmatter.durationMinutes !== undefined) {
    return frontmatter.durationMinutes;
  }

  if (!frontmatter.end) {
    return undefined;
  }

  const start = wallToDateTime(frontmatter.start, frontmatter.timezone);
  const end = wallToDateTime(frontmatter.end, frontmatter.timezone);
  return Math.round(end.diff(start, 'minutes').minutes);
}

function occurrenceFromWall(
  wallStart: string,
  frontmatter: EventFrontmatter,
  durationMinutes: number | undefined
): EventOccurrence {
  const start = wallToDateTime(wallStart, frontmatter.timezone);
  const occurrence: EventOccurrence = {
    startUtc: start.toUTC().toISO({ suppressMilliseconds: true }) ?? start.toUTC().toISO()!,
  };

  if (durationMinutes !== undefined) {
    const end = start.plus({ minutes: durationMinutes });
    occurrence.endUtc = end.toUTC().toISO({ suppressMilliseconds: true }) ?? end.toUTC().toISO()!;
  }

  return occurrence;
}

/**
 * Expand an event into UTC occurrence cache entries.
 *
 * RRULE is used only to enumerate calendar fields in the event's local wall time.
 * Each returned floating date is then interpreted with Luxon in the source IANA
 * timezone to derive true UTC instants.
 */
export function expandOccurrences(
  frontmatter: EventFrontmatter,
  window: OccurrenceWindow = defaultWindow()
): EventOccurrence[] {
  const startParts = parseWallTime(frontmatter.start);
  const durationMinutes = getDurationMinutes(frontmatter);
  const exdates = new Set(frontmatter.exdates ?? []);
  const wallStarts = new Map<string, string>();

  if (frontmatter.recurrence) {
    const options = RRule.parseString(normalizeRRule(frontmatter.recurrence));
    const rule = new RRule({
      ...options,
      dtstart: floatingDate(startParts),
    });

    const floatingStart = instantToFloatingWall(window.start, frontmatter.timezone);
    const floatingEnd = instantToFloatingWall(window.end, frontmatter.timezone);

    for (const date of rule.between(floatingStart, floatingEnd, true)) {
      const key = wallKey(dateToWallParts(date));
      wallStarts.set(key, key);
    }
  } else {
    const key = wallKey(startParts);
    wallStarts.set(key, key);
  }

  for (const rdate of frontmatter.rdates ?? []) {
    wallStarts.set(rdate, rdate);
  }

  for (const exdate of exdates) {
    wallStarts.delete(exdate);
  }

  return [...wallStarts.values()]
    .map((wallStart) => occurrenceFromWall(wallStart, frontmatter, durationMinutes))
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());
}
