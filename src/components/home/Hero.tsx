import { Link } from '@tanstack/react-router';
import { NCAHero } from '../nca/NCAHero';

export function Hero({ compact = false }: { compact?: boolean }) {
  return <section className={`era-hero relative flex items-center justify-center bg-mesh${compact ? ' era-hero-compact' : ''}`}>
    <div className="absolute inset-0 bg-dotgrid opacity-50" aria-hidden="true" />
    <div className="container-era relative z-10 text-center">
      <NCAHero />
      <h1 className="era-hero-title font-display font-medium tracking-tight max-w-4xl mx-auto">
        Emerging Researchers in Artificial Life
      </h1>
      <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
        A community for students, researchers, and anyone curious about Artificial Life.
      </p>
      <div className="era-hero-actions">
        <Link to="/resources" className="era-hero-link era-hero-link-primary" data-umami-event="explore-resources" data-umami-event-location="hero">
          Explore Resources
        </Link>
        <Link to="/community" className="era-hero-link era-hero-link-secondary" data-umami-event="join-community" data-umami-event-location="hero">
          Join Community
        </Link>
      </div>
    </div>
  </section>;
}
