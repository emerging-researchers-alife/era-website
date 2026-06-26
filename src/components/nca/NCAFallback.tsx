/**
 * NCAFallback - Frame Sequence Player
 *
 * Plays pre-rendered NCA frames when WebGL is not available.
 * Supports AVIF with WebP/PNG fallback.
 * Progressively loads frames for smooth playback.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface NCAFallbackProps {
  /** Base URL for frames (e.g., '/nca/frames/frame_') */
  frameBaseUrl: string;
  /** Number of frames in sequence */
  frameCount: number;
  /** Frame format (avif, webp, png) */
  format?: 'avif' | 'webp' | 'png';
  /** Fallback format if primary not supported */
  fallbackFormat?: 'webp' | 'png';
  /** Frames per second */
  fps?: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Whether to loop animation */
  loop?: boolean;
  /** Whether to autoplay */
  autoplay?: boolean;
  /** CSS class name */
  className?: string;
  /** Callback when all frames are loaded */
  onLoad?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

type LoadState = 'loading' | 'ready' | 'error';

function checkFormatSupport(format: string): Promise<boolean> {
  return new Promise((resolve) => {
    const testImages: Record<string, string> = {
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIyEAAAEAAJGIwAC4GA',
      webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    };

    if (!testImages[format]) {
      resolve(true); // PNG always supported
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = testImages[format];
  });
}

export function NCAFallback({
  frameBaseUrl,
  frameCount,
  format = 'avif',
  fallbackFormat = 'webp',
  fps = 30,
  width,
  height,
  loop = true,
  autoplay = true,
  className,
  onLoad,
  onError,
}: NCAFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const animationRef = useRef<number>(0);
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadedCount, setLoadedCount] = useState(0);
  const [activeFormat, setActiveFormat] = useState<string>(format);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // Determine supported format
  useEffect(() => {
    async function detectFormat() {
      if (await checkFormatSupport(format)) {
        setActiveFormat(format);
      } else if (fallbackFormat && (await checkFormatSupport(fallbackFormat))) {
        setActiveFormat(fallbackFormat);
      } else {
        setActiveFormat('png');
      }
    }
    detectFormat();
  }, [format, fallbackFormat]);

  // Load frames
  useEffect(() => {
    if (!activeFormat) return;

    const frames: HTMLImageElement[] = [];
    let loaded = 0;
    let hasError = false;

    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load frame ${index}`));

        // Format: frame_000.avif, frame_001.avif, etc.
        const paddedIndex = String(index).padStart(3, '0');
        img.src = `${frameBaseUrl}${paddedIndex}.${activeFormat}`;
      });
    };

    // Load frames progressively
    const loadAllFrames = async () => {
      // Load first few frames quickly for fast start
      const priorityCount = Math.min(10, frameCount);

      try {
        // Priority load
        for (let i = 0; i < priorityCount; i++) {
          const img = await loadFrame(i);
          frames[i] = img;
          loaded++;
          setLoadedCount(loaded);
        }

        // Can start playing now
        framesRef.current = frames;
        setLoadState('ready');

        // Load remaining frames
        const remaining = [];
        for (let i = priorityCount; i < frameCount; i++) {
          remaining.push(
            loadFrame(i).then((img) => {
              frames[i] = img;
              loaded++;
              setLoadedCount(loaded);
              framesRef.current = [...frames];
            })
          );
        }

        await Promise.all(remaining);
        onLoad?.();
      } catch (error) {
        if (!hasError) {
          hasError = true;
          setLoadState('error');
          onError?.(error as Error);
        }
      }
    };

    loadAllFrames();

    return () => {
      hasError = true; // Prevent further updates
    };
  }, [activeFormat, frameBaseUrl, frameCount, onLoad, onError]);

  // Animation loop
  useEffect(() => {
    if (loadState !== 'ready' || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const frameDuration = 1000 / fps;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameDuration);

        const frames = framesRef.current;
        const maxIndex = Math.min(frameIndexRef.current + 1, frames.length - 1);

        // Only advance if frame is loaded
        if (frames[frameIndexRef.current]) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(frames[frameIndexRef.current], 0, 0, width, height);
        }

        frameIndexRef.current++;

        // Handle loop or stop
        if (frameIndexRef.current >= frames.length) {
          if (loop) {
            frameIndexRef.current = 0;
          } else {
            setIsPlaying(false);
            return;
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [loadState, isPlaying, fps, width, height, loop]);

  // Draw first frame when ready
  useEffect(() => {
    if (loadState !== 'ready') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const firstFrame = framesRef.current[0];

    if (canvas && ctx && firstFrame && !isPlaying) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(firstFrame, 0, 0, width, height);
    }
  }, [loadState, isPlaying, width, height]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const restart = useCallback(() => {
    frameIndexRef.current = 0;
    setIsPlaying(true);
  }, []);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />

      {/* Loading overlay */}
      {loadState === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div>Loading...</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {loadedCount} / {frameCount} frames
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {loadState === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#c00',
          }}
        >
          Failed to load animation
        </div>
      )}
    </div>
  );
}

export default NCAFallback;
