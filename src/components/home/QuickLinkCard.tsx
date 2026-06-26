import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

interface QuickLinkCardProps {
  to: string;
  icon: IconComponent;
  title: string;
  description: string;
}

export function QuickLinkCard({ to, icon: Icon, title, description }: QuickLinkCardProps) {
  return (
    <Link to={to} className="block border-none">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="h-full p-6 bg-white rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow"
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ background: 'var(--color-primary-glow)' }}
        >
          <Icon className="w-6 h-6" style={{ color: 'var(--color-primary-dark)' }} />
        </div>
        <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-dark)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </motion.div>
    </Link>
  );
}
