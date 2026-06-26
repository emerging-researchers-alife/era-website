import { Link } from '@tanstack/react-router';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { InstagramIcon, XIcon } from '../ui/icons';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
];

const socialLinks = [
  {
    href: 'https://discord.com/invite/m3qvuXgkZ7',
    label: 'Discord',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    href: 'https://x.com/ISALstudents',
    label: 'Twitter/X',
    icon: XIcon,
  },
  {
    href: 'https://www.instagram.com/emergingresearchersalife/',
    label: 'Instagram',
    icon: InstagramIcon,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-12 mt-auto"
      style={{ background: 'var(--gradient-dark)', color: 'var(--color-text-on-dark)' }}
    >
      <div className="container-era">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* ERA Description */}
          <div>
            <h3
              className="font-display text-lg font-medium mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              ERA
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Emerging Researchers in Artificial Life is an international community
              for students, researchers, and anyone curious about Artificial Life.
            </p>
            <p className="text-sm opacity-60 mt-4">
              ERA is the student group of the{' '}
              <a
                href="https://alife.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--color-primary)] transition-colors border-none"
              >
                International Society for Artificial Life (ISAL)
              </a>
              .
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
              Quick Links
            </h4>
            <nav className="space-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm opacity-80 hover:opacity-100 hover:text-[var(--color-primary)] transition-colors border-none py-2 min-h-11 flex items-center"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
              Connect
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/10 hover:bg-[var(--color-primary)] hover:text-[var(--color-dark)] transition-colors border-none"
                  data-umami-event={`social-${link.label.toLowerCase().replace('/', '-')}`}
                  data-umami-event-location="footer"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm opacity-60">
          <p>&copy; {currentYear} Emerging Researchers in Artificial Life. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
