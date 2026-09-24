/** Fixed 60 Hz simulation clock with bounded catch-up after a slow frame. */
export class SimulationClock {
  private lastTime: number | null = null;
  private remainder = 0;
  next(time: number): number {
    const tick = 1000 / 60;
    this.remainder += this.lastTime === null ? tick : Math.max(0, Math.min(time - this.lastTime, 50));
    this.lastTime = time;
    const steps = Math.floor((this.remainder + 1e-7) / tick);
    this.remainder = Math.max(0, this.remainder - steps * tick);
    return steps;
  }
  reset(): void { this.lastTime = null; this.remainder = 0; }
}
