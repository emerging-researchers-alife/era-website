import { Link } from '@tanstack/react-router';
import { ChatBubbleLeftRightIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from '../components/ui';
import { InstagramIcon, XIcon } from '../components/ui/icons';
import { EventCard } from '../components/community';
import { QuickLinksBox } from '../components/resources';
import { events } from '../content/events.registry';
import { splitEventOccurrences } from '../lib/events';

const socialPlatforms = [
  {
    name: 'Discord',
    handle: 'ERA Community',
    href: 'https://discord.com/invite/m3qvuXgkZ7',
    icon: ChatBubbleLeftRightIcon,
    description: 'Join our active community for discussions, Q&A, and networking.',
    primary: true,
  },
  {
    name: 'Twitter/X',
    handle: '@ISALstudents',
    href: 'https://x.com/ISALstudents',
    icon: XIcon,
    description: 'Follow us for announcements, news, and ALife updates.',
  },
  {
    name: 'Instagram',
    handle: '@emergingresearchersalife',
    href: 'https://www.instagram.com/emergingresearchersalife/',
    icon: InstagramIcon,
    description: 'Visual updates from events, conferences, and community activities.',
  },
];

export default function CommunityPage() {
  const { upcoming } = splitEventOccurrences(events, Date.now());
  const teaserEvents = upcoming.slice(0, 2);

  return (
    <div className="container-era section-spacing">
      {/* Page Title */}
      <SectionHeading as="h1">Community</SectionHeading>

      {/* Intro */}
      <section className="prose-era mb-12">
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.125rem' }}>
          ERA is a welcoming community for PhD students, post-doctoral researchers, independent
          researchers, and anyone interested in Artificial Life — regardless of background.
        </p>
      </section>

      {/* Discord Hero CTA */}
      <section
        className="p-8 md:p-12 rounded-2xl mb-16"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ChatBubbleLeftRightIcon className="w-10 h-10" style={{ color: 'var(--color-dark)' }} />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2
              className="font-display text-2xl md:text-3xl font-medium mb-2"
              style={{ color: 'var(--color-dark)' }}
            >
              Join Our Discord Server
            </h2>
            <p style={{ color: 'var(--color-dark)', opacity: 0.8 }}>
              Connect with fellow researchers, share your work, ask questions, and join discussions
              about Artificial Life and related fields.
            </p>
          </div>
          <a
            href="https://discord.com/invite/m3qvuXgkZ7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-8 py-4 rounded-xl bg-[var(--color-dark)] text-white font-semibold hover:bg-[var(--color-dark-soft)] transition-colors border-none"
          >
            Join Discord
          </a>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="mb-16">
        <SectionHeading>Connect With Us</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-xl bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow border-none"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-primary-glow)' }}
                >
                  <platform.icon className="w-5 h-5" style={{ color: 'var(--color-primary-dark)' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-dark)' }}>
                    {platform.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {platform.handle}
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {platform.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <SectionHeading className="mb-0">Upcoming Events</SectionHeading>
          <Link
            to="/events"
            className="inline-flex items-center text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors border-none"
          >
            View full calendar
          </Link>
        </div>
        {teaserEvents.length > 0 ? (
          <div className="bg-white rounded-xl shadow-[var(--shadow-sm)] px-4 md:px-6">
            {teaserEvents.map(({ event, occurrence }) => (
              <EventCard
                key={`${event.slug}-${occurrence.startUtc}`}
                event={event}
                occurrence={occurrence}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white shadow-[var(--shadow-sm)]">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No upcoming events are currently scheduled.
            </p>
          </div>
        )}
      </section>

      {/* Continuing Education */}
      <section className="mt-16">
        <SectionHeading>Continuing Education</SectionHeading>
        <div
          className="p-6 md:p-8 rounded-xl"
          style={{ background: 'var(--color-surface-alt)' }}
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary-glow)' }}
            >
              <AcademicCapIcon className="w-7 h-7" style={{ color: 'var(--color-primary-dark)' }} />
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: 'var(--color-dark)' }}
              >
                Learn Together
              </h3>
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                Our Discord community hosts ongoing learning opportunities for members at all levels.
                From paper reading groups to coding workshops, there's always something to explore.
              </p>
              <div className="flex flex-wrap gap-3">
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary-dark)' }}
                >
                  Paper Reading Groups
                </span>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary-dark)' }}
                >
                  Coding Workshops
                </span>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary-dark)' }}
                >
                  Topic Discussions
                </span>
              </div>
              <a
                href="https://discord.com/invite/m3qvuXgkZ7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-[var(--color-primary-dark)] font-medium hover:text-[var(--color-primary)] transition-colors border-none"
              >
                <ChatBubbleLeftRightIcon className="w-[18px] h-[18px]" />
                Join Discord to participate
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* More Resources */}
      <section className="mt-16">
        <SectionHeading>More Resources</SectionHeading>
        <QuickLinksBox />
      </section>
    </div>
  );
}
