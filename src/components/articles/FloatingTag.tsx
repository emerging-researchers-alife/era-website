/**
 * Tag pill component with layout animations.
 * Used within the TagCloud component.
 */

import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

export interface FloatingTagProps {
  tag: string;
  isSelected: boolean;
  isPrimary: boolean;
  isFaded?: boolean;
  cooccurrenceStrength?: number;
  onClick: () => void;
}

export function FloatingTag({
  tag,
  isSelected,
  isPrimary,
  isFaded = false,
  cooccurrenceStrength = 1,
  onClick,
}: FloatingTagProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      layout
      layoutId={`tag-${tag}`}
      onClick={onClick}
      initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isFaded ? 0.5 : 1,
        scale: 1,
      }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: shouldReduceMotion ? 400 : 300,
          damping: shouldReduceMotion ? 40 : 25,
        },
        opacity: { duration: 0.2 },
        scale: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      className={clsx(
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        'cursor-pointer select-none whitespace-nowrap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        'focus:outline-none',
        // Selected state
        isSelected && [
          'bg-[var(--color-primary)] text-[var(--color-dark)]',
          'shadow-md shadow-[var(--color-primary)]/25',
        ],
        // Primary unselected
        !isSelected &&
          isPrimary && [
            'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-border)]',
            'border border-[var(--color-border)]',
          ],
        // Secondary (co-occurring) tags
        !isSelected &&
          !isPrimary && [
            'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
            'hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-secondary)]',
            'border border-[var(--color-border)]/60',
          ]
      )}
      style={{
        // Scale font size slightly based on co-occurrence strength for secondary tags
        fontSize: !isPrimary ? `${0.8 + cooccurrenceStrength * 0.15}rem` : undefined,
      }}
      aria-pressed={isSelected}
    >
      {tag}
    </motion.button>
  );
}
