import { Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Focus trap: keep focus within drawer when open
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    // Focus the close button when drawer opens
    closeButtonRef.current?.focus();

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[80vw] bg-white z-50 shadow-xl"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-4">
              {navLinks.map((link) => {
                const isActive = isActivePath(currentPath, link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center h-14 px-4 rounded-lg text-base font-medium transition-colors border-none',
                      isActive
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]'
                        : 'text-[var(--color-text-primary)] hover:bg-black/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-[var(--color-border)]"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
            >
              <a
                href="https://discord.com/invite/m3qvuXgkZ7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 w-full rounded-lg bg-[var(--color-primary)] text-[var(--color-dark)] font-medium border-none hover:bg-[var(--color-primary-light)] transition-colors"
                data-umami-event="join-discord"
                data-umami-event-location="mobile-drawer"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Join Discord
              </a>
              <a
                href="https://alife.org/membership/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 w-full rounded-lg bg-[var(--color-dark)] text-white font-medium border-none hover:bg-[var(--color-dark-soft)] transition-colors"
                data-umami-event="join-isal"
                data-umami-event-location="mobile-drawer"
              >
                <UserGroupIcon className="w-5 h-5" />
                Join ISAL
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
