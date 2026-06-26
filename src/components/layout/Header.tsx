import { Link, useRouterState } from '@tanstack/react-router';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useScrolled } from '../../hooks/useScrolled';
import clsx from 'clsx';

interface HeaderProps {
  onMenuClick: () => void;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
];

function isActivePath(currentPath: string, href: string) {
  return href === '/' ? currentPath === href : currentPath === href || currentPath.startsWith(`${href}/`);
}

export function Header({ onMenuClick }: HeaderProps) {
  const scrolled = useScrolled(10);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container-era h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-medium tracking-tight border-none hover:border-none"
          style={{ color: 'var(--color-dark)' }}
        >
          ERA
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = isActivePath(currentPath, link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors border-b-2 pb-1',
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-dark)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-dark)]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-11 h-11 flex items-center justify-center -mr-2 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
