/**
 * Frontmatter validation for ERA articles and events.
 */

import { DateTime } from 'luxon';
import { RRule } from 'rrule';
import type { ArticleFrontmatter, Author, ArticleStatus } from '../../src/content/types';
import type {
  EventFrontmatter,
  EventLocationType,
  EventStatus,
} from '../../src/content/events.types';

interface ValidationError {
  field: string;
  message: string;
}

const VALID_STATUSES: ArticleStatus[] = ['draft', 'published', 'peer-reviewed'];
const VALID_EVENT_STATUSES: EventStatus[] = ['draft', 'published'];
const VALID_EVENT_LOCATION_TYPES: EventLocationType[] = [
  'discord',
  'online',
  'conference',
  'in-person',
  'hybrid',
];
const WALL_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateWallTime(
  value: unknown,
  field: string,
  errors: ValidationError[],
  required = false
) {
  if (value === undefined) {
    if (required) {
      errors.push({ field, message: 'required string (YYYY-MM-DDTHH:mm)' });
    }
    return;
  }

  if (typeof value !== 'string' || !WALL_TIME_REGEX.test(value)) {
    errors.push({ field, message: 'must be YYYY-MM-DDTHH:mm with no offset or Z' });
  }
}

function normalizeRRule(value: string): string {
  return value.startsWith('RRULE:') ? value : `RRULE:${value}`;
}

/**
 * Validates article frontmatter and returns typed data.
 * Throws an error with detailed messages if validation fails.
 */
export function validateFrontmatter(
  data: unknown,
  filename: string
): ArticleFrontmatter {
  const errors: ValidationError[] = [];
  const d = data as Record<string, unknown>;

  // Required: title
  if (!d.title || typeof d.title !== 'string') {
    errors.push({ field: 'title', message: 'required string' });
  }

  // Required: date (YYYY-MM-DD format)
  if (!d.date || typeof d.date !== 'string') {
    errors.push({ field: 'date', message: 'required string (YYYY-MM-DD)' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
    errors.push({ field: 'date', message: 'must be YYYY-MM-DD format' });
  } else {
    const date = new Date(d.date);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'date', message: 'invalid date' });
    }
  }

  // Required: authors (non-empty array)
  if (!Array.isArray(d.authors) || d.authors.length === 0) {
    errors.push({ field: 'authors', message: 'required non-empty array' });
  } else {
    (d.authors as unknown[]).forEach((author, i) => {
      const a = author as Record<string, unknown>;
      if (!a.name || typeof a.name !== 'string') {
        errors.push({ field: `authors[${i}].name`, message: 'required string' });
      }
    });
  }

  // Required: tags (non-empty array)
  if (!Array.isArray(d.tags) || d.tags.length === 0) {
    errors.push({ field: 'tags', message: 'required non-empty array' });
  } else {
    (d.tags as unknown[]).forEach((tag, i) => {
      if (typeof tag !== 'string') {
        errors.push({ field: `tags[${i}]`, message: 'must be a string' });
      }
    });
  }

  // Required: abstract
  if (!d.abstract || typeof d.abstract !== 'string') {
    errors.push({ field: 'abstract', message: 'required string' });
  }

  // Optional: status (must be valid if provided)
  if (d.status !== undefined) {
    if (!VALID_STATUSES.includes(d.status as ArticleStatus)) {
      errors.push({
        field: 'status',
        message: `must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }
  }

  // Optional: featured (must be boolean if provided)
  if (d.featured !== undefined && typeof d.featured !== 'boolean') {
    errors.push({ field: 'featured', message: 'must be a boolean' });
  }

  // Optional: lastUpdated (must be valid date format if provided)
  if (d.lastUpdated !== undefined) {
    if (typeof d.lastUpdated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.lastUpdated)) {
      errors.push({ field: 'lastUpdated', message: 'must be YYYY-MM-DD format' });
    }
  }

  // Throw if any errors
  if (errors.length > 0) {
    const msg = errors.map((e) => `  - ${e.field}: ${e.message}`).join('\n');
    throw new Error(`Validation failed for ${filename}:\n${msg}`);
  }

  // Return typed frontmatter with defaults
  return {
    title: d.title as string,
    date: d.date as string,
    authors: d.authors as Author[],
    tags: d.tags as string[],
    abstract: d.abstract as string,
    subtitle: d.subtitle as string | undefined,
    status: (d.status as ArticleStatus) ?? 'draft',
    featured: (d.featured as boolean) ?? false,
    thumbnail: d.thumbnail as string | undefined,
    bibliography: d.bibliography as string | undefined,
    doi: d.doi as string | undefined,
    lastUpdated: d.lastUpdated as string | undefined,
  };
}

/**
 * Validates event frontmatter and returns typed data.
 * Throws an error with detailed messages if validation fails.
 */
export function validateEventFrontmatter(
  data: unknown,
  filename: string
): EventFrontmatter {
  const errors: ValidationError[] = [];
  const d = data as Record<string, unknown>;

  if (!d.title || typeof d.title !== 'string') {
    errors.push({ field: 'title', message: 'required string' });
  }

  if (!d.summary || typeof d.summary !== 'string') {
    errors.push({ field: 'summary', message: 'required string' });
  }

  validateWallTime(d.start, 'start', errors, true);
  validateWallTime(d.end, 'end', errors);

  if (!d.timezone || typeof d.timezone !== 'string') {
    errors.push({ field: 'timezone', message: 'required IANA timezone string' });
  } else if (!DateTime.local().setZone(d.timezone).isValid) {
    errors.push({ field: 'timezone', message: 'must be a valid IANA timezone' });
  }

  if (d.end !== undefined && d.durationMinutes !== undefined) {
    errors.push({ field: 'durationMinutes', message: 'cannot be used with end' });
  }

  if (d.durationMinutes !== undefined) {
    if (
      typeof d.durationMinutes !== 'number' ||
      !Number.isInteger(d.durationMinutes) ||
      d.durationMinutes <= 0
    ) {
      errors.push({ field: 'durationMinutes', message: 'must be a positive integer' });
    }
  }

  if (
    typeof d.start === 'string' &&
    WALL_TIME_REGEX.test(d.start) &&
    typeof d.end === 'string' &&
    WALL_TIME_REGEX.test(d.end) &&
    typeof d.timezone === 'string' &&
    DateTime.local().setZone(d.timezone).isValid
  ) {
    const start = DateTime.fromISO(d.start, { zone: d.timezone });
    const end = DateTime.fromISO(d.end, { zone: d.timezone });
    if (!end.isValid || end <= start) {
      errors.push({ field: 'end', message: 'must be after start' });
    }
  }

  if (d.recurrence !== undefined) {
    if (typeof d.recurrence !== 'string') {
      errors.push({ field: 'recurrence', message: 'must be an RRULE string' });
    } else {
      try {
        RRule.fromString(normalizeRRule(d.recurrence));
      } catch {
        errors.push({ field: 'recurrence', message: 'must be a valid RRULE string' });
      }
    }
  }

  for (const field of ['exdates', 'rdates'] as const) {
    if (d[field] !== undefined) {
      if (!Array.isArray(d[field])) {
        errors.push({ field, message: 'must be an array of YYYY-MM-DDTHH:mm strings' });
      } else {
        (d[field] as unknown[]).forEach((value, i) => {
          validateWallTime(value, `${field}[${i}]`, errors);
        });
      }
    }
  }

  if (!d.location || typeof d.location !== 'object') {
    errors.push({ field: 'location', message: 'required object' });
  } else {
    const location = d.location as Record<string, unknown>;
    if (!VALID_EVENT_LOCATION_TYPES.includes(location.type as EventLocationType)) {
      errors.push({
        field: 'location.type',
        message: `must be one of: ${VALID_EVENT_LOCATION_TYPES.join(', ')}`,
      });
    }
    if (!location.label || typeof location.label !== 'string') {
      errors.push({ field: 'location.label', message: 'required string' });
    }
    if (location.url !== undefined) {
      if (typeof location.url !== 'string' || !isValidUrl(location.url)) {
        errors.push({ field: 'location.url', message: 'must be a valid URL' });
      }
    }
  }

  if (d.activities !== undefined) {
    if (!Array.isArray(d.activities)) {
      errors.push({ field: 'activities', message: 'must be a string array' });
    } else {
      (d.activities as unknown[]).forEach((activity, i) => {
        if (typeof activity !== 'string') {
          errors.push({ field: `activities[${i}]`, message: 'must be a string' });
        }
      });
    }
  }

  if (d.registrationUrl !== undefined) {
    if (typeof d.registrationUrl !== 'string' || !isValidUrl(d.registrationUrl)) {
      errors.push({ field: 'registrationUrl', message: 'must be a valid URL' });
    }
  }

  if (d.tags !== undefined) {
    if (!Array.isArray(d.tags)) {
      errors.push({ field: 'tags', message: 'must be a string array' });
    } else {
      (d.tags as unknown[]).forEach((tag, i) => {
        if (typeof tag !== 'string') {
          errors.push({ field: `tags[${i}]`, message: 'must be a string' });
        }
      });
    }
  }

  if (d.featured !== undefined && typeof d.featured !== 'boolean') {
    errors.push({ field: 'featured', message: 'must be a boolean' });
  }

  if (d.status !== undefined && !VALID_EVENT_STATUSES.includes(d.status as EventStatus)) {
    errors.push({
      field: 'status',
      message: `must be one of: ${VALID_EVENT_STATUSES.join(', ')}`,
    });
  }

  if (errors.length > 0) {
    const msg = errors.map((e) => `  - ${e.field}: ${e.message}`).join('\n');
    throw new Error(`Validation failed for ${filename}:\n${msg}`);
  }

  const location = d.location as EventFrontmatter['location'];

  return {
    title: d.title as string,
    summary: d.summary as string,
    start: d.start as string,
    end: d.end as string | undefined,
    durationMinutes: d.durationMinutes as number | undefined,
    timezone: d.timezone as string,
    recurrence: d.recurrence as string | undefined,
    exdates: d.exdates as string[] | undefined,
    rdates: d.rdates as string[] | undefined,
    location,
    activities: d.activities as string[] | undefined,
    registrationUrl: d.registrationUrl as string | undefined,
    tags: (d.tags as string[] | undefined) ?? [],
    featured: (d.featured as boolean) ?? false,
    status: (d.status as EventStatus) ?? 'draft',
  };
}
