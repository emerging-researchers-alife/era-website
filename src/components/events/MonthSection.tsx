import { motion, useReducedMotion } from 'framer-motion';
import type { MonthGroup } from '../../lib/events';
import { EventItem } from './EventItem';

interface MonthSectionProps {
  group: MonthGroup;
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export function MonthSection({ group }: MonthSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="grid gap-3 border-t border-[var(--color-border-strong)] pt-6 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-8">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] lg:sticky lg:top-[88px] lg:self-start lg:pt-1">
        {group.label}
      </h2>

      <motion.div
        variants={shouldReduceMotion ? undefined : listVariants}
        initial={shouldReduceMotion ? undefined : 'hidden'}
        whileInView={shouldReduceMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-10% 0px' }}
      >
        {group.items.map((entry) => (
          <motion.div
            key={entry.event.slug}
            variants={shouldReduceMotion ? undefined : itemVariants}
          >
            <EventItem entry={entry} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
