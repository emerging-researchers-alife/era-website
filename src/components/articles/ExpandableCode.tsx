/**
 * ExpandableCode - Collapsible code block for full scripts.
 * Uses native HTML details/summary for progressive enhancement.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ExpandableCodeProps {
  title: string;
  code: string;
  highlightedHtml?: string;
  language?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function ExpandableCode({
  title,
  code,
  highlightedHtml,
  language = 'python',
  defaultOpen = false,
  className,
}: ExpandableCodeProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  return (
    <div className={clsx('expandable-code', className)}>
      <button
        onClick={handleToggle}
        className="expandable-code-header"
        aria-expanded={isOpen}
      >
        <span className="expandable-code-title">
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="expandable-code-chevron"
          >
            <ChevronRightIcon className="w-[18px] h-[18px]" />
          </motion.span>
          {title}
        </span>

        <span
          onClick={handleCopy}
          className="expandable-code-copy"
          role="button"
          tabIndex={0}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
          <span className="expandable-code-copy-text">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="expandable-code-content"
          >
            {highlightedHtml ? (
              <pre>
                <code
                  className={`language-${language}`}
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </pre>
            ) : (
              <pre>
                <code className={`language-${language}`}>{code}</code>
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Props interface for hydrating ExpandableCode from pre-rendered HTML
 */
export interface ExpandableCodeData {
  title: string;
  code: string;
  highlightedHtml?: string;
  language?: string;
  defaultOpen?: boolean;
}

/**
 * Parse pre-rendered ExpandableCode data from a DOM element
 */
export function parseExpandableCodeData(element: HTMLElement): ExpandableCodeData | null {
  const dataAttr = element.getAttribute('data-expandable-code');
  if (!dataAttr) return null;

  try {
    return JSON.parse(dataAttr);
  } catch (err) {
    console.error('Failed to parse ExpandableCode data:', err);
    return null;
  }
}
