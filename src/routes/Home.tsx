import { UserGroupIcon, BookOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Hero, CTASidebar, QuickLinkCard } from '../components/home';
import { SectionHeading } from '../components/ui';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Main Content with Sidebar */}
      <div className="container-era section-spacing">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* CTA Cards - Mobile/Tablet only */}
            <div className="lg:hidden mb-12">
              <CTASidebar />
            </div>

            {/* What is ERA Section */}
            <section>
              <SectionHeading>What is ERA?</SectionHeading>
              <div className="prose-era">
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  ERA (Emerging Researchers in Artificial Life) is an international community
                  for students, researchers, and anyone curious about Artificial Life. We provide
                  a welcoming space to connect, share your work, and build lasting
                  relationships with peers across the globe.
                </p>
                <p className="mt-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  Whether you're studying evolutionary computation, synthetic biology,
                  agent-based modeling, or any other area of ALife research, ERA offers
                  resources, events, and a vibrant community to support your journey.
                </p>
              </div>
            </section>

            {/* Quick Links Section */}
            <section className="mt-16">
              <SectionHeading>Explore</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickLinkCard
                  to="/community"
                  icon={UserGroupIcon}
                  title="Community"
                  description="Join our Discord, follow us on social media, and attend our monthly events."
                />
                <QuickLinkCard
                  to="/resources"
                  icon={BookOpenIcon}
                  title="Resources"
                  description="Discover learning materials, the ALife podcast, newsletter, and more."
                />
                <QuickLinkCard
                  to="/about"
                  icon={InformationCircleIcon}
                  title="About ERA"
                  description="Learn about our mission, meet the board, and our connection to ISAL."
                />
              </div>
            </section>
          </div>

          {/* Sticky Sidebar - Desktop only */}
          <CTASidebar
            className="hidden lg:block w-[280px] flex-shrink-0 sticky top-24 h-fit"
          />
        </div>
      </div>
    </>
  );
}
