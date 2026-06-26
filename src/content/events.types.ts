/**
 * TypeScript interfaces for the ERA event system.
 *
 * Event content uses wall-clock local time plus an IANA timezone as canonical
 * source data. UTC instants are generated at build time as a cache for the UI.
 */

export type EventLocationType = 'discord' | 'online' | 'conference' | 'in-person' | 'hybrid';

export type EventStatus = 'draft' | 'published';

export interface EventLocation {
  type: EventLocationType;
  label: string;
  url?: string;
}

export interface EventFrontmatter {
  title: string;
  summary: string;
  start: string;
  end?: string;
  durationMinutes?: number;
  timezone: string;
  recurrence?: string;
  exdates?: string[];
  rdates?: string[];
  location: EventLocation;
  activities?: string[];
  registrationUrl?: string;
  tags?: string[];
  featured?: boolean;
  status?: EventStatus;
}

export interface EventOccurrence {
  startUtc: string;
  endUtc?: string;
}

export interface EventMetadata extends EventFrontmatter {
  slug: string;
  occurrences: EventOccurrence[];
  /** Human-readable recurrence summary, generated at build via rrule.toText(). */
  recurrenceText?: string;
}

export interface Event extends EventMetadata {
  content: string;
}

export const KNOWN_EVENT_TYPES = {
  locationTypes: ['discord', 'online', 'conference', 'in-person', 'hybrid'] as const,
  statuses: ['draft', 'published'] as const,
  tags: [
    'townhall',
    'workshop',
    'conference',
    'networking',
    'community',
    'journal-club',
    'social',
    'talks',
    'education',
  ] as const,
} as const;
