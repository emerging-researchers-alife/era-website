/**
 * CodeTabs - Multi-language code block component with tabbed interface.
 * Allows users to switch between PyTorch, MLX, and JAX implementations.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Storage key for persisting framework preference
const STORAGE_KEY = 'era-preferred-framework';

// Custom event name for syncing preferences across all CodeTabs on the page
const PREFERENCE_CHANGE_EVENT = 'era-framework-preference-change';

// Framework identifiers
export type Framework = 'pytorch' | 'mlx' | 'jax';

// Display names for tabs
const FRAMEWORK_LABELS: Record<Framework, string> = {
  pytorch: 'PyTorch',
  mlx: 'MLX',
  jax: 'JAX',
};

interface CodeBlock {
  framework: Framework;
  code: string;
  highlightedHtml?: string;
}

interface CodeTabsProps {
  blocks: CodeBlock[];
  className?: string;
}

/**
 * Get the user's preferred framework from localStorage, or default to PyTorch
 */
function getStoredPreference(): Framework {
  if (typeof window === 'undefined') return 'pytorch';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'pytorch' || stored === 'mlx' || stored === 'jax')) {
    return stored;
  }
  return 'pytorch';
}

/**
 * Store the user's framework preference and broadcast to other CodeTabs
 */
function setStoredPreference(framework: Framework): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, framework);
    // Dispatch custom event to sync all CodeTabs on the page
    window.dispatchEvent(
      new CustomEvent(PREFERENCE_CHANGE_EVENT, { detail: { framework } })
    );
  }
}

export function CodeTabs({ blocks, className }: CodeTabsProps) {
  const [activeFramework, setActiveFramework] = useState<Framework>('pytorch');
  const [copied, setCopied] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const preference = getStoredPreference();
    // Only use preference if we have code for that framework
    const hasPreferred = blocks.some((b) => b.framework === preference);
    setActiveFramework(hasPreferred ? preference : blocks[0]?.framework || 'pytorch');
  }, [blocks]);

  // Listen for preference changes from other CodeTabs on the page
  useEffect(() => {
    const handlePreferenceChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ framework: Framework }>;
      const newFramework = customEvent.detail.framework;
      // Only switch if we have code for the new framework
      const hasFramework = blocks.some((b) => b.framework === newFramework);
      if (hasFramework) {
        setActiveFramework(newFramework);
        setCopied(false);
      }
    };

    window.addEventListener(PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
    };
  }, [blocks]);

  // Get available frameworks from the provided blocks
  const availableFrameworks = blocks.map((b) => b.framework);

  // Get the active code block
  const activeBlock = blocks.find((b) => b.framework === activeFramework) || blocks[0];

  const handleTabClick = useCallback((framework: Framework) => {
    setActiveFramework(framework);
    setStoredPreference(framework);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!activeBlock) return;
    try {
      await navigator.clipboard.writeText(activeBlock.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [activeBlock]);

  if (!blocks.length) return null;

  return (
    <div className={clsx('code-tabs', className)}>
      {/* Tab bar */}
      <div className="code-tabs-header">
        <div className="code-tabs-list" role="tablist">
          {availableFrameworks.map((framework) => (
            <button
              key={framework}
              role="tab"
              aria-selected={activeFramework === framework}
              onClick={() => handleTabClick(framework)}
              className={clsx(
                'code-tab',
                activeFramework === framework && 'code-tab-active'
              )}
            >
              {FRAMEWORK_LABELS[framework]}
              {activeFramework === framework && (
                <motion.div
                  layoutId="code-tab-indicator"
                  className="code-tab-indicator"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="code-tabs-copy"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="code-tabs-copy-icon"
              >
                <CheckIcon className="w-3.5 h-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="code-tabs-copy-icon"
              >
                <ClipboardIcon className="w-3.5 h-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="code-tabs-copy-text">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code panel */}
      <div className="code-tabs-panel" role="tabpanel">
        <AnimatePresence mode="wait">
          {activeBlock && (
            <motion.div
              key={activeBlock.framework}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeBlock.highlightedHtml ? (
                <pre>
                  <code
                    className="language-python"
                    dangerouslySetInnerHTML={{ __html: activeBlock.highlightedHtml }}
                  />
                </pre>
              ) : (
                <pre>
                  <code className="language-python">{activeBlock.code}</code>
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Props interface for hydrating CodeTabs from pre-rendered HTML
 */
export interface CodeTabsData {
  blocks: CodeBlock[];
}

/**
 * Parse pre-rendered CodeTabs data from a DOM element
 */
export function parseCodeTabsData(element: HTMLElement): CodeTabsData | null {
  const dataAttr = element.getAttribute('data-codetabs');
  if (!dataAttr) return null;

  try {
    return JSON.parse(dataAttr);
  } catch (err) {
    console.error('Failed to parse CodeTabs data:', err);
    return null;
  }
}
