import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { Button } from '../ui';
import { NCACanvas } from '../nca';
import type { LayerWeights } from '../nca/nca-ca';

// Import the model weights directly (Bun imports JSON as object)
import lizardWeights from '../../assets/nca/lizard.json';

// Hook to detect mobile for smaller NCA grid
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const containerVariantsReduced = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Smaller NCA grid on mobile (80% of desktop)
  const ncaSize = isMobile ? 72 : 96;

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 72,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center bg-mesh overflow-hidden">
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 bg-dotgrid opacity-50" />

      <motion.div
        className="container-era relative z-10 text-center pt-3 pb-6"
        variants={shouldReduceMotion ? containerVariantsReduced : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* NCA Animation - Lizard growing above title */}
        {!shouldReduceMotion && (
          <motion.div
            variants={itemVariants}
            className="nca-hero-wrapper"
            role="img"
            aria-label="Animated Neural Cellular Automaton growing a lizard pattern - an example of artificial life research"
          >
            <NCACanvas
              width={ncaSize}
              height={ncaSize}
              weights={lizardWeights as LayerWeights[]}
              transparent
              className="nca-canvas"
            />
          </motion.div>
        )}

        <motion.h1
          variants={shouldReduceMotion ? itemVariantsReduced : itemVariants}
          className="font-display font-medium tracking-tight max-w-4xl mx-auto"
          style={{ fontSize: 'var(--font-size-hero)', lineHeight: 1.1 }}
        >
          Emerging Researchers in Artificial Life
        </motion.h1>

        <motion.p
          variants={shouldReduceMotion ? itemVariantsReduced : itemVariants}
          className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          A community for students, researchers, and anyone curious about Artificial Life.
        </motion.p>

        <motion.div
          variants={shouldReduceMotion ? itemVariantsReduced : itemVariants}
          className="mt-8 flex gap-4 justify-center flex-wrap"
        >
          <Link to="/resources" data-umami-event="explore-resources" data-umami-event-location="hero">
            <Button variant="primary" size="lg" glow>
              Explore Resources
            </Button>
          </Link>
          <Link to="/community" data-umami-event="join-community" data-umami-event-location="hero">
            <Button variant="secondary" size="lg">
              Join Community
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { delay: 1.2, duration: 0.5 }}
        aria-label="Scroll to content"
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={shouldReduceMotion ? undefined : { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDownIcon className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </motion.button>
    </section>
  );
}
