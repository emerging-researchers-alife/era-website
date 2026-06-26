import { type ReactNode } from 'react';
import clsx from 'clsx';

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function SectionHeading({
  children,
  className,
  as: Component = 'h2',
}: SectionHeadingProps) {
  return (
    <Component
      className={clsx(
        'font-display font-medium tracking-tight',
        'mt-8 mb-6',
        className
      )}
      style={{
        fontSize: Component === 'h1' ? 'var(--font-size-h1)' : 'var(--font-size-h2)',
      }}
    >
      {children}
    </Component>
  );
}
