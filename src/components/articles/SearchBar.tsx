/**
 * Search bar component with debounced input for article filtering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search articles...',
  debounceMs = 300,
}: SearchBarProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced change handler
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
      debounceTimer.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Clear handler
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <MagnifyingGlassIcon
        className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className={clsx(
          'w-full h-12 pl-12 pr-12 rounded-xl',
          'bg-white border border-[var(--color-border)]',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
          'transition-shadow'
        )}
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          className={clsx(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'w-8 h-8 rounded-full flex items-center justify-center',
            'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-surface-alt)] transition-colors'
          )}
          aria-label="Clear search"
        >
          <XMarkIcon className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
}
