import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { Badge } from '../ui';

export function MiniconAnnouncement() {
  return (
    <aside
      aria-label="ERA Minicon announcement"
      className="border-y border-[var(--color-border)] bg-white"
    >
      <Link
        to="/minicon"
        className="container-era flex h-14 items-center justify-between gap-4 border-none text-[var(--color-dark)] hover:border-none"
        data-umami-event="minicon-announcement-click"
        data-umami-event-location="homepage"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Badge variant="secondary" className="shrink-0">16 Aug</Badge>
          <span className="truncate text-sm font-semibold sm:text-base">ERA Minicon 2026</span>
          <span className="hidden text-sm text-[var(--color-text-secondary)] md:inline">
            Waterloo and online
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--color-dark)]">
          <span className="hidden sm:inline">View programme</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </aside>
  );
}
