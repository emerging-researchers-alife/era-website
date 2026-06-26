/**
 * Unified pipeline configuration for ERA article processing.
 *
 * Transforms Markdown to HTML with support for:
 * - GitHub Flavored Markdown (tables, strikethrough, autolinks)
 * - Math (KaTeX)
 * - Sidenotes (:::sidenote directive)
 * - Figure width variants ({.l-page})
 * - Syntax highlighting (Prism)
 * - Heading anchors
 */

import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';
import type { Root as MdastRoot } from 'mdast';
import type { Root as HastRoot } from 'hast';

// Custom plugins
import { remarkSidenotes } from './remark-sidenotes';
import { remarkFigureWidth } from './remark-figure-width';
import { remarkCodetabs } from './remark-codetabs';
import { remarkDetails } from './remark-details';
import { remarkNCA } from './remark-nca';

/**
 * Create the article processing pipeline.
 * Returns a unified processor that transforms Markdown to HTML.
 */
export function createPipeline(): Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, string> {
  return (
    unified()
      // ========== PARSE STAGE ==========
      // Convert Markdown string to MDAST (Markdown Abstract Syntax Tree)
      .use(remarkParse)

      // ========== MDAST TRANSFORM STAGE ==========
      // GitHub Flavored Markdown: tables, strikethrough, autolinks, task lists
      .use(remarkGfm)

      // Math syntax: $inline$ and $$block$$
      .use(remarkMath)

      // Directive syntax: :::name for container directives
      .use(remarkDirective)

      // Custom: Transform :::sidenote to <aside>
      .use(remarkSidenotes)

      // Custom: Transform :::codetabs to multi-language code blocks
      .use(remarkCodetabs)

      // Custom: Transform :::details to expandable code sections
      .use(remarkDetails)

      // Custom: Transform :::nca to interactive NCA demos
      .use(remarkNCA)

      // Custom: Parse {.l-page} figure attributes
      .use(remarkFigureWidth)

      // ========== MDAST → HAST CONVERSION ==========
      // Convert Markdown AST to HTML AST
      .use(remarkRehype, {
        allowDangerousHtml: true, // Preserve inline HTML from markdown
      })

      // ========== HAST TRANSFORM STAGE ==========
      // Add IDs to headings (e.g., ## Intro → <h2 id="intro">)
      .use(rehypeSlug)

      // Add anchor links to headings
      .use(rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to this section',
        },
        content: {
          type: 'element',
          tagName: 'span',
          properties: { className: ['anchor-icon'] },
          children: [{ type: 'text', value: '#' }],
        },
      })

      // Render math with KaTeX
      .use(rehypeKatex, {
        // KaTeX options
        throwOnError: false, // Don't crash on invalid math
        errorColor: '#cc0000',
      })

      // Syntax highlighting with Prism
      .use(rehypePrismPlus, {
        ignoreMissing: true, // Don't error on unknown languages
        showLineNumbers: true, // Show line numbers by default
      })

      // ========== OUTPUT STAGE ==========
      // Serialize HAST to HTML string
      .use(rehypeStringify, {
        allowDangerousHtml: true, // Include inline HTML
      })
  );
}

/**
 * Create a minimal pipeline for extracting the HAST tree
 * (used for TOC extraction before stringify).
 */
export function createHastPipeline(): Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, HastRoot> {
  return (
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkDirective)
      .use(remarkSidenotes)
      .use(remarkCodetabs)
      .use(remarkDetails)
      .use(remarkNCA)
      .use(remarkFigureWidth)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      // Stop here - we want the HAST tree, not stringified HTML
  );
}
