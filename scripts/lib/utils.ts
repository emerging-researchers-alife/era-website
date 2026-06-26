/**
 * Utility functions for article processing.
 */

import type { Root, Element } from 'hast';
import type { TableOfContentsItem } from '../../src/content/types';
import { visit } from 'unist-util-visit';

/**
 * Calculate word count from Markdown content.
 * Strips code blocks, math, and frontmatter.
 */
export function calculateWordCount(content: string): number {
  // Remove code blocks
  let text = content.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');
  // Remove math blocks
  text = text.replace(/\$\$[\s\S]*?\$\$/g, '');
  // Remove inline math
  text = text.replace(/\$[^$]+\$/g, '');
  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Remove directives
  text = text.replace(/:::[a-z]+[\s\S]*?:::/g, '');

  // Split on whitespace and filter empty strings
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Calculate estimated reading time in minutes.
 * Based on average reading speed of 200 words per minute.
 */
export function calculateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Extract table of contents from processed HAST tree.
 * Returns a flat list of headings with their levels.
 */
export function extractTableOfContents(tree: Root): TableOfContentsItem[] {
  const toc: TableOfContentsItem[] = [];

  visit(tree, 'element', (node: Element) => {
    // Match h1-h6 elements
    const match = /^h([1-6])$/.exec(node.tagName);
    if (!match) return;

    const level = parseInt(match[1], 10);
    const id = (node.properties?.id as string) || '';

    // Extract text content from heading
    const text = extractText(node);

    if (text && id) {
      toc.push({ level, text, id });
    }
  });

  return toc;
}

/**
 * Recursively extract text content from a HAST node.
 */
function extractText(node: Element | { type: string; value?: string }): string {
  if (node.type === 'text' && 'value' in node) {
    return node.value || '';
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children
      .map((child) => extractText(child as Element))
      .join('');
  }

  return '';
}

/**
 * Generate a URL-friendly slug from a filename.
 */
export function slugify(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
