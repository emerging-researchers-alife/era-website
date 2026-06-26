import { useMemo, useState } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { ArrowDownTrayIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from '../components/ui';
import { MonthSection } from '../components/events/MonthSection';
import { PastEvents } from '../components/events/PastEvents';
import { EventSelectionContext } from '../components/events/EventSelectionContext';
import { events } from '../content/events.registry';
import type { ResolvedEventOccurrence } from '../lib/events';
import { buildPastList, buildUpcomingAgenda } from '../lib/events';
import { BASE_PATH } from '../router';

export default function EventsPage() {
  const now = useMemo(() => Date.now(), []);
  const months = useMemo(() => buildUpcomingAgenda(events, now), [now]);
  const past = useMemo(() => buildPastList(events, now), [now]);
  const [activeOccurrence, setActiveOccurrence] = useState<ResolvedEventOccurrence | null>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const modalOpen = pathname !== '/events';

  return (
    <EventSelectionContext.Provider value={{ activeOccurrence, setActiveOccurrence }}>
      {/* Background is inert while the modal route is active (focus + AT). */}
      <div className="container-era py-12 md:py-16" inert={modalOpen || undefined}>
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <SectionHeading as="h1" className="mb-4 mt-0">
              Events
            </SectionHeading>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Townhalls, workshops, and gatherings across the ERA community. Times are
              shown in your local timezone alongside the host's.
            </p>
          </div>

          <a
            href={`${BASE_PATH}/events/era-events.ics`}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-dark)] px-5 font-medium text-white transition-colors hover:bg-[var(--color-dark-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] focus-visible:ring-offset-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
            Subscribe
          </a>
        </header>

        {months.length > 0 ? (
          <div className="space-y-10">
            {months.map((group) => (
              <MonthSection key={group.monthKey} group={group} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-white/60 px-8 py-16 text-center">
            <CalendarDaysIcon
              className="mx-auto mb-4 h-10 w-10 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <p className="text-lg font-medium text-[var(--color-text-secondary)]">
              No upcoming events are scheduled right now.
            </p>
            <p className="mt-1 text-[var(--color-text-muted)]">
              Subscribe to the calendar to hear about the next one.
            </p>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-14">
            <PastEvents items={past} />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" onExitComplete={() => setActiveOccurrence(null)}>
        <Outlet key={pathname} />
      </AnimatePresence>
    </EventSelectionContext.Provider>
  );
}
