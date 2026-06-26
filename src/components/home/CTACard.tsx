import { motion } from 'framer-motion';
import type { ComponentType, SVGProps } from 'react';
import clsx from 'clsx';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
type CTAVariant = 'primary' | 'secondary';

interface CTACardProps {
  icon: IconComponent;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  variant?: CTAVariant;
}

export function CTACard({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
  variant = 'primary',
}: CTACardProps) {
  const isPrimary = variant === 'primary';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'block p-5 rounded-xl transition-shadow border-none',
        isPrimary
          ? 'bg-[var(--color-primary)] text-[var(--color-dark)] hover:shadow-[var(--shadow-glow)]'
          : 'bg-[var(--color-dark)] text-white hover:shadow-[var(--shadow-lg)]'
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
          isPrimary ? 'bg-white/20' : 'bg-white/10'
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base mb-1">{title}</h3>

      {/* Description */}
      <p
        className={clsx(
          'text-sm mb-4',
          isPrimary ? 'opacity-80' : 'opacity-70'
        )}
      >
        {description}
      </p>

      {/* Button */}
      <span
        className={clsx(
          'inline-flex items-center text-sm font-medium',
          isPrimary ? 'text-[var(--color-dark)]' : 'text-[var(--color-primary)]'
        )}
      >
        {buttonText}
        <span className="ml-1">&rarr;</span>
      </span>
    </motion.a>
  );
}
