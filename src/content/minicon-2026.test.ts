import { describe, expect, test } from 'bun:test';
import {
  MINICON_PROMOTION_END,
  MINICON_TIMEZONE,
  formatScheduleRange,
  isMiniconPromotionActive,
  miniconSchedule,
  miniconSpeakers,
} from './minicon-2026';

describe('ERA Minicon 2026 content', () => {
  test('keeps the full published schedule and speaker list', () => {
    expect(miniconSchedule).toHaveLength(11);
    expect(miniconSpeakers.map((speaker) => speaker.name)).toEqual([
      'Lana Sinapayen',
      'Alyssa Adams',
      'Bert Chan',
      'Michael Levin',
      'Susan Stepney',
      'Eyvind Niklasson',
    ]);
    expect(miniconSchedule[0].start).toBe('2026-08-16T13:00:00Z');
    expect(miniconSchedule.at(-1)?.end).toBe('2026-08-16T21:15:00Z');
    expect(miniconSchedule.filter((session) => session.notes)).toHaveLength(7);
    expect(miniconSchedule.every((session, index) =>
      index === 0 || miniconSchedule[index - 1].end === session.start
    )).toBe(true);
    expect(miniconSpeakers.every((speaker) =>
      speaker.affiliation.some((part) => part.href?.startsWith('https://'))
    )).toBe(true);
    expect(miniconSpeakers.every((speaker) =>
      speaker.background.trim().split(/\s+/).length <= 18
    )).toBe(true);
  });

  test('expires the homepage promotion at midnight after the event in Waterloo', () => {
    const expiry = Date.parse(MINICON_PROMOTION_END);

    expect(isMiniconPromotionActive(expiry - 1)).toBe(true);
    expect(isMiniconPromotionActive(expiry)).toBe(false);
  });

  test('formats Waterloo and Tokyo programme times with the next-day marker', () => {
    expect(formatScheduleRange(miniconSchedule[0], MINICON_TIMEZONE)).toBe('09:00 - 09:30');
    expect(formatScheduleRange(miniconSchedule[0], 'Asia/Tokyo')).toBe('22:00 - 22:30');
    expect(formatScheduleRange(miniconSchedule[2], 'Asia/Tokyo')).toBe('23:15 - 23:45');
    expect(formatScheduleRange(miniconSchedule[3], 'Asia/Tokyo')).toBe('23:45 - 00:45 (+1 day)');
    expect(formatScheduleRange(miniconSchedule[4], 'Asia/Tokyo')).toBe('00:45 - 01:30 (+1 day)');
  });
});
