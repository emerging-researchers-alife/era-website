/**
 * Class name utility: clsx + tailwind-merge.
 * Use for conditional class composition where Tailwind class conflicts
 * need to be resolved (e.g., overriding padding, colors).
 */

import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
