/**
 * NCAHero - Main Hero Component with Progressive Enhancement
 *
 * Displays the NCA animation with automatic fallbacks:
 * 1. prefers-reduced-motion: Static image only
 * 2. WebGL2 available: Full interactive NCA
 * 3. No WebGL2: Animated frame sequence
 * 4. Error/no JS: Static fallback image
 */

import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load heavy components
const NCACanvas = lazy(() => import('./NCACanvas'));
const NCAFallback = lazy(() => import('./NCAFallback'));

interface NCAHeroProps {
  /** Width of the NCA animation */
  width?: number;
  /** Height of the NCA animation */
  height?: number;
  /** URL to the static fallback image */
  staticImageUrl: string;
  /** Base URL for fallback frames */
  frameBaseUrl?: string;
  /** Number of fallback frames */
  frameCount?: number;
  /** URL to NCA weights JSON (for WebGL) */
  weightsUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

type RenderMode = 'static' | 'frames' | 'webgl';

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

function checkWebGL2Support(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;

    // Check for required extension
    const floatExt = gl.getExtension('EXT_color_buffer_float');
    return !!floatExt;
  } catch {
    return false;
  }
}

export function NCAHero({
  width = 256,
  height = 152,
  staticImageUrl,
  frameBaseUrl,
  frameCount = 120,
  weightsUrl,
  className,
  alt = 'ERA - Emerging Researchers in Artificial Life',
}: NCAHeroProps) {
  const reducedMotion = useReducedMotion();
  const [renderMode, setRenderMode] = useState<RenderMode>('static');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine render mode on mount
  useEffect(() => {
    if (reducedMotion) {
      setRenderMode('static');
      return;
    }

    if (checkWebGL2Support() && weightsUrl) {
      setRenderMode('webgl');
    } else if (frameBaseUrl) {
      setRenderMode('frames');
    } else {
      setRenderMode('static');
    }
  }, [reducedMotion, weightsUrl, frameBaseUrl]);

  // Handle WebGL errors by falling back to frames
  const handleWebGLError = () => {
    console.warn('WebGL error, falling back to frame animation');
    if (frameBaseUrl) {
      setRenderMode('frames');
    } else {
      setHasError(true);
      setRenderMode('static');
    }
  };

  // Handle frame animation errors
  const handleFrameError = () => {
    console.warn('Frame animation error, showing static image');
    setHasError(true);
    setRenderMode('static');
  };

  // Calculate responsive dimensions
  const aspectRatio = width / height;
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: `${width * 2}px`, // Allow 2x upscaling
    aspectRatio: `${aspectRatio}`,
    margin: '0 auto',
  };

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    imageRendering: 'auto', // Let browser smooth upscaling
  };

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div
      style={{
        ...containerStyle,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: '#999' }}>Loading...</span>
    </div>
  );

  return (
    <div className={className} style={containerStyle}>
      {/* Static image (always present as fallback/noscript) */}
      {(renderMode === 'static' || hasError) && (
        <img
          src={staticImageUrl}
          alt={alt}
          style={mediaStyle}
          loading="eager"
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* WebGL NCA */}
      {renderMode === 'webgl' && !hasError && (
        <Suspense fallback={<LoadingPlaceholder />}>
          <NCACanvas
            width={width}
            height={height}
            weightsUrl={weightsUrl}
            fireRate={0.5}
            stepsPerFrame={4}
            mouseRadius={20}
            onError={handleWebGLError}
            className="nca-canvas"
          />
        </Suspense>
      )}

      {/* Frame sequence fallback */}
      {renderMode === 'frames' && !hasError && frameBaseUrl && (
        <Suspense fallback={<LoadingPlaceholder />}>
          <NCAFallback
            frameBaseUrl={frameBaseUrl}
            frameCount={frameCount}
            format="avif"
            fallbackFormat="webp"
            fps={30}
            width={width}
            height={height}
            loop={true}
            autoplay={true}
            onError={handleFrameError}
            onLoad={() => setIsLoaded(true)}
          />
        </Suspense>
      )}

      {/* Accessibility: screen reader description */}
      <span className="sr-only">
        {alt}. An animated visualization showing the ERA logo growing through
        a neural cellular automata simulation.
        {reducedMotion && ' Animation paused due to reduced motion preference.'}
      </span>

      {/* Reduced motion indicator (optional) */}
      {reducedMotion && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            right: '0.5rem',
            fontSize: '0.75rem',
            color: '#666',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
          }}
          aria-hidden="true"
        >
          Motion reduced
        </div>
      )}
    </div>
  );
}

export default NCAHero;

// CSS to add to your stylesheet:
/*
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.nca-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
*/
