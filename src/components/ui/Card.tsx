import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = true, padding = 'md', className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const motionProps = hover && !shouldReduceMotion
      ? {
          whileHover: { y: -4, scale: 1.01 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={clsx(
          'bg-white rounded-2xl',
          'shadow-[var(--shadow-md)]',
          hover && 'hover:shadow-[var(--shadow-lg)] cursor-pointer',
          'transition-shadow duration-200',
          paddingStyles[padding],
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
