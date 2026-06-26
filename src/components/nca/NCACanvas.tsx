/**
 * NCACanvas - WebGL Neural Cellular Automata React Component
 *
 * Uses the ported Google Growing NCA implementation for real-time
 * NCA simulation with mouse/touch interaction.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { createCA, type NCA, type LayerWeights } from './nca-ca';

interface NCACanvasProps {
  width?: number;
  height?: number;
  /** URL to fetch weights from, or direct weights array */
  weights: string | LayerWeights[];
  stepsPerFrame?: number;
  transparent?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onReady?: () => void;
}

export function NCACanvas({
  width = 96,
  height = 96,
  weights,
  stepsPerFrame = 1,
  transparent = false,
  className,
  onError,
  onReady,
}: NCACanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caRef = useRef<NCA | null>(null);
  const animationRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize WebGL and NCA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;

    async function init() {
      try {
        // Get WebGL context
        const gl = canvas.getContext('webgl', {
          antialias: false,
          preserveDrawingBuffer: false,
          alpha: transparent, // Enable canvas alpha for transparency
        });

        if (!gl) {
          throw new Error('WebGL not supported');
        }

        // Load weights - either from URL or use directly
        let loadedWeights: LayerWeights[];
        if (typeof weights === 'string') {
          const response = await fetch(weights);
          if (!response.ok) {
            throw new Error(`Failed to load weights: ${response.statusText}`);
          }
          loadedWeights = await response.json();
        } else {
          loadedWeights = weights;
        }

        if (!mounted) return;

        // Create NCA
        const ca = createCA(gl, loadedWeights, [width, height]);

        // Enable transparent rendering if requested
        if (transparent) {
          ca.setTransparent(true);
        }

        caRef.current = ca;

        setIsReady(true);
        onReady?.();
      } catch (error) {
        if (!mounted) return;
        console.error('NCA initialization error:', error);
        onError?.(error as Error);
      }
    }

    init();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, weights, transparent, onError, onReady]);

  // Pause animation when off-screen to save CPU/GPU
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Animation loop - only runs when visible
  useEffect(() => {
    if (!isReady || !caRef.current || !isVisible) return;

    const ca = caRef.current;

    const animate = () => {
      for (let i = 0; i < stepsPerFrame; i++) {
        ca.step();
      }
      ca.draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isReady, isVisible, stepsPerFrame]);

  // Mouse/touch interaction - paint to disturb
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      // Don't flip Y - shader handles coordinate transform
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [width, height]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!caRef.current || e.buttons !== 1) return; // Only when mouse button pressed
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      caRef.current.paint(x, y, 5, 'clear'); // Clear/damage at cursor
    },
    [getCanvasCoords]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!caRef.current) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      caRef.current.paint(x, y, 5, 'clear');
    },
    [getCanvasCoords]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!caRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
      caRef.current.paint(x, y, 5, 'clear');
    },
    [getCanvasCoords]
  );

  const handleDoubleClick = useCallback(() => {
    if (!caRef.current) return;
    caRef.current.reset();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleClick}
      style={{
        imageRendering: 'pixelated',
        touchAction: 'none',
      }}
    />
  );
}

export default NCACanvas;
