/**
 * NCADemo - Interactive NCA component for articles
 *
 * Wraps NCACanvas with caption, attribution, and graceful fallback.
 * Used by the :::nca directive in article markdown.
 */

import { useState, useEffect } from 'react';
import { NCACanvas } from '../nca';
import type { LayerWeights } from '../nca/nca-ca';

// Import available weights
import lizardWeights from '../../assets/nca/lizard.json';

// Map of available weight names to their data
const WEIGHTS_MAP: Record<string, LayerWeights[]> = {
  lizard: lizardWeights as LayerWeights[],
};

export interface NCADemoConfig {
  weights: string;
  width: number;
  height: number;
  caption?: string;
}

interface NCADemoProps {
  config: NCADemoConfig;
  className?: string;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl');
  } catch {
    return false;
  }
}

export function NCADemo({ config, className }: NCADemoProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
  }, []);

  const weights = WEIGHTS_MAP[config.weights];

  if (!weights) {
    return (
      <div className={`nca-demo ${className || ''}`}>
        <div className="nca-demo-error">
          Unknown NCA weights: "{config.weights}"
        </div>
      </div>
    );
  }

  const handleError = (error: Error) => {
    console.error('NCA error:', error);
    setHasError(true);
  };

  // Fallback for no WebGL or error
  if (!hasWebGL || hasError) {
    return (
      <figure className={`nca-demo nca-demo-fallback ${className || ''}`}>
        <div className="nca-demo-fallback-content">
          <p>
            Interactive demo requires WebGL.{' '}
            <a
              href="https://distill.pub/2020/growing-ca/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the original on Distill →
            </a>
          </p>
        </div>
        {config.caption && (
          <figcaption className="nca-demo-caption">{config.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`nca-demo ${className || ''}`}>
      <div className="nca-demo-canvas-wrapper">
        <NCACanvas
          width={config.width}
          height={config.height}
          weights={weights}
          stepsPerFrame={1}
          transparent
          className="nca-demo-canvas"
          onError={handleError}
        />
        <div className="nca-demo-hint">Click to damage • Double-click to reset</div>
      </div>
      {config.caption && (
        <figcaption className="nca-demo-caption">{config.caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * Parse NCA config from a DOM element's data attribute
 */
export function parseNCAData(element: HTMLElement): NCADemoConfig | null {
  const dataAttr = element.getAttribute('data-nca');
  if (!dataAttr) return null;

  try {
    return JSON.parse(dataAttr);
  } catch (err) {
    console.error('Failed to parse NCA data:', err);
    return null;
  }
}

export default NCADemo;
