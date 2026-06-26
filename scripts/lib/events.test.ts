import { describe, expect, test } from 'bun:test';
import { expandOccurrences } from './events';
import { validateEventFrontmatter } from './validators';
import type { EventFrontmatter } from '../../src/content/events.types';

const baseEvent: EventFrontmatter = {
  title: 'Monthly Townhall',
  summary: 'Monthly community gathering.',
  start: '2026-03-12T18:00',
  durationMinutes: 60,
  timezone: 'Europe/Oslo',
  recurrence: 'FREQ=MONTHLY;BYDAY=2TH',
  location: {
    type: 'discord',
    label: 'Discord Server',
  },
  tags: [],
  featured: false,
  status: 'published',
};

describe('expandOccurrences', () => {
  test('expands second Thursday monthly events across Oslo DST transitions', () => {
    const occurrences = expandOccurrences(baseEvent, {
      start: new Date('2026-03-01T00:00:00Z'),
      end: new Date('2026-11-30T23:59:59Z'),
    });

    const starts = occurrences.map((occurrence) => occurrence.startUtc);

    expect(starts).toContain('2026-03-12T17:00:00Z');
    expect(starts).toContain('2026-04-09T16:00:00Z');
    expect(starts).toContain('2026-11-12T17:00:00Z');
  });

  test('removes exdates from recurring events', () => {
    const occurrences = expandOccurrences(
      {
        ...baseEvent,
        exdates: ['2026-04-09T18:00'],
      },
      {
        start: new Date('2026-03-01T00:00:00Z'),
        end: new Date('2026-05-31T23:59:59Z'),
      }
    );

    expect(occurrences.map((occurrence) => occurrence.startUtc)).toEqual([
      '2026-03-12T17:00:00Z',
      '2026-05-14T16:00:00Z',
    ]);
  });

  test('creates a single occurrence for one-off events', () => {
    const occurrences = expandOccurrences({
      title: 'Workshop',
      summary: 'A one-off workshop.',
      start: '2026-07-15T09:30',
      durationMinutes: 90,
      timezone: 'America/New_York',
      location: {
        type: 'online',
        label: 'Online',
      },
      tags: [],
      featured: false,
      status: 'published',
    });

    expect(occurrences).toEqual([
      {
        startUtc: '2026-07-15T13:30:00Z',
        endUtc: '2026-07-15T15:00:00Z',
      },
    ]);
  });
});

describe('validateEventFrontmatter', () => {
  test('rejects bad timezones', () => {
    expect(() =>
      validateEventFrontmatter(
        {
          ...baseEvent,
          timezone: 'Not/AZone',
        },
        'bad-timezone.md'
      )
    ).toThrow('timezone');
  });

  test('rejects bad RRULE strings', () => {
    expect(() =>
      validateEventFrontmatter(
        {
          ...baseEvent,
          recurrence: 'FREQ=NOPE',
        },
        'bad-rrule.md'
      )
    ).toThrow('recurrence');
  });
});
