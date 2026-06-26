/**
 * Reusable hover popup box with Framer Motion animations.
 * Used for footnotes, citations, and other hover-reveal content.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface HoverBoxProps {
  isVisible: boolean;
  position: { x: number; y: number };
  children: React.ReactNode;
  className?: string;
  maxWidth?: number;
}

const variants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
};

const transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

export function HoverBox({
  isVisible,
  position,
  children,
  className,
  maxWidth = 360,
}: HoverBoxProps) {
  // Calculate position to keep box within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - maxWidth - 20),
    y: position.y,
  };

  // Ensure box doesn't go off left edge
  if (adjustedPosition.x < 20) {
    adjustedPosition.x = 20;
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={transition}
          className={clsx(
            'fixed z-50 p-4 rounded-xl bg-white shadow-lg',
            'border border-[var(--color-border)]',
            className
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            maxWidth,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
