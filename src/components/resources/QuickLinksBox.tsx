import { BookOpenIcon, SpeakerWaveIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const quickLinks = [
  {
    title: 'ISAL Encyclopedia',
    description: 'Comprehensive encyclopedia of Artificial Life concepts and terminology.',
    href: 'https://alife.org/encyclopedia/',
    icon: BookOpenIcon,
  },
  {
    title: 'What ALife! Podcast',
    description: 'Explore ALife topics and interviews with scientists on Spotify.',
    href: 'https://open.spotify.com/show/3u2WswlGc9tThXCYHonUGy',
    icon: SpeakerWaveIcon,
  },
  {
    title: 'ALife Newsletter',
    description: 'Stay updated with the latest news and research in Artificial Life.',
    href: 'https://github.com/ALife-Newsletter/Newsletter',
    icon: NewspaperIcon,
  },
];

export function QuickLinksBox() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {quickLinks.map((link) => (
        <motion.a
          key={link.title}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center p-4 rounded-xl bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow text-center border-none"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
            style={{ background: 'var(--color-primary-glow)' }}
          >
            <link.icon className="w-6 h-6" style={{ color: 'var(--color-primary-dark)' }} />
          </div>
          <h3
            className="font-semibold text-sm mb-1 line-clamp-1"
            style={{ color: 'var(--color-dark)' }}
          >
            {link.title}
          </h3>
          <p
            className="text-xs line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {link.description}
          </p>
        </motion.a>
      ))}
    </div>
  );
}
