/**
 * NCADemo - Interactive NCA component for articles
 *
 * Wraps NCACanvas with caption, attribution, and graceful fallback.
 * Used by the :::nca directive in article markdown.
 */

import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import poster from '../../assets/nca/lizard-poster.png';
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

export function NCADemo({ config, className }: NCADemoProps) {
  const reducedMotion = useReducedMotion();
  const [hasError, setHasError] = useState(false);
  const [paused, setPaused] = useState(false);

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

  return (
    <figure className={`nca-demo ${className || ''}`}>
      <div className="nca-demo-canvas-wrapper">
        {hasError || reducedMotion ? <img src={poster} width="96" height="96"
          className="nca-demo-canvas" alt="A lizard grown by a neural cellular automaton" /> : <NCACanvas
          width={config.width}
          height={config.height}
          weights={weights}
          stepsPerFrame={1}
          transparent
          className="nca-demo-canvas"
          onError={handleError}
          paused={paused}
        />}
        {!hasError && !reducedMotion && <>
          <div className="nca-demo-hint">Click or tap to damage · Double-click to reset</div>
          <button type="button" className="nca-pause" onClick={() => setPaused(value => !value)}>
            {paused ? 'Resume animation' : 'Pause animation'}
          </button>
        </>}
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
