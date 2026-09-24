import { useEffect, useState, type ComponentType } from 'react';
import poster from '../../assets/nca/lizard-poster.png';
import type { LiveLizardProps } from './LiveLizard';

/** The poster is the default. Simulation failure never removes the illustration. */
export function NCAHero() {
  const [LiveLizard, setLiveLizard] = useState<ComponentType<LiveLizardProps> | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(preference.matches); setReady(false); };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion || failed) return;
    let cancelled = false;
    // Let the text and poster paint before fetching and compiling the simulation.
    const timer = window.setTimeout(() => {
      import('./LiveLizard').then(module => {
        if (!cancelled) setLiveLizard(() => module.default);
      }).catch(() => { if (!cancelled) setFailed(true); });
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reducedMotion, failed]);

  const live = ready && !failed && !reducedMotion;
  return <div className="nca-hero-wrapper">
    <div className="nca-illustration" role="img" aria-label="A lizard grown by a neural cellular automaton, an example of artificial life">
      <img src={poster} width="96" height="96" alt="" fetchPriority="high"
        className={`nca-poster${live ? ' nca-poster-hidden' : ''}`} />
      {!reducedMotion && !failed && LiveLizard && <div className={`nca-live${live ? ' nca-live-ready' : ''}`}>
        <LiveLizard paused={paused} onReady={() => setReady(true)} onError={() => { setFailed(true); setReady(false); }} />
      </div>}
    </div>
    <div className="nca-controls">
      {live && <button type="button" className="nca-pause" onClick={() => setPaused(value => !value)}
        aria-label={paused ? 'Resume lizard animation' : 'Pause lizard animation'}>
        {paused ? 'Resume animation' : 'Pause animation'}
      </button>}
    </div>
  </div>;
}
export default NCAHero;
