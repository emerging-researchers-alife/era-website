/**
 * 404 Not Found page component.
 */

import { Link } from '@tanstack/react-router';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="container-era section-spacing">
      <div className="max-w-lg mx-auto text-center">
        <div
          className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface-alt)' }}
        >
          <span className="text-4xl font-display font-medium" style={{ color: 'var(--color-text-muted)' }}>
            404
          </span>
        </div>

        <SectionHeading as="h1">Page Not Found</SectionHeading>

        <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)] font-medium hover:bg-[var(--color-primary-light)] transition-colors border-none"
          >
            <HomeIcon className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
