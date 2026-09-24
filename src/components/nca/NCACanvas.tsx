import { useEffect, useRef, type PointerEvent } from 'react';
import { SimulationClock } from './simulation-clock';
import { createCA, type NCA, type LayerWeights } from './nca-ca';

interface NCACanvasProps {
  width?: number;
  height?: number;
  weights: string | LayerWeights[];
  /** Simulation steps per 60 Hz tick, independent of display refresh rate. */
  stepsPerFrame?: number;
  transparent?: boolean;
  paused?: boolean;
  /** Grow behind the poster before revealing a visible organism. */
  revealAfterSteps?: number;
  className?: string;
  onError?: (error: Error) => void;
  onReady?: () => void;
}

export function NCACanvas({ width = 96, height = 96, weights, stepsPerFrame = 1,
  transparent = false, paused = false, revealAfterSteps = 1, className, onError, onReady,
}: NCACanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caRef = useRef<NCA | null>(null);
  const syncRef = useRef<(() => void) | null>(null);
  const options = useRef({ paused, stepsPerFrame, revealAfterSteps, onError, onReady });
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    options.current = { paused, stepsPerFrame, revealAfterSteps, onError, onReady };
    syncRef.current?.();
  }, [paused, stepsPerFrame, revealAfterSteps, onError, onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    let ca: NCA | null = null;
    let gl: WebGLRenderingContext | null = null;
    let frame = 0;
    let visible = false;
    let failed = false;
    let ready = false;
    const clock = new SimulationClock();
    let steps = 0;

    const stop = () => { cancelAnimationFrame(frame); frame = 0; clock.reset(); };
    const fail = (error: unknown) => {
      if (failed || controller.signal.aborted) return;
      failed = true;
      stop();
      caRef.current = null;
      ca?.dispose();
      // Also release allocations from partially failed initialization.
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      options.current.onError?.(error instanceof Error ? error : new Error(String(error)));
    };
    const canRun = () => ca && visible && !document.hidden && !options.current.paused && !failed && !controller.signal.aborted;
    const animate = (time: number) => {
      frame = 0;
      if (!canRun() || !ca) return;
      try {
        const ticks = clock.next(time);
        for (let tick = 0; tick < ticks; tick++) {
          for (let i = 0; i < options.current.stepsPerFrame; i++) { ca.step(); steps++; }
        }
        if (ticks > 0) {
          ca.draw();
          if (!ready && steps >= options.current.revealAfterSteps) {
            ready = true;
            options.current.onReady?.();
          }
        }
        frame = requestAnimationFrame(animate);
      } catch (error) { fail(error); }
    };
    const sync = () => {
      if (!canRun()) stop();
      else if (!frame) frame = requestAnimationFrame(animate);
    };
    syncRef.current = sync;
    const observer = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; sync(); });
    observer.observe(canvas);
    const contextLost = (event: Event) => {
      event.preventDefault();
      fail(new Error('WebGL context lost'));
    };
    canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', sync);

    async function init() {
      try {
        gl = canvas!.getContext('webgl', { antialias: false, alpha: transparent });
        if (!gl) throw new Error('WebGL unavailable');
        let loadedWeights: LayerWeights[];
        if (typeof weights === 'string') {
          const response = await fetch(weights, { signal: controller.signal });
          if (!response.ok) throw new Error(`NCA weights: ${response.status}`);
          loadedWeights = await response.json();
        } else loadedWeights = weights;
        if (controller.signal.aborted) return;
        ca = createCA(gl, loadedWeights, [width, height]);
        ca.setTransparent(transparent);
        caRef.current = ca;
        sync();
      } catch (error) { fail(error); }
    }
    void init();
    return () => {
      controller.abort();
      stop();
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', sync);
      syncRef.current = null;
      caRef.current = null;
      ca?.dispose();
    };
  }, [width, height, weights, transparent]);

  const damage = (event: PointerEvent<HTMLCanvasElement>) => {
    if (options.current.paused || !caRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    caRef.current.paint((event.clientX - rect.left) * width / rect.width,
      (event.clientY - rect.top) * height / rect.height, 5, 'clear');
  };
  return <canvas ref={canvasRef} width={width} height={height} className={className} aria-hidden="true"
    onPointerDown={event => {
      if (!event.isPrimary) { pointer.current = null; return; }
      pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      if (event.pointerType === 'mouse' && event.button === 0) damage(event);
    }}
    onPointerMove={event => {
      const start = pointer.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) pointer.current = null;
      if (event.pointerType === 'mouse' && event.buttons === 1) damage(event);
    }}
    onPointerUp={event => {
      if (event.pointerType !== 'mouse' && pointer.current?.id === event.pointerId) damage(event);
      pointer.current = null;
    }}
    onPointerCancel={() => { pointer.current = null; }}
    onDoubleClick={() => { if (!options.current.paused) caRef.current?.reset(); }}
    style={{ imageRendering: 'pixelated', touchAction: 'pan-y pinch-zoom' }} />;
}
export default NCACanvas;
