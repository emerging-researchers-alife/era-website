/**
 * TypeScript interfaces for the ERA article system.
 *
 * These types define the structure of article frontmatter and metadata
 * used throughout the article processing pipeline and UI components.
 */

/**
 * Author information for article bylines.
 */
export interface Author {
  /** Display name of the author */
  name: string;

  /** Institutional affiliation (e.g., "University of Examples") */
  affiliation?: string;

  /** Personal website or profile URL */
  url?: string;

  /** Twitter/X handle (without @) */
  twitter?: string;

  /** ORCID identifier for academic attribution */
  orcid?: string;

  /** Email address (optional, for correspondence) */
  email?: string;
}

/**
 * Publication status of an article.
 * - draft: Work in progress, not publicly visible
 * - published: Live on the site
 * - peer-reviewed: Has undergone community review process
 */
export type ArticleStatus = 'draft' | 'published' | 'peer-reviewed';

/**
 * YAML frontmatter schema for article Markdown files.
 * Authors fill this out at the top of their .md files.
 */
export interface ArticleFrontmatter {
  // Required fields
  /** Article title */
  title: string;

  /** Publication date in ISO format (YYYY-MM-DD) */
  date: string;

  /** List of authors with their details */
  authors: Author[];

  /** Tags for categorization and filtering */
  tags: string[];

  /** Brief summary (1-3 sentences) for cards and SEO */
  abstract: string;

  // Optional fields
  /** Subtitle or tagline */
  subtitle?: string;

  /** Publication status */
  status?: ArticleStatus;

  /** Whether to feature on homepage */
  featured?: boolean;

  /** Path to thumbnail image for article cards */
  thumbnail?: string;

  /** Path to .bib file for citations */
  bibliography?: string;

  /** DOI if published elsewhere */
  doi?: string;

  /** Date of last significant update */
  lastUpdated?: string;

}

/**
 * Processed article metadata stored in the registry.
 * Generated at build time from frontmatter.
 */
export interface ArticleMetadata extends ArticleFrontmatter {
  /** URL-friendly identifier derived from filename */
  slug: string;

  /** Estimated reading time in minutes */
  readingTime: number;

  /** Word count of the article body */
  wordCount: number;
}

/**
 * Full article data including processed HTML content.
 * Used when rendering an individual article page.
 */
export interface Article extends ArticleMetadata {
  /** Processed HTML content of the article body */
  content: string;

  /** Table of contents extracted from headings */
  tableOfContents: TableOfContentsItem[];

  /** Bibliography entries if article has citations */
  bibliography?: BibliographyEntry[];
}

/**
 * Table of contents item for article navigation.
 */
export interface TableOfContentsItem {
  /** Heading level (1-6) */
  level: number;

  /** Heading text content */
  text: string;

  /** Anchor ID for linking */
  id: string;

  /** Nested headings under this one */
  children?: TableOfContentsItem[];
}

/**
 * Bibliography entry for citations.
 */
export interface BibliographyEntry {
  /** Citation key (e.g., "mordvintsev2020") */
  key: string;

  /** Formatted citation text */
  formatted: string;

  /** Optional DOI link */
  doi?: string;

  /** Optional URL to the paper */
  url?: string;
}

/**
 * Known tags for the article system.
 * Used for validation and filter UI.
 */
export const KNOWN_TAGS = {
  // Article types
  types: ['tutorial', 'explainer', 'research', 'opinion', 'guide', 'recap'] as const,

  // Topics
  topics: [
    'cellular-automata',
    'evolution',
    'neural-networks',
    'emergence',
    'open-ended',
    'artificial-chemistry',
    'robotics',
    'simulation',
    'complexity',
    'self-organization',
  ] as const,

  // Difficulty levels
  levels: ['beginner', 'intermediate', 'advanced'] as const,
} as const;

export type ArticleType = (typeof KNOWN_TAGS.types)[number];
export type ArticleTopic = (typeof KNOWN_TAGS.topics)[number];
export type ArticleLevel = (typeof KNOWN_TAGS.levels)[number];
export type KnownTag = ArticleType | ArticleTopic | ArticleLevel;

/**
 * Primary tags shown in the initial collapsed tag cloud view.
 * Combines article types and difficulty levels.
 */
export const PRIMARY_TAGS = [
  ...KNOWN_TAGS.types,
  ...KNOWN_TAGS.levels,
] as const;

export type PrimaryTag = (typeof PRIMARY_TAGS)[number];
