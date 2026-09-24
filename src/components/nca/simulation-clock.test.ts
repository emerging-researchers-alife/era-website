import { describe, expect, test } from 'bun:test';
import { SimulationClock } from './simulation-clock';

describe('simulation pacing', () => {
  test('advances equally on 30, 60, 120 and 144 Hz displays', () => {
    for (const refresh of [30, 60, 120, 144]) {
      const clock = new SimulationClock();
      let steps = 0;
      for (let frame = 0; frame <= refresh; frame++) steps += clock.next(frame * 1000 / refresh);
      expect(steps).toBe(61); // Initial tick, then one second of simulation.
    }
  });
  test('bounds catch-up after a long stall', () => {
    const clock = new SimulationClock();
    clock.next(0);
    expect(clock.next(10000)).toBe(3);
  });
  test('resuming starts fresh without replaying background time', () => {
    const clock = new SimulationClock();
    clock.next(0); clock.next(8);
    clock.reset();
    expect(clock.next(10000)).toBe(1);
    expect(clock.next(10008)).toBe(0);
  });
});
