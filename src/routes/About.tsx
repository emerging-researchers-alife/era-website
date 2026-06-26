import { UserGroupIcon, CalendarIcon, BookOpenIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from '../components/ui';
import { BoardMemberCard, type BoardMember } from '../components/about';

// Board member data - updated December 2024
const boardMembers: BoardMember[] = [
  {
    name: 'Ane Kristine Espeseth',
    role: 'General Chair',
    affiliation: 'University of Oslo, Norway',
  },
  {
    name: 'Piotr Walas',
    role: 'Vice Chair',
    affiliation: 'University of Warsaw, Poland',
  },
  {
    name: 'Martha Emerson',
    role: 'Equity Chair',
    affiliation: 'University of Washington, USA',
  },
  {
    name: 'Earnest Kota Carr',
    role: 'Vice Equity Chair',
    affiliation: 'The University of Tokyo, Japan',
  },
  {
    name: 'Amahury J. L. Díaz',
    role: 'Communications Chair',
    affiliation: 'State University of New York, USA',
  },
  {
    name: 'Ben Gaskin',
    role: 'ISAL Board Representative',
    affiliation: 'University of Sydney, Australia',
  },
  {
    name: 'Harald Michael Ludwig',
    role: 'Lead Conference Chair',
    affiliation: 'TU Wien, Machine Learning Research Unit, Austria',
  },
  {
    name: 'Iliya Zhechev',
    role: 'Conference Chair',
    affiliation: 'Redis/Sofia University, Bulgaria',
  },
  {
    name: 'Adam Rostowski',
    role: 'Conference Chair',
    affiliation: 'University of Sussex',
  },
  {
    name: 'Andy Walsh',
    role: 'Lead Digital Events Chair',
    affiliation: 'Health Monitoring Systems, Inc, USA',
  },
  {
    name: 'Robin "Verity" Vabolis',
    role: 'Digital Events Chair',
    affiliation: 'Hitherto AI, Inc., USA',
    initials: 'RVV',
  },
];

const features = [
  {
    icon: UserGroupIcon,
    title: 'Community',
    description: 'Connect with peers through our Discord server and social media channels.',
  },
  {
    icon: CalendarIcon,
    title: 'Events',
    description: 'Monthly townhalls, annual ALIFE workshop, and networking opportunities.',
  },
  {
    icon: BookOpenIcon,
    title: 'Resources',
    description: 'Access learning materials, the ALife podcast, newsletter, and more.',
  },
];

export default function AboutPage() {
  return (
    <div className="container-era section-spacing">
      {/* Page Title */}
      <SectionHeading as="h1">About ERA</SectionHeading>

      {/* Mission Section */}
      <section className="prose-era">
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.125rem' }}>
          ERA (Emerging Researchers in Artificial Life) is the <strong>student chapter of ISAL</strong>{' '}
          (International Society for Artificial Life). We actively engage the community to support
          the advancement and dissemination of knowledge about Artificial Life.
        </p>
        <p className="mt-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          ERA targets <strong>emerging researchers</strong>, defined inclusively as "anybody seeing
          themselves as such" — including PhD students, post-doctoral researchers, and independent
          researchers in ALife and related fields.
        </p>
      </section>

      {/* What is Artificial Life? */}
      <section className="mt-16">
        <SectionHeading>What is Artificial Life?</SectionHeading>
        <div
          className="p-8 rounded-xl"
          style={{ background: 'var(--color-surface-alt)' }}
        >
          <p
            className="text-lg mb-4"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}
          >
            Artificial Life (ALife) is an interdisciplinary field that uses computational models,
            robotics, and synthetic biology to explore the principles of life.
          </p>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            ALife studies both "life as it is" and "life-as-it-could-be," spanning biology,
            computer science, physics, and complex systems theory. Research areas include
            evolutionary processes, autonomous agents, and biochemical systems synthesis.
          </p>
          <a
            href="https://alife.org/encyclopedia/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--color-primary-dark)] font-medium hover:text-[var(--color-primary)] transition-colors border-none"
          >
            Explore the ISAL Encyclopedia
            <ArrowTopRightOnSquareIcon className="w-[18px] h-[18px]" />
          </a>
        </div>
      </section>

      {/* What We Provide */}
      <section className="mt-16">
        <SectionHeading>What We Provide</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-white shadow-[var(--shadow-sm)]"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'var(--color-primary-glow)' }}
              >
                <feature.icon className="w-6 h-6" style={{ color: 'var(--color-primary-dark)' }} />
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Board Members */}
      <section className="mt-16">
        <SectionHeading>Board Members</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {boardMembers.map((member) => (
            <BoardMemberCard key={member.name} member={member} />
          ))}
        </div>
      </section>

      {/* ISAL Affiliation */}
      <section className="mt-16 p-8 rounded-xl" style={{ background: 'var(--color-dark)', color: 'white' }}>
        <h2 className="font-display text-2xl font-medium mb-4">
          Part of the International Society for Artificial Life
        </h2>
        <p className="opacity-80 max-w-2xl">
          ERA operates as the official student group of ISAL, connecting emerging researchers
          with the broader Artificial Life community. Consider joining ISAL to support our
          mission and gain access to additional benefits.
        </p>
        <a
          href="https://alife.org/membership/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)] font-medium hover:bg-[var(--color-primary-light)] transition-colors border-none"
        >
          Join ISAL
          <span>&rarr;</span>
        </a>
      </section>
    </div>
  );
}
