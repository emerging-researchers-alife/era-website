import { useEffect, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  MINICON_CALENDAR_URL,
  MINICON_DISCORD_URL,
  MINICON_PDF_URL,
  MINICON_TIMEZONE,
  formatScheduleRange,
  miniconSchedule,
  miniconSpeakers,
} from '../content/minicon-2026';

const PAGE_TITLE = 'ERA Minicon 2026 | Emerging Researchers in Artificial Life';
const PAGE_DESCRIPTION = 'A free one-day hybrid Artificial Life gathering in Waterloo and online on 16 August 2026.';
const PAGE_URL = 'https://emergingresearchers.life/minicon';

const factItems = [
  {
    icon: CalendarDaysIcon,
    label: 'When',
    value: 'Sunday, 16 August 2026',
  },
  {
    icon: MapPinIcon,
    label: 'Where',
    value: 'Waterloo, Canada',
  },
  {
    icon: VideoCameraIcon,
    label: 'Format',
    value: 'Hybrid event',
  },
  {
    icon: UserGroupIcon,
    label: 'Access',
    value: 'Free for the ERA community',
  },
];

function useMiniconMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonical = previousCanonical ?? document.createElement('link');
    const previousCanonicalHref = previousCanonical?.href;

    if (!previousCanonical) {
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    const metadata = [
      ['meta[name="description"]', PAGE_DESCRIPTION],
      ['meta[property="og:url"]', PAGE_URL],
      ['meta[property="og:title"]', PAGE_TITLE],
      ['meta[property="og:description"]', PAGE_DESCRIPTION],
      ['meta[name="twitter:url"]', PAGE_URL],
      ['meta[name="twitter:title"]', PAGE_TITLE],
      ['meta[name="twitter:description"]', PAGE_DESCRIPTION],
    ] as const;
    const previousMetadata = metadata.map(([selector, value]) => {
      const element = document.head.querySelector<HTMLMetaElement>(selector);
      const previousValue = element?.getAttribute('content');
      element?.setAttribute('content', value);
      return { element, previousValue };
    });

    document.title = PAGE_TITLE;
    canonical.href = PAGE_URL;

    return () => {
      document.title = previousTitle;
      previousMetadata.forEach(({ element, previousValue }) => {
        if (element && previousValue !== null && previousValue !== undefined) {
          element.setAttribute('content', previousValue);
        }
      });
      if (previousCanonical && previousCanonicalHref) {
        canonical.href = previousCanonicalHref;
      } else {
        canonical.remove();
      }
    };
  }, []);
}

export default function MiniconPage() {
  useMiniconMetadata();

  const localTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );
  const showSeparateLocalTime = localTimeZone !== MINICON_TIMEZONE;

  return (
    <article>
      <header className="relative overflow-hidden bg-mesh">
        <div className="absolute inset-0 bg-dotgrid opacity-50" aria-hidden="true" />
        <div className="container-era relative z-10 py-14 md:py-20">
          <p className="mb-4 border-l-2 border-[var(--color-primary)] pl-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            ERA community event
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.98] tracking-tight text-[var(--color-dark)]">
            ERA Minicon 2026
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
            A free day of talks, practical guidance, and community for emerging Artificial Life researchers.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={MINICON_PDF_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--color-dark)] px-5 font-medium text-white transition-colors hover:border-transparent hover:bg-[var(--color-dark-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)] focus-visible:ring-offset-2"
              data-umami-event="minicon-pdf-download"
              data-umami-event-location="minicon-hero"
            >
              <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
              Download programme
            </a>
            <a
              href={MINICON_CALENDAR_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-white px-5 font-medium text-[var(--color-dark)] transition-colors hover:border-[var(--color-primary-dark)] hover:bg-[var(--color-surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)] focus-visible:ring-offset-2"
            >
              <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
              Add to calendar
            </a>
          </div>

          <dl className="mt-12 grid gap-x-8 gap-y-6 border-t border-[var(--color-border-strong)] pt-7 sm:grid-cols-2 lg:grid-cols-4">
            {factItems.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[1.25rem_1fr] gap-x-3">
                <fact.icon className="mt-1 h-5 w-5 text-[var(--color-primary-dark)]" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-medium text-[var(--color-text-secondary)]">{fact.label}</dt>
                  <dd className="mt-1 font-medium text-[var(--color-dark)]">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-era py-14 md:py-20">
        <section className="grid gap-8 border-b border-[var(--color-border)] pb-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-medium text-[var(--color-dark)] md:text-4xl">
              One day before ALIFE 2026
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              The Minicon runs from 9:00 AM to 5:15 PM EDT in Waterloo, with remote sessions and a livestream for online attendees. The AMMCS-ALIFE Welcoming Reception follows at 7:00 PM EDT.
            </p>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-alt)] p-6">
            <h3 className="font-body text-base font-semibold text-[var(--color-dark)]">
              No registration or conference ticket needed
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              The Minicon is free for everyone in the ERA server. Join Discord for livestream updates, speaker threads, and live Q&amp;A.
            </p>
            <a
              href={MINICON_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--color-dark)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)] focus-visible:ring-offset-2"
              data-umami-event="minicon-discord-click"
              data-umami-event-location="minicon-access"
            >
              Join ERA on Discord
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="py-14 md:py-20" aria-labelledby="minicon-schedule-heading">
          <div className="max-w-3xl">
            <h2 id="minicon-schedule-heading" className="font-display text-3xl font-medium text-[var(--color-dark)] md:text-4xl">
              Programme
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
              Waterloo time is EDT. Your local time is shown alongside it{showSeparateLocalTime ? ` in ${localTimeZone.replaceAll('_', ' ')}` : ''}.
            </p>
          </div>

          <div className="mt-10">
            <div className="hidden grid-cols-[10rem_13.5rem_minmax(0,1fr)] gap-6 border-b border-[var(--color-border-strong)] pb-3 text-sm font-medium text-[var(--color-text-secondary)] md:grid">
              <span>Waterloo</span>
              <span>Your time</span>
              <span>Session</span>
            </div>
            <ol>
              {miniconSchedule.map((session) => (
                <li
                  key={session.id}
                  className={clsx(
                    'grid gap-3 border-b border-[var(--color-border)] py-5 md:grid-cols-[10rem_13.5rem_minmax(0,1fr)] md:gap-6',
                    session.kind === 'break' && 'text-[var(--color-text-secondary)]'
                  )}
                >
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:hidden">Waterloo</span>
                    <time dateTime={session.start} className="font-mono text-sm font-medium text-[var(--color-dark)]">
                      {formatScheduleRange(session, MINICON_TIMEZONE)}
                    </time>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:hidden">Your time</span>
                    <span className="font-mono text-sm text-[var(--color-text-secondary)]">
                      {showSeparateLocalTime ? formatScheduleRange(session, localTimeZone) : 'Same as Waterloo'}
                    </span>
                  </div>
                  <div>
                    <h3 className={clsx(
                      'font-body text-base font-semibold leading-snug',
                      session.kind === 'break' ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-dark)]'
                    )}>
                      {session.title}
                    </h3>
                    {(session.speaker || session.mode) && (
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {[session.speaker, session.mode].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {session.notes && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--color-border-strong)] py-14 md:py-20" aria-labelledby="minicon-speakers-heading">
          <h2 id="minicon-speakers-heading" className="font-display text-3xl font-medium text-[var(--color-dark)] md:text-4xl">
            Speakers
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {miniconSpeakers.map((speaker) => (
              <article key={speaker.name} className="border-t border-[var(--color-border-strong)] pt-6">
                <h3 className="font-display text-2xl font-medium text-[var(--color-dark)]">
                  {speaker.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                  {speaker.affiliation.map((part, index) => part.href ? (
                    <a
                      key={`${speaker.name}-${index}`}
                      href={part.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-dark)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dark)] focus-visible:ring-offset-2"
                    >
                      {part.label}
                    </a>
                  ) : (
                    <span key={`${speaker.name}-${index}`}>{part.label}</span>
                  ))}
                </p>
                <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
                  {speaker.background}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-dark)]">
                  <span className="font-semibold">Talk:</span> {speaker.talk}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-[var(--color-border-strong)] py-14 md:py-20 lg:grid-cols-2 lg:gap-16" aria-labelledby="minicon-participation-heading">
          <div>
            <h2 id="minicon-participation-heading" className="font-display text-3xl font-medium text-[var(--color-dark)]">
              Ask questions early
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
              Each speaker announcement has its own thread in the ERA server. Post questions early and make them specific so organisers can work them into the live Q&amp;A.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium text-[var(--color-dark)]">
              Related workshop
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
              Artificial Life in the Wild takes place on 18 August during ALIFE 2026 at the University of Waterloo. The conference runs 17-21 August 2026, and virtual presentations are possible.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Organised by Botao “Amber” H. (Oxford), Helena Rong (NYU Shanghai), and Joel Lehman (Oxford).
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
